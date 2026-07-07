# Adding textbook RAG to TYCHO

Two new files go in the same folder as `aersp450-ta.html` (repo root, so
Netlify/GitHub Pages serves them):

- `textbook_chunks.json` — 932 chunks of Kluever, with section numbers and
  approximate page numbers (1.45 MB raw, ~450 KB gzipped over the wire).
- `tycho-rag.js` — the retrieval engine. Pure client-side BM25. No API calls,
  no embeddings, no cost to students, works identically for all seven providers.

## Step 1 — load the script

In the `<head>` of `aersp450-ta.html`, after MathJax:

```html
<script src="tycho-rag.js"></script>
```

## Step 2 — build the index at page load

Anywhere in your startup code (e.g., next to where you restore localStorage):

```js
TychoRAG.init("textbook_chunks.json").catch(e => console.warn(e));
```

It's async and takes ~300 ms; if it hasn't finished (or the JSON fails to
load) by the time a student sends a message, `retrieve()` just returns ""
and TYCHO behaves exactly as it does today. Nothing breaks.

## Step 3 — inject at send time

You already inject the mode dynamically at send time rather than storing it
in history. RAG follows the identical pattern. In your send function, where
you assemble the system prompt:

```js
const ragContext = TychoRAG.retrieve(userMessage, 4);  // "" if not relevant
const systemPrompt = BASE_SYSTEM_PROMPT + modeInstructions + ragContext;
```

Important: like the mode tag, the retrieved context must NOT be stored in
the conversation history — it's recomputed fresh from each new user message.
This keeps your rolling 6-message window clean and means the context always
matches the *current* question, not a stale one.

## Step 4 — one line in the Socratic prompt (optional but recommended)

Add to TYCHO's permanent identity rules:

> When course textbook excerpts are provided, ground your hints in them,
> use the textbook's notation, and cite the section number (e.g., "take a
> look at Section 5.3.2") so the student can read the source. Never dump
> the excerpt verbatim.

The injected block already carries instructions to this effect, but
reinforcing it in the permanent rules makes it jailbreak-resistant, which
you've seen matters.

## Tuning knobs

- `retrieve(query, k, minScore)` — k = number of chunks (default 4;
  drop to 3 to save ~350 tokens/message), minScore = relevance gate
  (default 9.0; raise it if you see irrelevant context sneaking in).
- Synonym map: `SYN` at the top of tycho-rag.js. If students phrase
  something the book doesn't ("burn" for maneuver, etc.), add a line there.
- Stopwords: `STOP` includes "tycho" itself so greetings don't trigger
  retrieval off the Tycho Brahe history section.

## What this is NOT

This is lexical search, not semantic embeddings. It matches vocabulary,
so "how fast is the satellite going at perigee" retrieves well (velocity,
perigee are book words) but a question phrased entirely in slang with no
technical terms may retrieve nothing — in which case TYCHO simply answers
from model knowledge as it does today. If retrieval quality ever feels
insufficient, the upgrade path is transformers.js running a small embedding
model in the browser (~30 MB one-time download per student, cached), but
test this version with real students first.

## Token cost per message (student's key)

~1,500 extra input tokens on technical questions, 0 on small talk. At
Groq/Gemini free-tier or DeepSeek pricing this is negligible; on Claude/GPT
it's roughly a tenth of a cent per message.
