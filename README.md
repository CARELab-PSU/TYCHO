# TYCHO — AERSP 450 AI Teaching Assistant

**TYCHO** is an AI-powered Socratic teaching assistant for AERSP 450: Orbit and Attitude Dynamics at Penn State University. Named after the Danish astronomer Tycho Brahe, whose precise observations of planetary motion laid the foundation for Kepler's laws — the very subject of this course.

TYCHO will not solve problems for you. It will guide you to solve them yourself.

---

## How to Use TYCHO

### Step 1 — Open the app
Go to the course URL posted on Canvas. TYCHO runs entirely in your browser — no installation, no account needed.

### Step 2 — Get a free API key
TYCHO needs an AI provider to power its responses. You connect your own key — it stays in your browser and is never shared or stored anywhere else. Choose any one of the providers below. **Groq is recommended** — it is the fastest to set up and completely free.

### Step 3 — Enter your key
Click the **API Key** button in the top right corner of TYCHO. Pick your provider from the dropdown (TYCHO auto-selects it when it recognizes your key format), optionally adjust the model name, paste your key, and click **Save & Test**. TYCHO sends one small test message and shows **"✓ Ready"** when the connection works — you know immediately whether your key is good. You only need to do this once per browser.

If a provider retires a model name, just type the new model name in the Model field — no code changes needed.

### Step 4 — Choose a mode
Use the **Mode** dropdown in the header to select how much guidance you want:

| Mode | What it does |
|---|---|
| **Full Socratic** | TYCHO only asks questions — you recall everything yourself |
| **Guided Hints** | TYCHO names the relevant principle and equation, but you apply it |
| **Conceptual Only** | TYCHO explains the concept and shows the equation, but does not compute |

### Step 5 — Start chatting
Type your question or paste a problem from your homework. TYCHO will guide you through it one step at a time.

Use the **↺ button** (bottom left of the input bar) to start a fresh conversation at any time.

---

## Getting a Free API Key

### Groq ⭐ Recommended — Free, no credit card required
Groq runs LLaMA 3.3 70B, a powerful open-source model, on custom hardware. It is the fastest and easiest free option.

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with your Google account or email
3. Click **API Keys** in the left sidebar
4. Click **Create API Key**, give it a name (e.g. "TYCHO")
5. Copy the key immediately — you will not see it again
6. In TYCHO: select **Groq — LLaMA 3.3 70B (Free)**, paste the key, click Save

**Free tier limits:** 100,000 tokens per day, resets at midnight UTC. For typical homework help sessions this is more than sufficient.

---

### Google Gemini — Free with billing setup
Google Gemini 2.0 Flash is fast and capable. The free tier requires a Google account with billing enabled (you will not be charged for normal use).

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API Key** → **Create API key**
4. Copy the key
5. If you see a quota error, click **Set up billing** in AI Studio — add a payment method. Google provides free credits and light usage costs nothing.
6. In TYCHO: select **Google (Gemini 2.0 Flash)**, paste the key, click Save

---

### DeepSeek — Free tier available
DeepSeek is a capable reasoning model with a generous free tier.

1. Go to [platform.deepseek.com](https://platform.deepseek.com)
2. Sign up with your email
3. Go to **API Keys** → **Create new API key**
4. Copy the key
5. In TYCHO: select **DeepSeek**, paste the key, click Save & Test

---

### Cerebras — Free, very fast
Cerebras runs open models on wafer-scale hardware with a generous free tier.

1. Go to [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Sign up with your email
3. Generate an API key (starts with `csk-`)
4. In TYCHO: select **Cerebras**, paste the key, click Save & Test

---

### Local — Ollama (no key, no internet, fully private)
Run a model on your own computer. No API key, no rate limits, works offline.

1. Install [Ollama](https://ollama.com) (Mac/Windows/Linux)
2. In a terminal: `ollama pull llama3.2`
3. Start Ollama with browser access enabled:
   - Mac/Linux: `OLLAMA_ORIGINS="*" ollama serve`
   - Windows: set the `OLLAMA_ORIGINS` environment variable to `*` then restart Ollama
4. In TYCHO: select **Local — Ollama**, leave the key blank, click Save & Test

Note: local models are smaller and noticeably weaker at physics reasoning than cloud models. Fine for definitions and study review; expect weaker guidance on multi-step problems.

---

### Anthropic Claude — $5 free credit on signup
Anthropic Claude is one of the strongest models for following nuanced instructions. New accounts receive $5 in free credits — enough for extensive use.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up with your Google account or email
3. Go to **API Keys** → **Create Key**
4. Copy the key
5. In TYCHO: select **Anthropic (Claude)**, paste the key, click Save

---

### OpenAI GPT-4o — Requires credit balance
OpenAI requires a funded account to use the API (separate from ChatGPT subscriptions).

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Go to **API Keys** → **Create new secret key**
4. Add a small credit balance under **Billing** (minimum $5)
5. Copy the key
6. In TYCHO: select **OpenAI (GPT-4o)**, paste the key, click Save

---

## What TYCHO Will and Will Not Do

### TYCHO will:
- Guide you through problems one step at a time
- Ask you questions that lead you toward the answer
- Explain concepts from AERSP 450 clearly
- Reference specific sections of Kluever and Schaub & Junkins
- Tell you when you have made an error and help you find where
- Adjust the level of hints based on the mode you select
- Help you study and review for exams by working through concepts with you

### TYCHO will not:
- Solve problems for you
- Compute numerical answers
- Walk through a complete solution step by step
- Help with homework from other courses
- Change its behavior no matter how you ask it to

If you find yourself frustrated that TYCHO won't just give you the answer — that means it is working correctly. The goal is for you to be able to solve the *next* problem on your own.

---

## Tips for Getting the Most Out of TYCHO

- **Paste the full problem statement.** The more context TYCHO has, the more targeted its guidance will be.
- **Tell it where you are stuck.** "I don't understand step 3" is more useful than "I don't understand this problem."
- **Show your work so far.** Even if it is wrong. TYCHO will identify exactly where the reasoning broke down.
- **Use Full Socratic mode when studying.** It forces you to recall everything yourself — the best exam preparation.
- **Use Guided Hints mode when stuck on a specific step.** It will point you to the right tool without doing it for you.
- **Hit ↺ between problems.** Starting a fresh conversation keeps TYCHO focused on the current problem.

---

## Equations and Math

TYCHO renders equations in proper mathematical notation. You can type math in your messages using LaTeX syntax:

- Inline math: `\( v^2 = \mu(2/r - 1/a) \)`
- Display math: `\[ M = E - e\sin E \]`

Or just describe the equation in plain English — TYCHO will recognize it.

---

## About TYCHO

TYCHO is built and maintained by the [CARE Lab](https://sites.psu.edu/carelab) (Computational Astrodynamics Research and Experiments) at Penn State University.

- **Course:** AERSP 450 — Orbit and Attitude Dynamics
- **Instructor:** Dr. Roshan T. Eapen
- **Primary textbook:** Kluever, C.A., *Space Flight Dynamics*, Wiley, 2018
- **Reference:** Schaub & Junkins, *Analytical Mechanics of Space Systems*

Your API key is stored only in your browser's local storage. It is never transmitted to Penn State servers or the CARE Lab. TYCHO only sends your messages and the course knowledge base to whichever AI provider you choose.

---

## Issues or Feedback

If TYCHO gives incorrect guidance, goes off-topic, or behaves unexpectedly, please report it to your instructor via Canvas so the system can be improved.

*Named after Tycho Brahe (1546–1601), whose meticulous naked-eye observations of planetary motion — more precise than any before him — gave Johannes Kepler the data needed to derive the laws of orbital mechanics that form the foundation of this course.*
