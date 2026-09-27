# AI Fluency Lab

**Learn to think with AI, not just ask AI.**

An interactive educational platform that teaches students how to use generative
AI effectively, critically and responsibly. It is deliberately not another chat
interface — there is no free-text box pointed at a model. Instead, the student
runs structured *experiments* in which they must make judgments before they are
shown any analysis.

---

## Why this exists

Students are already using generative AI. What they are rarely taught is
judgement: which tasks to hand over, what to specify, how to tell a good answer
from a fluent one, and when an answer has to be checked by someone else.

Most AI tooling optimises for *"look how powerful the model is"*. This project
optimises for *"look how much better the human became at working with it"*.

The central message, which the whole application is built to demonstrate rather
than state:

> AI literacy is not about writing clever prompts. It is about knowing **what**
> to delegate, **how** to describe the task, **how** to judge the result, and
> **when** to verify it.

---

## The four-skill framework

| Module | Question it teaches | What it covers |
| --- | --- | --- |
| **1. Delegation** | Should AI do this task, or help you do it? | Brainstorming, explanation, summarising, tutoring, debugging, and when AI should *not* take the wheel |
| **2. Description** | What information does the AI need? | Goal, context, audience, constraints, output format, success criteria |
| **3. Discernment** | Which answer would you trust, and why? | Unsupported claims, incorrect reasoning, excessive confidence, missing information, instruction following, audience fit |
| **4. Diligence** | What should you verify before acting on it? | Factual verification, calculations, sources, uncertainty, privacy, decisions that matter, the limits of AI |

Each learning activity follows the same five beats:

**Concept → Example → Interaction → Feedback → Reflection**

The student commits to a judgment before any explanation appears. That ordering
is the mechanism, not a stylistic choice.

---

## The Lab experiment

The Lab walks through twelve steps, collapsing them into seven screens:

```
TASK
 ↓  Task analyser + Prompt designer
GENERATE THREE APPROACHES      (minimal / descriptive / collaborative)
 ↓  Response generator
GENERATE AI RESPONSES
 ↓  Output analyser (names the lenses, never the verdict)
COMPARE
 ↓
STUDENT MAKES A JUDGMENT
 ↓
STUDENT EXPLAINS WHY
 ↓  Feedback analyser
AI PROVIDES FEEDBACK           — strengths, missed factors, what changed
 ↓  Prompt improver
STUDENT IMPROVES THE PROMPT
 ↓
RUN AGAIN
 ↓  Reflection coach
REFLECT
```

The three approaches are generated dynamically from the student's own task.
Nothing is hard-coded to a single example.

### Demo mode

`/lab?demo=1` (or the **Try the demo** button) runs the entire experiment
immediately using prepared content for *"Explain photosynthesis to a Grade 12
student."* It requires no API key, so the value of the product can be understood
in about a minute without any setup.

Demo mode is labelled as such in the interface. It is a fixture, never a silent
fallback — students are not misled into thinking a live model produced it.

---

## Architecture

### Request flow

The API key never reaches the browser:

```
BROWSER
  ↓  fetch (no credentials, no key)
NEXT.JS ROUTE HANDLER  (server only)
  ↓  groq-sdk
GROQ API
  ↓
NEXT.JS ROUTE HANDLER  →  validated JSON
  ↓
BROWSER
```

### Agent pipeline

Rather than one large prompt, the workflow is split into agents with a single
responsibility each (`src/lib/agents/`). Stages that can be completed safely
together are composed into a single request, so a phone on a slow connection is
not waiting through eight round trips.

| Agent | Responsibility | Runs in |
| --- | --- | --- |
| `taskAnalyser` | Work out what the student is actually trying to do | Call 1 |
| `promptDesigner` | Write the minimal, descriptive and collaborative requests | Call 1 |
| `responseGenerator` | Produce the reply each request would receive | Call 1 |
| `outputAnalyser` | Name what is worth comparing — without judging | Call 1 |
| *(the student)* | Choose a reply and explain the reasoning | — |
| `feedbackAnalyser` | Respond to the student's reasoning; reveal what changed | Call 2 |
| `promptImprover` | Answer the prompt the student rewrote themselves | Call 3 |
| `reflectionCoach` | Close the loop in the student's own words | Call 4 |

Each agent is a module exporting a brief and the fragment of the JSON output
contract it owns. `src/lib/pipeline.ts` composes them.

The pipeline never asks a model to explain its own internal reasoning or chain
of thought. Every explanation a student sees is a short, purpose-written
educational note about what changed between two requests.

### Route handlers

| Route | Purpose |
| --- | --- |
| `POST /api/experiment` | Analysis, three prompts, three replies, focus points |
| `POST /api/judgment` | Feedback on the student's choice and reasoning |
| `POST /api/run-prompt` | Runs the prompt the student rewrote |
| `POST /api/reflection` | Closing reflection |
| `GET /api/status` | Whether AI is configured, and the model name. No secrets. |

---

## Setup

Requires **Node.js 20.9+** (developed on Node 22).

```bash
npm install
cp .env.example .env.local
# then add your GROQ_API_KEY to .env.local
npm run dev
```

Open <http://localhost:3000>.

**The app runs without an API key.** Every learning module works, and the Lab
demo runs end to end. Only live experiments on arbitrary tasks are switched
off, and the interface says so plainly instead of failing at the point of use.

---

## Environment variables

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | No | — | Needed only for live experiments. Server-side only. |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | Any chat-completions model on your Groq account. |

> **Never** prefix the key with `NEXT_PUBLIC_`. That would ship it to the
> browser. The module that reads the key is marked `server-only`, so importing
> it from a Client Component is a build error rather than a leaked secret.

`.env.local` is gitignored. `.env.example` contains no real values.

### Groq configuration

- Get a key at <https://console.groq.com/keys>.
- The default model is a reasoning model. If your account does not have access
  to it, set `GROQ_MODEL` to one you do have — nothing in the codebase assumes a
  particular model, and the caller degrades if a model rejects JSON mode.

---

## Development commands

```bash
npm run dev        # development server (Turbopack)
npm run build      # production build
npm start          # run the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # node --test tests/*.test.ts
```

Recommended before finishing any change:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

## Security considerations

- **The key never leaves the server.** `src/lib/groq.ts` begins with
  `import "server-only"`.
- **Input validation.** Every route validates its body with a Zod schema,
  including minimum and maximum lengths.
- **Payload limits.** Request bodies are size-capped before parsing.
- **Rate limiting.** A per-IP fixed window (`src/lib/rate-limit.ts`) protects
  the quota. It is per-process; a multi-instance deployment should back it with
  a shared store.
- **Prompt-injection resistance.** Student input is wrapped in explicit
  `<student_task>` / `<student_prompt>` / `<student_explanation>` delimiters and
  labelled as data, with an explicit instruction never to follow it.
- **Structured output is never trusted.** Model JSON is extracted defensively,
  validated against a schema, retried once with a repair instruction, and then
  replaced with a calm message. Students never see a parse error or a stack
  trace.
- **No accounts.** Progress is stored in `localStorage`. No personal
  information is collected, and there is no server-side profile.
- **No invented citations.** The house rules forbid fabricating sources,
  statistics or institutions, and instruct the model to say something needs
  checking instead.

---

## Accessibility and mobile

- Semantic HTML with landmarks, and a skip link.
- Full keyboard navigation, including arrow-key support in the comparison tabs.
- Visible focus rings everywhere; focus is moved to error notices on failure.
- Option groups use `fieldset` / `legend` with real `radio` and `checkbox`
  inputs, and `aria-live` regions announce results.
- `prefers-reduced-motion` disables all animation and smooth scrolling.
- Mobile-first layout with a bottom tab bar, `dvh` units, safe-area insets and
  touch targets of at least 44px.

---

## Project structure

```
src/
  app/
    page.tsx                    Home
    lab/page.tsx                The experiment
    learn/                      Module hub, module pages, lesson pages
    progress/page.tsx           Local activity record
    about/page.tsx              Purpose, architecture, honest limitations
    api/                        Route handlers
    error.tsx / not-found.tsx   Calm failure states
  components/
    lab/                        Experiment orchestrator and comparison panel
    learn/                      Lesson runner and prompt builder
    progress/                   localStorage store and dashboard
    layout/                     Header and bottom navigation
    ui/                         Button, Card, feedback primitives
  data/modules.ts               All four modules' content
  lib/
    agents/                     One module per pipeline agent
    pipeline.ts                 Composes agents into staged calls
    groq.ts                     Server-only client and structured caller
    schemas.ts                  Zod schemas + inferred types
    validate.ts                 JSON extraction and parse decision (pure)
    demo.ts                     Offline demo fixtures
tests/core.test.ts              Zero-dependency test suite
```

---

## Testing

`npm test` runs 26 tests using Node's built-in test runner — no extra
dependencies. They cover:

- JSON extraction from fenced, prose-wrapped, truncated, empty and
  non-object model replies, including braces and escaped quotes inside strings.
- Schema validation of requests, including the exact error paths.
- The `parseStructured` retry decision against responses a model really does
  produce.
- Demo fixtures satisfying the same schemas as live model output, and reacting
  to the student's actual choice.
- Rate-limiter budget, blocking and per-key isolation.
- Error mapping: curated `ApiError`s pass through, unexpected errors are hidden.

The test runner strips TypeScript types natively, which is why the modules under
test deliberately have no relative runtime imports.

---

## Deployment

The application is a standard Next.js app and deploys anywhere that runs Node.

1. Set `GROQ_API_KEY` (and optionally `GROQ_MODEL`) as environment variables on
   the host. Do not commit them.
2. `npm run build && npm start`, or use the platform's Next.js preset.

Before exposing it publicly:

- Replace the in-memory rate limiter with a shared store if you run more than
  one instance.
- Consider adding a Content Security Policy.

---

## Honest limitations

- Lab responses are generated live. They are plausible teaching material, not a
  verified source — which is precisely the point the Discernment module makes.
- A model can still sound certain when it is wrong. The uncertainty notes are
  written to counter that, not to eliminate it.
- Progress is per browser; clearing site data clears the record.
- Discernment and Diligence materials are fixed, reviewed content. Live
  responses are not.

---

## Independence

AI Fluency Lab is an independent educational project. It is not affiliated with,
or endorsed by, the Examinations Council of Zambia, Zambia's Ministry of
Education, Anthropic, or Groq. Example tasks reference Zambian school subjects
because they are familiar, not because any syllabus body approved them.

---

## Future improvements

- Persist progress to an optional account, so it survives a device change.
- Let a teacher set a task for a class and see the class's collective reasoning.
- Add a "verify this claim" workflow that helps a student check a statistic
  against a primary source, rather than only warning them to.
- Swap in a different provider behind the same agent interfaces to compare how
  two models respond to identical prompts — a natural Discernment extension.
