"use client";

import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";
import { MODULES, TOTAL_LESSONS } from "@/data/modules";
import { useProgress } from "@/components/progress/ProgressProvider";

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProgressClient() {
  const { state, hydrated, reset } = useProgress();
  const [confirming, setConfirming] = useState(false);

  const lessonsDone = MODULES.reduce(
    (total, module) => total + state.lessons[module.id].length,
    0,
  );

  const stats = [
    { label: "Experiments completed", value: state.experiments, tone: "glow" as const },
    { label: "Reflections completed", value: state.reflections, tone: "iris" as const },
  ];

  return (
    <div className="space-y-8">
      <header>
        <Pill tone="glow">Progress</Pill>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mist-100 text-balance sm:text-4xl">
          What you have completed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty">
          This is a record of activity, not a score. It is kept in this browser
          only — there is no account, and nothing is sent to a server.
        </p>
      </header>

      {!hydrated ? (
        <Card>
          <p className="text-sm text-mist-400">Loading your local record…</p>
        </Card>
      ) : (
        <>
          <section aria-label="Activity counts" className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <p className="font-mono text-3xl font-semibold text-mist-100">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-mist-300">{stat.label}</p>
              </Card>
            ))}
          </section>

          <section aria-labelledby="skills-heading">
            <h2
              id="skills-heading"
              className="text-lg font-semibold tracking-tight text-mist-100"
            >
              Learning activities
            </h2>
            <p className="mt-2 text-sm text-mist-400">
              {lessonsDone} of {TOTAL_LESSONS} activities completed.
            </p>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {MODULES.map((module) => {
                const done = state.lessons[module.id].length;
                const total = module.lessons.length;

                return (
                  <Card as="li" key={module.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-sm font-semibold text-mist-100">
                        {module.title}
                      </h3>
                      <span className="font-mono text-xs text-mist-400">
                        {done}/{total}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-mist-400">
                      {done === 0
                        ? `No ${module.title.toLowerCase()} activities completed yet.`
                        : `${done} ${module.title.toLowerCase()} ${
                            done === 1 ? "activity" : "activities"
                          } completed.`}
                    </p>

                    <div
                      aria-hidden="true"
                      className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800"
                    >
                      <div
                        className="h-full rounded-full bg-glow-400 transition-all duration-500"
                        style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="mt-4">
                      <ButtonLink
                        href={`/learn/${module.id}`}
                        size="sm"
                        variant="ghost"
                        className="!px-3"
                      >
                        {done === 0 ? "Start" : "Continue"}
                      </ButtonLink>
                    </div>
                  </Card>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="history-heading">
            <h2
              id="history-heading"
              className="text-lg font-semibold tracking-tight text-mist-100"
            >
              Recent activity
            </h2>

            {state.activity.length === 0 ? (
              <Card className="mt-4">
                <p className="text-sm leading-relaxed text-mist-300 text-pretty">
                  Nothing here yet. Start with{" "}
                  <span className="text-glow-300">an experiment in the Lab</span>{" "}
                  or a short activity in the Learn section, and it will show up
                  here.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/lab" size="sm">
                    Run an experiment
                  </ButtonLink>
                  <ButtonLink href="/learn" size="sm" variant="secondary">
                    Open the modules
                  </ButtonLink>
                </div>
              </Card>
            ) : (
              <>
                <ol className="mt-4 space-y-2">
                  {state.activity.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-900/50 px-4 py-3"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-glow-400"
                      />
                      <span className="min-w-0 flex-1 text-sm text-mist-200">
                        {entry.label}
                      </span>
                      <span className="shrink-0 text-xs text-mist-400">
                        {relativeDate(entry.at)}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6">
                  {confirming ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          reset();
                          setConfirming(false);
                        }}
                      >
                        Yes, clear my record
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirming(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirming(true)}
                    >
                      Clear my record
                    </Button>
                  )}
                </div>
              </>
            )}
          </section>

          <Card className="border-amber-400/25 bg-amber-400/5">
            <h2 className="text-sm font-semibold text-mist-100">
              A note on what these numbers mean
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mist-200 text-pretty">
              They count activities you have completed — nothing more. This is
              not a measurement of your AI literacy, and no percentage here
              would be meaningful. What matters is whether you notice yourself
              describing tasks more precisely, and checking answers more often.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
