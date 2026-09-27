import type { Metadata } from "next";
import Link from "next/link";

import { Card, Pill } from "@/components/ui/Card";
import { ACCENT_CLASSES, MODULES, TOTAL_LESSONS } from "@/data/modules";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Four short interactive modules on delegation, description, discernment and diligence — the skills behind AI fluency.",
};

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <header>
        <Pill tone="glow">Learn AI Fluency</Pill>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mist-100 text-balance sm:text-4xl">
          Four skills, {TOTAL_LESSONS} short activities
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty sm:text-base">
          Each activity follows the same shape: a concept, an example, something
          you have to decide, an explanation that only appears after you commit,
          and a short reflection. None of it requires an account, and none of it
          is graded.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-400 text-pretty">
          The modules work perfectly on their own. If the server has an AI key
          configured, the Description module can also run the request you build.
        </p>
      </header>

      <ol className="space-y-4">
        {MODULES.map((module) => {
          const accent = ACCENT_CLASSES[module.accent];

          return (
            <Card as="li" key={module.id} className="animate-fade-up">
              <div className="flex flex-wrap items-start gap-4">
                <span
                  aria-hidden="true"
                  className={`grid size-10 shrink-0 place-items-center rounded-xl border font-mono text-sm font-bold ${accent.border} ${accent.bg} ${accent.text}`}
                >
                  {module.step}
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold tracking-tight text-mist-100">
                    {module.title}
                  </h2>
                  <p className={`mt-1 text-sm font-medium ${accent.text}`}>
                    {module.question}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300 text-pretty">
                    {module.tagline}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {module.covers.map((item) => (
                      <li key={item}>
                        <Pill tone="neutral">{item}</Pill>
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-5 space-y-2">
                    {module.lessons.map((lesson, index) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/learn/${module.id}/${lesson.id}`}
                          className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900/50 px-4 py-3 transition-colors hover:border-mist-400/40 hover:bg-ink-800/70"
                        >
                          <span className="font-mono text-xs text-mist-400">
                            {module.step}
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-mist-100">
                              {lesson.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-mist-400">
                              {lesson.summary}
                            </span>
                          </span>
                          <span aria-hidden="true" className={accent.text}>
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </ol>

      <Card className="border-glow-400/25 bg-ink-900/50">
        <h2 className="text-base font-semibold text-mist-100">
          Finished the modules?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-mist-300 text-pretty">
          The Lab is where these four skills get practised together, on a task
          you actually care about.{" "}
          <Link
            href="/lab"
            className="text-glow-300 underline-offset-2 hover:underline"
          >
            Run an experiment
          </Link>{" "}
          and see what you notice.
        </p>
      </Card>
    </div>
  );
}
