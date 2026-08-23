/* TYCHO client-side BM25 retrieval with soft syllabus relevance boosts. */
const TychoRAG = (() => {
  const NORMALIZE = [
    [/semi[\s-]?major/g, "semimajor"],
    [/semi[\s-]?minor/g, "semiminor"],
    [/vis[\s-]?viva/g, "visviva"],
    [/two[\s-]?body/g, "twobody"],
    [/three[\s-]?body/g, "threebody"],
    [/n[\s-]?body/g, "nbody"],
    [/delta[\s-]?v\b/g, "deltav"],
    [/\bdv\b/g, "deltav"],
    [/f\s*&\s*g/g, "f and g"],
    [/ground[\s-]?track/g, "groundtrack"],
    [/torque[\s-]?free/g, "torquefree"],
    [/reaction[\s-]?wheels?\b/g, "reactionwheel"],
    [/gimbal[\s-]?lock/g, "gimballock"],
    [/patched[\s-]?conics?\b/g, "patchedconic"]
  ];

  const STOP = new Set(("how do i we you your find get compute calculate derive explain tell show the a an of and or " +
    "to from for in on with is are was what why when where which it its this that these using use used between " +
    "can could should would does did not no yes my me us if then about there here also just like need want help " +
    "please problem question hi hello hey tycho thanks thank ok okay yes yeah sure got make makes made sense exam " +
    "topic topics class course today tonight review material").split(" "));

  const SYN = {
    semimajor: ["axis", "energy"],
    velocity: ["visviva", "speed"],
    speed: ["velocity", "visviva"],
    fast: ["speed", "velocity", "visviva"],
    raan: ["ascending", "node", "regression"],
    j2: ["oblateness", "perturbation"],
    deltav: ["impulse", "maneuver"],
    hohmann: ["transfer", "coplanar"],
    lambert: ["boundary", "transfer", "targeting"],
    quaternion: ["euler", "parameter", "attitude"],
    quaternions: ["euler", "parameter", "attitude"],
    gimballock: ["singularity", "euler", "angle"],
    dcm: ["direction", "cosine", "matrix", "rotation"],
    patchedconic: ["sphere", "influence", "transfer"],
    reactionwheel: ["momentum", "exchange", "control"],
    gibbs: ["position", "vectors", "velocity"],
    gauss: ["observation", "angles", "orbit"]
  };

  const SECTION_ROUTES = [
    {
      query: /(?:perigee|periapsis|apogee|apoapsis).*(?:fast|speed|velocity)|(?:fast|speed|velocity).*(?:perigee|periapsis|apogee|apoapsis)/,
      sections: { K: [/^2\.3\.2(?:\.|\s|$)/i, /^2\.5(?:\.|\s|$)/i], SJ: [/^8\.3\.3(?:\.|\s|$)/i] }
    },
    {
      query: /gimballock/,
      sections: { SJ: [/^3\.2(?:\.|\s|$)/i] }
    },
    {
      query: /quaternion|eulerparameter/,
      sections: { SJ: [/^3\.4(?:\.|\s|$)/i] }
    },
    {
      query: /patchedconic/,
      sections: { K: [/^10\.2(?:\.|\s|$)/i], SJ: [/^12\.5(?:\.|\s|$)/i] }
    }
  ];

  let chunks = [];
  let docs = [];
  let df = new Map();
  let avgdl = 0;
  let scope = null;
  let compiledTopics = [];
  let ready = false;

  function normalizeText(text) {
    let s = String(text || "").toLowerCase();
    for (const [re, rep] of NORMALIZE) s = s.replace(re, rep);
    return s;
  }

  function tokenize(text) {
    const raw = normalizeText(text).match(/[a-z]{2,}|[a-z]\d+|\d+/g) || [];
    return raw.filter(w => !STOP.has(w));
  }

  function compileScope(data) {
    return (data.topics || []).map(topic => {
      const patterns = {};
      for (const [book, values] of Object.entries(topic.section_patterns || {})) {
        patterns[book] = values.map(value => new RegExp(value, "i"));
      }
      return { ...topic, patterns };
    });
  }

  function topicMatchesSection(topic, chunk) {
    return (topic.patterns[chunk.b] || []).some(re => re.test(chunk.s || ""));
  }

  function classify(query) {
    const q = normalizeText(query);
    const matches = compiledTopics.map(topic => {
      const terms = (topic.query_terms || []).map(normalizeText);
      const hits = terms.filter(term => term && q.includes(term));
      const score = hits.reduce((sum, term) => sum + Math.max(1, term.length / 5), 0);
      return { topic, hits, score };
    }).filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);

    const strongest = matches.length ? matches[0].score : 0;
    return matches.filter(match => match.score === strongest).map(({ topic, hits, score }) => ({
      id: topic.id,
      label: topic.label,
      status: topic.status,
      retrievalEnabled: Boolean(topic.retrieval_enabled),
      matchedTerms: hits,
      score,
      textbookCoverage: topic.textbook_coverage || "available",
      coverageNote: topic.coverage_note || ""
    }));
  }

  async function init(chunksUrl, scopeUrl = "course_scope.json") {
    ready = false;
    df = new Map();
    const [chunksRes, scopeRes] = await Promise.all([fetch(chunksUrl), fetch(scopeUrl)]);
    if (!chunksRes.ok) throw new Error("TychoRAG: failed to load " + chunksUrl);
    if (!scopeRes.ok) throw new Error("TychoRAG: failed to load " + scopeUrl);

    const data = await chunksRes.json();
    scope = await scopeRes.json();
    compiledTopics = compileScope(scope);
    chunks = Array.isArray(data.chunks) ? data.chunks : [];

    let total = 0;
    docs = chunks.map(chunk => {
      const tf = new Map();
      for (const word of tokenize((chunk.t || "") + " " + (chunk.s || ""))) {
        tf.set(word, (tf.get(word) || 0) + 1);
      }
      let len = 0;
      for (const value of tf.values()) len += value;
      total += len;
      for (const word of tf.keys()) df.set(word, (df.get(word) || 0) + 1);
      const exerciseHeading = /(?:repeat problem|^\d+\.\d+\s+(?:determine|derive|write|consider|figure|given)\b)/i.test(chunk.s || "");
      const topicIds = exerciseHeading
        ? []
        : compiledTopics.filter(topic => topicMatchesSection(topic, chunk)).map(topic => topic.id);
      const nonContentSection = /^(?:front matter|contents|index|references|bibliography|further reading)$/i.test((chunk.s || "").trim());
      return {
        tf,
        len,
        titleTokens: new Set(tokenize(chunk.s || "")),
        topicIds,
        searchable: !exerciseHeading && !nonContentSection
      };
    });
    avgdl = docs.length ? total / docs.length : 0;
    ready = true;
    console.log(`TychoRAG: indexed ${chunks.length} chunks using ${scope.authority}`);
  }

  function retrieve(query, k = 4, minScore = 4.5) {
    const classification = classify(query);
    const emphasizedTopics = classification.filter(x => x.status === "core");
    const initialCoverage = emphasizedTopics.length ? "syllabus_emphasis"
      : classification.length ? "textbook_supported" : "unclassified";
    const base = {
      context: "",
      sections: [],
      scopeTopics: classification,
      coverageLevel: initialCoverage,
      coverageNote: emphasizedTopics.length
        ? "This question matches a broad syllabus emphasis area; the syllabus is not treated as an exhaustive topic list."
        : classification.length
          ? "This topic is available for learning even though the syllabus may not emphasize it."
          : "No exact syllabus mapping was required."
    };
    if (!ready) return base;
    if (classification.length && classification.every(item => item.textbookCoverage === "not_identified")) {
      return {
        ...base,
        coverageNote: "This is a supported spacecraft/astrodynamics topic, but no clearly identified source section exists in the supplied textbook chunks."
      };
    }

    const normalizedQuery = normalizeText(query);
    const queryTokens = tokenize(query);
    const expanded = new Set(queryTokens);
    for (const word of queryTokens) (SYN[word] || []).forEach(extra => expanded.add(extra));
    if (expanded.size === 0) return base;

    const scored = [];
    const k1 = 1.5;
    const b = 0.75;
    const N = docs.length;
    const matchedTopicIds = new Set(classification.map(item => item.id));
    for (let i = 0; i < N; i++) {
      const doc = docs[i];
      if (!doc.searchable) continue;
      let score = 0;
      let matchedHits = 0;
      for (const word of expanded) {
        const frequency = doc.tf.get(word);
        if (!frequency) continue;
        const n = df.get(word) || 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        const original = queryTokens.includes(word);
        matchedHits++;
        const expansionWeight = original ? 1 : 0.45;
        const titleBoost = doc.titleTokens.has(word) ? 1.8 : 1;
        score += expansionWeight * titleBoost * idf * frequency * (k1 + 1) /
          (frequency + k1 * (1 - b + b * doc.len / avgdl));
      }
      for (const route of SECTION_ROUTES) {
        if (!route.query.test(normalizedQuery)) continue;
        const chunk = chunks[i];
        if ((route.sections[chunk.b] || []).some(re => re.test(chunk.s || ""))) score *= 2.5;
      }
      // Syllabus mappings are a modest relevance hint, never an allowlist.
      if (matchedTopicIds.size && doc.topicIds.some(id => matchedTopicIds.has(id))) score *= 1.35;
      if (matchedHits > 0 && score > 0) scored.push([score, i]);
    }

    scored.sort((a, b2) => b2[0] - a[0]);
    const top = scored.slice(0, k).filter(([score]) => score >= minScore);
    if (top.length === 0) return base;

    const books = { K: "Kluever", SJ: "Schaub & Junkins" };
    const sections = [];
    const seen = new Set();
    const parts = top.map(([, index]) => {
      const chunk = chunks[index];
      const book = books[chunk.b] || chunk.b || "Course text";
      const page = chunk.p ? ` (p. ${chunk.p})` : "";
      const citation = `${book} §${chunk.s}${page}`;
      const citationKey = `${book}|${chunk.s}`;
      if (!seen.has(citationKey)) {
        seen.add(citationKey);
        sections.push(citation);
      }
      return `--- ${book}, Section ${chunk.s}${page} ---\n${chunk.t}`;
    });

    const topicLabels = classification.map(x => x.label).join("; ");
    const coverageLevel = emphasizedTopics.length ? "syllabus_emphasis" : "textbook_supported";
    const relevanceLine = topicLabels
      ? `The query has a soft syllabus/topic match to: ${topicLabels}. `
      : "The query did not require an exact syllabus-topic match; these excerpts were retrieved from the full course textbook corpus. ";
    const context = "\n\n== COURSE TEXTBOOK EXCERPTS ==\n" +
      relevanceLine +
      "The syllabus is broad and non-exhaustive, so topic mappings are relevance hints rather than content boundaries. " +
      "Use the retrieved excerpts as textbook grounding, cite the book and section, and paraphrase rather than quoting long passages.\n\n" +
      parts.join("\n\n");

    return {
      context,
      sections,
      scopeTopics: classification,
      coverageLevel,
      coverageNote: coverageLevel === "syllabus_emphasis"
        ? "This question matches a broad syllabus emphasis area; the syllabus is not treated as an exhaustive topic list."
        : "This question is supported by the supplied course textbooks; the broad syllabus is not treated as exhaustive."
    };
  }

  return {
    init,
    retrieve,
    classify,
    getScope: () => scope,
    isReady: () => ready
  };
})();
