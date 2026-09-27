import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";
import { ACCENT_CLASSES, MODULES } from "@/data/modules";

export const metadata: Metadata = {
  title: "AI Fluency Lab — Learn to think with AI, not just ask AI",
  description:
    "An interactive laboratory that teaches students what to delegate to AI, how to describe a task, how to judge the result, and when to verify it.",
};

const FRAMEWORK = [
  {
    step: "01",
    name: "Delegation",
    question: "Should AI do this task, or help you do it?",
  },
  {
    step: "02",
    name: "Description",
    question: "What information does the AI actually need?",
  },
  {
    step: "03",
    name: "Discernment",
    question: "Which answer would you trust, and why?",
  },
  {
    step: "04",
    name: "Diligence",
    question: "What should you verify before acting on it?",
  },
];

const DIFFERENT = [
  {
    title: "You judge before you are told",
    body: "The lab never announces which AI response is best. You choose, you explain why, and only then does the analysis appear — including the parts you missed.",
  },
  {
    title: "You leave with a better prompt",
    body: "Every experiment ends with you rewriting a prompt in your own words, then running it and seeing what your wording changed.",
  },
  {
    title: "It teaches judgement, not tricks",
    body: "There are no magic phrases here. The four skills are about deciding what to delegate, what to specify, what to question and what to verify.",
  },
  {
    title: "It shows what AI is bad at",
    body: "Numbers, sources, current prices and claims about you are all things AI states confidently and gets wrong. The lab practises catching that.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero ------------------------------------------------------------- */}
      <section className="animate-fade-up">
        <Pill tone="glow">An educational laboratory, not a chatbot</Pill>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-mist-100 text-balance sm:text-6xl">
          AI Fluency Lab
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mist-200 text-pretty sm:text-xl">
          Learn to think with AI, not just ask AI.
        </p>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty sm:text-base">
          Most people are taught how to use AI by using it badly and hoping for
          the best. This lab teaches the four skills that actually matter:
          knowing what to delegate, how to describe a task, how to judge the
          result, and when to verify it.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/lab" size="lg">
            Start an experiment
          </ButtonLink>
          <ButtonLink href="/learn" size="lg" variant="secondary">
            Learn AI Fluency
          </ButtonLink>
        </div>

        <p className="mt-4 text-xs text-mist-400">
          No account needed. Nothing you type is stored on a server.{" "}
          <ButtonLink
            href="/lab?demo=1"
            size="sm"
            variant="ghost"
            className="!px-2 !py-0 text-xs text-glow-300 underline-offset-4 hover:underline"
          >
            Try the one-minute demo →
          </ButtonLink>
        </p>
      </section>

      {/* Framework -------------------------------------------------------- */}
      <section aria-labelledby="framework-heading">
        <h2
          id="framework-heading"
          className="text-xl font-semibold tracking-tight text-mist-100 sm:text-2xl"
        >
          The four skills
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty">
          AI literacy is not about writing clever prompts. It is about four
          decisions you make around every request.
        </p>

        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {FRAMEWORK.map((item, index) => (
            <Card as="li" key={item.name} className="animate-fade-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-mist-400">
                    {item.step}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-mist-100">
                    {item.name}
                  </h3>
                </div>
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${ACCENT_CLASSES[MODULES[index].accent].dot}`}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mist-300 text-pretty">
                {item.question}
              </p>
            </Card>
          ))}
        </ol>
      </section>

      {/* How the experiment works ----------------------------------------- */}
      <section aria-labelledby="experiment-heading">
        <h2
          id="experiment-heading"
          className="text-xl font-semibold tracking-tight text-mist-100 sm:text-2xl"
        >
          How an experiment works
        </h2>

        <ol className="mt-6 space-y-4">
          {[
            {
              title: "You bring a task",
              body: "Something you are genuinely studying — explaining a concept, revising for a test, debugging a project.",
            },
            {
              title: "The lab writes three approaches",
              body: "A vague one-line request, a fully described one, and one that asks the AI to work with you instead of for you. Each gets a real reply.",
            },
            {
              title: "You choose, and explain why",
              body: "No verdict is given until you have committed. Your reasoning is the thing being practised.",
            },
            {
              title: "You rewrite and run it",
              body: "Then you see what your own wording changed, and the experiment closes with a short reflection.",
            },
          ].map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-ink-600 bg-ink-800 font-mono text-xs text-mist-300"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-mist-100">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-mist-300 text-pretty">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Why it is different ---------------------------------------------- */}
      <section aria-labelledby="different-heading">
        <h2
          id="different-heading"
          className="text-xl font-semibold tracking-tight text-mist-100 sm:text-2xl"
        >
          Built to improve the human, not to show off the model
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {DIFFERENT.map((item) => (
            <Card key={item.title}>
              <h3 className="text-sm font-semibold text-mist-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-300 text-pretty">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Responsible use --------------------------------------------------- */}
      <section aria-labelledby="responsible-heading">
        <Card className="border-amber-400/25 bg-amber-400/5">
          <h2
            id="responsible-heading"
            className="text-lg font-semibold text-mist-100"
          >
            What this lab will keep telling you
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "AI can be wrong, and it can sound completely confident while being wrong.",
              "Numbers, sources and current prices are the least reliable parts of any answer.",
              "Anything important should be verified with a person or a primary source.",
              "Private information should never be pasted into an AI tool.",
              "Humans stay responsible for decisions that matter.",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-mist-200 text-pretty"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-mist-400">
            This project is independent and is not affiliated with, or endorsed
            by, any examination board, ministry, or AI provider.
          </p>
        </Card>
      </section>
    </div>
  );
}
