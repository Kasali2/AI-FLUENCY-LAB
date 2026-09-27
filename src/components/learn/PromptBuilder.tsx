"use client";

import { useMemo, useState } from "react";

import { BUILDER_FIELDS } from "@/data/modules";
import { postJson } from "@/lib/client";
import { useAiStatus } from "@/lib/use-ai-status";
import type { ImprovedRun } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { BulletBlock, Card, CardTitle, Pill } from "@/components/ui/Card";
import { ErrorNotice, LoadingPanel } from "@/components/ui/Feedback";

/**
 * DESCRIPTION module, lesson 1.
 *
 * The student assembles a request from six parts and watches what the AI would
 * otherwise have decided for them. The live preview is the whole lesson: the
 * "still undecided" panel is the explanation, delivered as a consequence of
 * their own choices rather than as advice.
 */

const UNDECIDED: Record<string, string> = {
  goal:
    "what you are actually trying to achieve — so it will guess, and probably aim at the wrong thing",
  context:
    "your starting point — so it may explain what you already know, or skip over what you do not",
  audience:
    "who the answer is for — so the level could be anything from a child to a specialist",
  constraints:
    "any limits — so it will decide the length and depth itself",
  format:
    "how to lay the answer out — so you will get a wall of text rather than something you can revise from",
  success:
    "what would make the answer good enough — so neither of you can tell whether the task is finished",
};

export function PromptBuilder() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [run, setRun] = useState<ImprovedRun | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const { configured, loading } = useAiStatus();

  const filled = useMemo(
    () => BUILDER_FIELDS.filter((field) => values[field.id]?.trim()),
    [values],
  );

  const missing = useMemo(
    () => BUILDER_FIELDS.filter((field) => !values[field.id]?.trim()),
    [values],
  );

  const preview = useMemo(() => composePrompt(values), [values]);

  async function handleRun() {
    setBusy(true);
    setError(null);
    setRun(null);

    const result = await postJson<ImprovedRun>("/api/run-prompt", {
      task: values.goal?.trim() || preview.slice(0, 380) || "A study task",
      prompt: preview.slice(0, 2000),
      demo: false,
    });

    if (result.ok) setRun(result.data);
    else setError({ message: result.error.message, code: result.error.code });

    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle icon="🧪">
            Build a request, one decision at a time
          </CardTitle>
          <Pill tone="iris">
            {filled.length} of {BUILDER_FIELDS.length} decided
          </Pill>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-mist-300 pretty">
          Fill in as much or as little as you like. Nothing is scored — the
          preview below shows you exactly what the AI would be working with.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {BUILDER_FIELDS.map((field) => (
            <div key={field.id}>
              <label
                htmlFor={`builder-${field.id}`}
                className="block text-xs font-semibold tracking-[0.12em] text-mist-300 uppercase"
              >
                {field.label}
              </label>
              <p className="mt-1 text-xs text-mist-400">{field.hint}</p>
              <textarea
                id={`builder-${field.id}`}
                rows={2}
                maxLength={300}
                value={values[field.id] ?? ""}
                placeholder={field.placeholder}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.id]: event.target.value,
                  }))
                }
                className="mt-2 w-full resize-y rounded-xl border border-ink-600 bg-ink-900/80 px-3 py-2.5 text-sm text-mist-100 placeholder:text-mist-400/60 focus:border-glow-400/60"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setValues(
                Object.fromEntries(
                  BUILDER_FIELDS.map((field) => [field.id, field.example]),
                ),
              )
            }
          >
            Show me a filled-in example
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setValues({})}
            disabled={!filled.length}
          >
            Clear
          </Button>
        </div>
      </Card>

      <Card className="border-glow-400/25 bg-ink-900/60">
        <CardTitle icon="📋">Your request, as the AI would receive it</CardTitle>

        {filled.length === 0 ? (
          <p className="mt-3 text-sm text-mist-400">
            Start filling in the fields above and your request will appear here.
          </p>
        ) : (
          <pre className="mt-3 border-l-2 border-glow-400/50 pl-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-mist-100">
            {preview}
          </pre>
        )}

        {missing.length ? (
          <div className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4">
            <h4 className="text-xs font-semibold tracking-[0.12em] text-amber-400 uppercase">
              Still undecided — the AI will choose for you
            </h4>
            <ul className="mt-3 space-y-2">
              {missing.map((field) => (
                <li
                  key={field.id}
                  className="flex gap-3 text-sm leading-relaxed text-mist-200 pretty"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400"
                  />
                  <span>
                    <span className="font-medium text-mist-100">
                      {field.label}:
                    </span>{" "}
                    {UNDECIDED[field.id]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-mint-400/25 bg-mint-400/5 p-4 text-sm leading-relaxed text-mist-200 pretty">
            You have made every decision yourself. There is nothing left for the
            AI to guess, which is exactly why an answer to this request would be
            easy to judge.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle icon="▶">Optional: see what this request actually produces</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-mist-300 pretty">
          This runs your assembled request through the same pipeline the Lab
          uses. It is the fastest way to feel the difference between a described
          task and a vague one.
        </p>

        {!loading && !configured ? (
          <p className="mt-3 rounded-xl bg-ink-900/80 p-3 text-xs leading-relaxed text-mist-400">
            The server has no AI key configured, so this button cannot run a
            live request yet. Everything above still works fully — and the Lab
            has a demonstration you can try instead.
          </p>
        ) : null}

        <div className="mt-4">
          <Button
            onClick={handleRun}
            disabled={!configured || busy || filled.length === 0}
            loading={busy}
          >
            {busy ? "Running your request…" : "Run this request"}
          </Button>
        </div>

        {busy ? (
          <div className="mt-5">
            <LoadingPanel
              title="Answering your request…"
              messages={[
                "Sending your request to the model…",
                "Composing a reply at the level you asked for…",
                "Noting what your wording changed…",
              ]}
            />
          </div>
        ) : null}

        {error && !busy ? (
          <div className="mt-5">
            <ErrorNotice
              message={error.message}
              code={error.code}
              onRetry={handleRun}
              onDismiss={() => setError(null)}
            />
          </div>
        ) : null}

        {run && !busy ? (
          <div className="animate-fade-up mt-5 space-y-5">
            <div className="rounded-xl border border-ink-600 bg-ink-950/70 p-4">
              <h4 className="text-xs font-semibold tracking-[0.12em] text-mist-300 uppercase">
                The reply
              </h4>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-mist-100 pretty">
                {run.response}
              </p>
            </div>

            <BulletBlock
              title="What your wording changed"
              items={run.whatThisPromptAdds}
              tone="mint"
            />
            <BulletBlock
              title="Still worth checking"
              items={run.watchOutFor}
              tone="amber"
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function composePrompt(values: Record<string, string>): string {
  const get = (id: string) => values[id]?.trim() ?? "";
  const lines: string[] = [];

  if (get("goal")) lines.push(ensureSentence(get("goal")));
  if (get("context")) lines.push(ensureSentence(get("context")));
  if (get("audience")) lines.push(`Write this for ${lowerFirst(get("audience"))}.`);
  if (get("constraints")) lines.push(`Constraints: ${get("constraints")}.`);
  if (get("format")) lines.push(`Output format: ${get("format")}.`);
  if (get("success")) lines.push(`Success looks like: ${get("success")}.`);

  return lines.join("\n");
}

function ensureSentence(value: string): string {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
