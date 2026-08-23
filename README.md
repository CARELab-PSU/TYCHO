# TYCHO — AERSP 450 AI Teaching Assistant

**TYCHO** is an AI-supported teaching assistant for AERSP 450: Orbit and Attitude Dynamics at Penn State. It is named after Tycho Brahe, whose precise observations helped make Kepler's laws possible.

TYCHO is designed to help students reason through orbital mechanics and attitude dynamics—not replace their own work. It can ask Socratic questions, provide guided hints, explain concepts, and create study materials grounded in the course textbooks.

> **AI notice:** TYCHO can be wrong. Verify equations, assumptions, citations, and conclusions with the course materials and instructor guidance.

## Quick Start

1. Open the TYCHO course link posted on Canvas.
2. Enter the course access code from Canvas if prompted.
3. Choose a learning mode.
4. For AI chat or newly generated study materials, open **API Key**, select a provider, enter a key, and click **Save & Test**.
5. Ask a question, paste a problem, or open **Study Tools**.

TYCHO itself does not require a separate account. A provider account and API key are normally required for AI chat and live generation. Curated flashcards and quizzes can be used without an API key.

## Learning Modes

| Mode | What TYCHO does |
|---|---|
| **Full Socratic** | Primarily asks questions so you retrieve and connect the ideas yourself. |
| **Guided Hints** | Identifies a relevant principle or equation, then asks you to apply it. |
| **Conceptual Only** | Explains the physical meaning and relevant relationships without completing a numerical solution. |

TYCHO is designed not to provide final answers to graded problems or complete worked solutions. No AI system can enforce this perfectly, so students remain responsible for using it in accordance with course and university policies.

## Study Tools

Open the **Study Tools** tab to use:

- **Curated flashcards:** instructor-provided cards that work without an API key.
- **Curated quizzes:** textbook-grounded practice questions that work without an API key.
- **Generate fresh cards:** creates new textbook-grounded flashcards using the selected AI provider.
- **Generate a fresh quiz:** creates a new textbook-grounded quiz using the selected AI provider.
- **Study Guide:** produces a compact guide using retrieved textbook sections.
- **Review missed:** revisits flashcards previously marked **Missed it**.

Fresh generation and study guides require an API key and a successfully loaded textbook index. An animated status indicator is shown while TYCHO waits for the provider.

Generated study materials can contain mistakes. Treat them as practice aids, not authoritative course notes.

## Course and Textbook Scope

TYCHO uses the supplied material from:

- C. A. Kluever, *Space Flight Dynamics*
- H. Schaub and J. L. Junkins, *Analytical Mechanics of Space Systems*

The syllabus is used as a **soft relevance guide**, not an exhaustive allowlist. TYCHO may therefore help with spacecraft and astrodynamics topics found in the supplied textbooks even when the syllabus does not name them explicitly—for example, relative motion, gravity assists, perturbations, or advanced rigid-body topics.

Being supported by a textbook does **not** mean a topic will appear on an exam. Use the syllabus, Canvas announcements, and instructor guidance to determine assessment priorities.

For content questions, TYCHO is intended to remain within the supplied Kluever and Schaub & Junkins material. If it cannot find reliable textbook support, it should say so rather than filling the gap with unrelated outside material.

## Connecting an AI Provider

1. Click **API Key** in the upper-right corner.
2. Select a provider.
3. Leave the prefilled **Model** value unchanged unless the connection test reports that the model is unavailable or retired.
4. Paste the provider key into **API Key**.
5. Click **Save & Test**.
6. Wait for **✓ Ready** before beginning AI chat or live generation.

The connection test sends one very small request to the selected provider. Provider pricing, free tiers, rate limits, and available models can change; check the provider's current terms before creating an account or adding billing information.

### What belongs in the Model field?

The Model field requires the provider's exact **API model ID**, not a marketing name and not an API key.

For example, a provider might display a friendly name such as “Example Model Large,” while its API model ID is `company/example-model-large`. TYCHO needs the exact API ID.

Normally, students should use the value already filled in by TYCHO. Change it only if **Save & Test** reports an error such as “model not found,” “model unavailable,” or “model retired.” Then:

1. Open the official model page in the table below.
2. Choose a text/chat model available to your account.
3. Copy its exact model ID.
4. Paste that ID into TYCHO's **Model** field.
5. Click **Save & Test** again.

| Provider | Where to find the correct model ID | Naming note |
|---|---|---|
| **Groq** | [Groq supported models](https://console.groq.com/docs/models) | Copy the value labeled **Model ID**. Prefer a production text model rather than a short-lived preview model. |
| **OpenRouter** | [OpenRouter models](https://openrouter.ai/models) | IDs normally use `author/model`. A specific free variant ends in `:free`. See the OpenRouter section below. |
| **Cerebras** | [Cerebras supported models](https://inference-docs.cerebras.ai/models/overview) | Copy the value in the **Model ID** column. |
| **Google Gemini** | [Gemini models](https://ai.google.dev/gemini-api/docs/models) | Paste the endpoint/model code without a leading `models/`; for example, use `gemini-…`, not `models/gemini-…`. Stable Flash models are generally more dependable than preview or experimental models. |
| **xAI** | [xAI models API](https://docs.x.ai/developers/rest-api-reference/inference/models) | Use a model ID returned for your API key. Availability can differ by account. |
| **DeepSeek** | [DeepSeek chat-completion models](https://api-docs.deepseek.com/api/create-chat-completion) | Use one of the currently documented values for the `model` parameter. Do not rely on an older alias after its retirement date. |
| **Anthropic Claude** | [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview) | Use the first-party **Claude API ID**, not the separate Amazon Bedrock or Google Cloud ID. |
| **OpenAI** | [OpenAI models](https://platform.openai.com/docs/models) | Use an API model ID available to the API project connected to the key. A ChatGPT subscription does not itself supply API access. Browser security rules may prevent direct OpenAI use in some browsers. |
| **Local Ollama** | Run `ollama ls` or see the [Ollama CLI documentation](https://docs.ollama.com/cli) | Paste the exact installed name, including any tag after `:`. The model must already be downloaded on that computer. |

### OpenRouter: choosing and identifying a model

OpenRouter provides access to many models through one API key. Each model has an exact ID such as:

```text
author/model-name
```

Use the [OpenRouter model catalog](https://openrouter.ai/models) and copy the model's **ID/slug**, not just its display name.

For free access, there are two approaches:

- **Specific free model:** choose a model marked free and use its ID ending in `:free`. This gives more consistent behavior, but that particular free model may later become unavailable.
- **Free Models Router:** enter `openrouter/free`. OpenRouter will select an available free model automatically. This is easier to maintain, but the underlying model can vary from request to request, so response style and quiz/flashcard formatting may be less consistent.

If fresh flashcards or quizzes repeatedly fail to generate valid structured output, choose a specific larger instruction-following model instead of the automatic free router and click **Save & Test** again.

Never paste a model ID into the API Key field or an API key into the Model field.

## Sessions, Saved Review, and Experience Logs

Use the **Session** menu to:

- **Resume a session:** import a TYCHO JSON experience log or Markdown transcript.
- **Save transcript (.md):** download a readable copy of the conversation.
- **Experience log (.json):** download conversation, mode, retrieval, flashcard, quiz, saved-review, and study-generation activity.

The JSON format restores the most information, including available continuity notes, learning mode, and curated cards saved for review. A Markdown transcript primarily restores the visible conversation.

TYCHO keeps recent conversation turns in active context and creates compact continuity notes for older material. To continue work in a later browser session, download a session file before closing TYCHO and import it next time.

## Privacy and API-Key Handling

- The API key is stored for the current browser tab/session, not permanently by TYCHO.
- The selected provider and model may remain saved in the browser, but the API key is kept separately.
- The key is sent directly to the selected provider to authenticate requests. It is not sent to Penn State or the CARE Lab.
- Student messages and relevant textbook excerpts are sent to the selected provider so it can generate a response. That provider's privacy, retention, and billing policies apply.
- Conversation and activity logs remain on the device unless the student explicitly downloads or shares them.
- Exported experience logs exclude the API key and login information and apply pattern-based redaction, but students should still review a file before sharing it.

On a shared computer, use **Forget key**, close the TYCHO tab, and do not leave downloaded transcripts or logs behind.

## Tips for Learning with TYCHO

- Paste the complete problem statement when course rules permit it.
- Explain where you are stuck instead of asking only for an answer.
- Show your work so TYCHO can respond to your reasoning.
- Use **Full Socratic** mode for retrieval practice.
- Use **Guided Hints** when you need help identifying the next step.
- Mark difficult flashcards **Missed it** and revisit them with **Review missed**.
- Start a fresh conversation between unrelated problems.
- Verify every important equation, sign convention, assumption, citation, and numerical result.

## Equations and Math

TYCHO renders LaTeX mathematical notation. You may enter:

- Inline math: `\( v^2 = \mu(2/r - 1/a) \)`
- Display math: `\[ M = E - e\sin E \]`

Plain-language descriptions are also acceptable.

## Troubleshooting

### “Textbook unavailable” or the topic menu is empty

Refresh the page after GitHub Pages finishes publishing. A hard refresh or a newly opened tab may be necessary because a failed load is remembered for the current page session.

### “Model not found” or “model retired”

Use the provider table above to obtain a current model ID, paste it into the **Model** field, and run **Save & Test** again.

### Rate-limit or quota error

Wait and try again, select a different model/provider, or review the provider's current account limits. Free services may be temporarily unavailable or heavily limited.

### Fresh flashcards or quizzes fail, but chat works

Some models do not reliably return the structured format required by study tools. Try a stronger instruction-following model or use the curated flashcards and quizzes.

### Ollama does not connect

Confirm that Ollama is running, the model shown in TYCHO appears in `ollama ls`, and Ollama is configured to permit requests from the browser hosting TYCHO.

## About TYCHO

TYCHO is built and maintained by the [CARE Lab](https://sites.psu.edu/carelab) — Computational Astrodynamics Research and Experiments — at Penn State University.

- **Course:** AERSP 450 — Orbit and Attitude Dynamics
- **Instructor:** Dr. Roshan T. Eapen
- **Primary textbook:** C. A. Kluever, *Space Flight Dynamics*, Wiley
- **Reference textbook:** H. Schaub and J. L. Junkins, *Analytical Mechanics of Space Systems*

## Issues and Feedback

If TYCHO gives incorrect guidance, cites an irrelevant section, goes outside the supplied textbook material, or behaves unexpectedly, report it to the instructor through Canvas. Useful reports include the question asked, the selected mode and provider, and the downloaded experience log after it has been reviewed for personal information.

---

*Tycho Brahe's meticulous naked-eye observations gave Johannes Kepler the data needed to derive the laws of planetary motion that underpin much of orbital mechanics.*
