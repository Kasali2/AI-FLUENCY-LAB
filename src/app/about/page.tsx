import type { Metadata } from "next";
import Link from "next/link";

import { getModel, isAiConfigured } from "@/lib/groq";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why AI Fluency Lab exists, how it is built, and how it handles responsible AI.",
};

const PIPELINE = [
  { name: "Task analyser", job: "Works out what you are actually trying to do." },
  { name: "Prompt designer", job: "Writes the minimal, descriptive and collaborative requests." },
  { name: "Response generator", job: "Produces the reply each request would receive." },
  { name: "Output analyser", job: "Names what is worth comparing — without judging." },
  { name: "Your judgment", job: "You choose a reply and explain your reasoning." },
  { name: "Feedback analyser", job: "Responds to your reasoning and reveals what changed." },
  { name: "Prompt improver", job: "Runs the prompt you rewrote yourself." },
  { name: "Reflection coach", job: "Closes the loop in your own words." },
];

export default function AboutPage() {
  const configured = isAiConfigured();
  const model = getModel();

  return (
    <div className="space-y-10">
      <header>
        <Pill tone="glow">About</Pill>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mist-100 text-balance sm:text-4xl">
          Why this exists
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty sm:text-base">
          Students are already using generative AI. What they are rarely taught
          is judgement: which tasks to hand over, what to specify, how to tell a
          good answer from a fluent one, and when an answer has to be checked by
          someone else entirely.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty sm:text-base">
          Most tools in this space optimise for{" "}
          <span className="text-mist-100">
            &ldquo;look how powerful the AI is&rdquo;
          </span>
          . This one optimises for{" "}
          <span className="text-mist-100">
            &ldquo;look how much better you got at working with it&rdquo;
          </span>
          .
        </p>
      </header>

      <section aria-labelledby="philosophy">
        <h2
          id="philosophy"
          className="text-xl font-semibold tracking-tight text-mist-100"
        >
          The central message
        </h2>
        <Card className="mt-4 border-glow-400/25 bg-ink-900/50">
          <p className="text-base leading-relaxed text-mist-100 text-pretty">
            AI literacy is not about writing clever prompts.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mist-300 text-pretty">
            It is about knowing what to delegate, how to describe a task, how to
            judge the result, and when to verify it. Those are decisions about
            your work — not incantations that unlock a model.
          </p>
        </Card>
      </section>

      <section aria-labelledby="architecture">
        <h2
          id="architecture"
          className="text-xl font-semibold tracking-tight text-mist-100"
        >
          How the pipeline is built
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty">
          Rather than one large prompt, the workflow is split into agents with a
          single responsibility each. Stages that can be completed safely
          together are composed into one request, so a phone on a slow
          connection is not waiting through eight round trips.
        </p>

        <ol className="mt-5 space-y-2">
          {PIPELINE.map((agent, index) => (
            <li
              key={agent.name}
              className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-900/50 px-4 py-3"
            >
              <span className="mt-0.5 font-mono text-xs text-mist-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-mist-100">
                  {agent.name}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-mist-400">
                  {agent.job}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-xs leading-relaxed text-mist-400 text-pretty">
          The pipeline never asks a model to explain its own internal reasoning
          or chain of thought. Every explanation shown to a student is a short,
          purpose-written educational note about what changed between two
          requests — which is the thing that is actually useful to learn.
        </p>
      </section>

      <section aria-labelledby="security">
        <h2
          id="security"
          className="text-xl font-semibold tracking-tight text-mist-100"
        >
          Security and privacy
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "The AI key lives only on the server. It is never sent to the browser, and the module that reads it refuses to load in client code.",
            "Student input is validated, length-limited and rate-limited before it reaches any model.",
            "Requests are wrapped in explicit data delimiters, so a task cannot smuggle instructions into the pipeline.",
            "Model replies are validated against a schema. Unreadable output is retried once, then replaced with a calm message — never a stack trace.",
            "Progress is stored in your own browser. There are no accounts and no personal profile.",
            "Nothing you type is stored on the server beyond the request that answers it.",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-ink-700 bg-ink-900/50 p-4 text-sm leading-relaxed text-mist-200 text-pretty"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-mint-400"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="current-state">
        <h2
          id="current-state"
          className="text-xl font-semibold tracking-tight text-mist-100"
        >
          What this installation is doing right now
        </h2>
        <Card className="mt-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs tracking-wide text-mist-400 uppercase">
                AI engine
              </dt>
              <dd className="mt-1 text-sm text-mist-100">
                {configured
                  ? "Configured — live experiments are available."
                  : "Not configured — the demo and all learning modules still work."}
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-wide text-mist-400 uppercase">
                Model
              </dt>
              <dd className="mt-1 font-mono text-sm text-mist-100">{model}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section aria-labelledby="limits">
        <h2
          id="limits"
          className="text-xl font-semibold tracking-tight text-mist-100"
        >
          Honest limitations
        </h2>
        <ul className="mt-4 space-y-3">
          {[
            "The responses in the Lab are generated live. They are plausible teaching material, not a verified source — which is precisely the point the Discernment module makes.",
            "Where a model is uncertain, it may still sound certain. The uncertainty notes are written to counter that, not to eliminate it.",
            "Progress is per browser. Clearing site data clears your record.",
            "Rate limiting is per server process. A multi-instance deployment would need a shared store.",
            "The Discernment and Diligence materials are fixed content, reviewed for accuracy at the time of writing. The Lab's live responses are not.",
          ].map((item) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-relaxed text-mist-300 text-pretty"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="independence">
        <h2
          id="independence"
          className="text-xl font-semibold tracking-tight text-mist-100"
        >
          Independence
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty">
          AI Fluency Lab is an independent educational project. It is not
          affiliated with, or endorsed by, the Examinations Council of Zambia,
          Zambia&rsquo;s Ministry of Education, Anthropic, or Groq. Example
          tasks reference Zambian school subjects because they are familiar, not
          because any syllabus body has approved them.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/lab" size="lg" fullWidth>
          Start an experiment
        </ButtonLink>
        <ButtonLink href="/learn" size="lg" variant="secondary" fullWidth>
          Learn AI Fluency
        </ButtonLink>
      </div>

      <p className="text-xs text-mist-400">
        Not sure where to begin? Try the{" "}
        <Link
          href="/lab?demo=1"
          className="text-glow-300 underline-offset-2 hover:underline"
        >
          one-minute demo
        </Link>
        .
      </p>
    </div>
  );
}
