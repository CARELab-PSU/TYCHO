/* ============================================================
 * TYCHO-RAG  —  client-side textbook retrieval for TYCHO
 * Kluever, "Space Flight Dynamics" — pre-chunked into JSON.
 *
 * Usage:
 *   <script src="tycho-rag.js"></script>
 *   await TychoRAG.init("textbook_chunks.json");   // once, at page load
 *   const ctx = TychoRAG.retrieve(userMessage, 4); // per message
 *   // ctx is a formatted string ("" if nothing relevant) —
 *   // append it to the system prompt at send time.
 *
 * No API calls, no embeddings, no cost. Pure lexical BM25 in the
 * browser. Index build takes ~200 ms for ~930 chunks.
 * ============================================================ */

const TychoRAG = (() => {
  // --- normalization: collapse variants to the book's spelling ---
  const NORMALIZE = [
    [/semi[\s-]?major/g, "semimajor"],
    [/semi[\s-]?minor/g, "semiminor"],
    [/vis[\s-]?viva/g, "visviva"],
    [/two[\s-]?body/g, "twobody"],
    [/three[\s-]?body/g, "threebody"],
    [/n[\s-]?body/g, "nbody"],
    [/delta[\s-]?v\b/g, "deltav"],
    [/\bdv\b/g, "deltav"],
    [/low[\s-]?thrust/g, "lowthrust"],
    [/pork[\s-]?chop/g, "porkchop"],
  ];

  const STOP = new Set(("how do i we you your find get compute calculate the a an of and or " +
    "to from for in on with is are was what why when where which it its this that these " +
    "using use used between can could should would does did not no yes my me us if then " +
    "about there here also just like need want help please problem question " +
    "hi hello hey tycho thanks thank ok okay yes yeah sure got").split(" "));

  // course-vocabulary expansion: query word -> extra index words
  const SYN = {
    semimajor: ["axis", "energy"],
    velocity: ["visviva", "speed"],
    speed: ["velocity"],
    position: ["radius", "vector", "state"],
    raan: ["ascending", "node", "regression", "longitude"],
    node: ["ascending", "raan"],
    j2: ["oblateness", "perturbation", "secular"],
    oblateness: ["j2"],
    drift: ["regression", "secular", "precession"],
    tle: ["ephemeris", "element"],
    deltav: ["increment", "impulse", "maneuver"],
    hohmann: ["transfer", "coplanar"],
    rendezvous: ["relative", "proximity", "clohessy", "wiltshire"],
    cw: ["clohessy", "wiltshire", "relative"],
    inclination: ["plane", "change"],
    period: ["kepler", "orbital"],
    anomaly: ["eccentric", "true", "mean", "kepler"],
    eccentricity: ["vector", "conic"],
    lambert: ["boundary", "transfer", "targeting"],
    reentry: ["entry", "atmospheric"],
    entry: ["atmospheric", "ballistic"],
    spin: ["nutation", "precession", "stability"],
    wheel: ["reaction", "momentum"],
    quaternion: ["euler", "attitude", "parameter"],
    dcm: ["direction", "cosine", "matrix", "rotation"],
    mrp: ["modified", "rodrigues", "parameter"],
    crp: ["classical", "rodrigues", "parameter", "gibbs"],
    rodrigues: ["parameter", "attitude"],
    prv: ["principal", "rotation", "vector"],
    lagrangian: ["lagrange", "generalized", "energy"],
    lagrange: ["lagrangian", "generalized"],
    gimbal: ["lock", "singularity", "euler"],
    cmg: ["control", "moment", "gyroscope"],
    gravity: ["gravitational", "acceleration"],
    escape: ["hyperbolic", "parabolic"],
    soi: ["sphere", "influence", "patched", "conic"],
    patched: ["conic", "sphere", "influence"],
    swingby: ["flyby", "gravity", "assist"],
    flyby: ["gravity", "assist", "hyperbolic"],
    isp: ["specific", "impulse", "propellant"],
    thrust: ["propulsion", "rocket"],
    drag: ["atmospheric", "perturbation", "decay"],
    groundtrack: ["ground", "track", "longitude"],
    geostationary: ["geo", "geosynchronous"],
    stationkeeping: ["station", "keeping", "geo"],
  };

  let chunks = [];      // [{s: section, p: page, t: text}]
  let docs = [];        // [{tf: Map, len: number}]
  let df = new Map();   // word -> doc frequency
  let avgdl = 0;
  let ready = false;

  function tokenize(text) {
    let s = text.toLowerCase();
    for (const [re, rep] of NORMALIZE) s = s.replace(re, rep);
    const raw = s.match(/[a-z]{2,}|\d+/g) || [];
    return raw.filter(w => !STOP.has(w));
  }

  async function init(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("TychoRAG: failed to load " + url);
    const data = await res.json();
    chunks = data.chunks;
    let total = 0;
    docs = chunks.map(c => {
      const tf = new Map();
      for (const w of tokenize(c.t + " " + c.s)) tf.set(w, (tf.get(w) || 0) + 1);
      let len = 0;
      for (const v of tf.values()) len += v;
      total += len;
      for (const w of tf.keys()) df.set(w, (df.get(w) || 0) + 1);
      return { tf, len };
    });
    avgdl = total / docs.length;
    ready = true;
    console.log(`TychoRAG: indexed ${chunks.length} chunks`);
  }

  function retrieve(query, k = 4, minScore = 9.0) {
    if (!ready) return { context: "", sections: [] };
    const k1 = 1.5, b = 0.75, N = docs.length;
    let qt = tokenize(query);
    // synonym expansion (expansions weighted implicitly by set-union scoring)
    const expanded = new Set(qt);
    for (const w of qt) (SYN[w] || []).forEach(x => expanded.add(x));
    if (expanded.size === 0) return { context: "", sections: [] };

    const scored = [];
    for (let i = 0; i < N; i++) {
      const d = docs[i];
      let s = 0, hits = 0, rareHit = false;
      for (const w of expanded) {
        const f = d.tf.get(w);
        if (!f) continue;
        const n = df.get(w);
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        // original query words count full; synonym expansions half-weight
        const isOriginal = qt.includes(w);
        if (isOriginal) {
          hits++;
          if (n < N / 15) rareHit = true; // rare = technical term
        }
        const weight = isOriginal ? 1.0 : 0.5;
        s += weight * idf * f * (k1 + 1) / (f + k1 * (1 - b + b * d.len / avgdl));
      }
      // gate: need >=2 distinct query words matched, or 1 rare technical term
      if (s > 0 && (hits >= 2 || rareHit)) scored.push([s, i]);
    }
    scored.sort((a, b2) => b2[0] - a[0]);
    const top = scored.slice(0, k).filter(([s]) => s >= minScore);
    if (top.length === 0) return { context: "", sections: [] };

    const seen = new Set();
    const sections = [];
    const BOOKS = { K: "Kluever", SJ: "S&J" };
    const parts = top.map(([s, i]) => {
      const c = chunks[i];
      const bk = BOOKS[c.b] || "Kluever";
      const loc = c.p ? ` (p. ${c.p})` : "";
      const label = bk + " " + c.s.split(" ").slice(0, 6).join(" ");
      if (!seen.has(label)) { seen.add(label); sections.push(bk + " §" + c.s + (c.p ? ` (p. ${c.p})` : "")); }
      return `--- ${bk === "S&J" ? "Schaub & Junkins" : "Kluever"}, Section ${c.s}${loc} ---\n${c.t}`;
    });
    const context = (
      "\n\n== COURSE TEXTBOOK EXCERPTS ==\n" +
      "The following passages were retrieved from the AERSP 450 course textbooks " +
      "(Kluever, 'Space Flight Dynamics'; Schaub & Junkins, 'Analytical Mechanics of Space Systems') " +
      "based on the student's message. Ground your guidance in this material: use " +
      "the textbook's notation, equation forms, and terminology. When you reference " +
      "a concept covered below, point the student to the book and section number " +
      "(e.g., 'see Schaub & Junkins Section 3.4') so they can read it themselves. " +
      "Do NOT quote long passages verbatim; paraphrase and guide.\n\n" +
      parts.join("\n\n")
    );
    return { context, sections };
  }

  return { init, retrieve, isReady: () => ready };
})();
