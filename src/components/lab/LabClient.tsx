"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ResponsePanel } from "@/components/lab/ResponsePanel";
import { StepRail, type RailStage } from "@/components/lab/StepRail";
import { useProgress } from "@/components/progress/ProgressProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BulletBlock, Card, CardTitle, Pill } from "@/components/ui/Card";
import { DemoNotice, ErrorNotice, LoadingPanel } from "@/components/ui/Feedback";
import { postJson } from "@/lib/client";
import { useAiStatus } from "@/lib/use-ai-status";
import {
  PROMPT_VARIANTS,
  VARIANT_LABEL,
  VARIANT_SHORT,
  type ExperimentResult,
  type ImprovedRun,
  type JudgmentFeedback,
  type PromptVariant,
  type Reflection,
} from "@/lib/schemas";

/* -------------------------------------------------------------------------- */
/* Steps                                                                      */
/* -------------------------------------------------------------------------- */

type Step =
  | "task"
  | "compare"
  | "judge"
  | "feedback"
  | "improve"
  | "result"
  | "reflect"
  | "done";

const RAIL: Record<Step, RailStage> = {
  task: "Task",
  compare: "Compare",
  judge: "Judge",
  feedback: "Judge",
  improve: "Improve",
  result: "Improve",
  reflect: "Reflect",
  done: "Reflect",
};

const EXAMPLE_TASKS: Array<{ label: string; subject: string }> = [
  { label: "Explain photosynthesis to a Grade 12 student", subject: "Biology" },
  { label: "Explain the nitrogen cycle for my Biology test", subject: "Biology" },
  {
    label: "Explain how a catalytic converter reduces pollution",
    subject: "Chemistry",
  },
  { label: "Explain stopping distance for my Physics test", subject: "Physics" },
  {
    label: "Explain urban sprawl and its effects on a Zambian city",
    subject: "Geography",
  },
  {
    label: "Help me understand a constitutional principle",
    subject: "Civic Education",
  },
  { label: "Help me debug a JavaScript project", subject: "Technology" },
  {
    label: "Help me troubleshoot an ultrasonic sensor in our robotics club",
    subject: "Robotics",
  },
  { label: "Prepare a presentation on climate change", subject: "General" },
];

const COMPARE_MESSAGES = [
  "Designing the experiment…",
  "Working out what your task is really asking for…",
  "Writing three different approaches to the same task…",
  "Generating the replies each approach would receive…",
];

const JUDGE_MESSAGES = [
  "Reviewing your reasoning…",
  "Reading your explanation against the three approaches…",
  "Preparing what changed between them…",
];

const RUN_MESSAGES = [
  "Running your prompt…",
  "Answering it exactly as you wrote it…",
  "Noting what your wording changed…",
];

const REFLECT_MESSAGES = [
  "Reviewing what you changed…",
  "Preparing your reflection…",
];

type ErrorState = { message: string; code?: string } | null;

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function LabClient({
  initialDemo,
  demoTask,
}: {
  initialDemo: boolean;
  demoTask: string;
}) {
  const { recordExperiment, recordReflection } = useProgress();
  const { configured, loading: statusLoading } = useAiStatus();

  const [step, setStep] = useState<Step>("task");
  const [task, setTask] = useState("");
  const [demo, setDemo] = useState(initialDemo);
  const [busy, setBusy] = useState<string[] | null>(null);
  const [error, setError] = useState<ErrorState>(null);

  const [experiment, setExperiment] = useState<ExperimentResult | null>(null);
  const [activeVariant, setActiveVariant] = useState<PromptVariant>("descriptive");

  const [chosen, setChosen] = useState<PromptVariant | null>(null);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<JudgmentFeedback | null>(null);

  const [editing, setEditing] = useState<PromptVariant>("descriptive");
  const [draft, setDraft] = useState("");
  const [runResult, setRunResult] = useState<ImprovedRun | null>(null);

  const [changeNote, setChangeNote] = useState("");
  const [reflection, setReflection] = useState<Reflection | null>(null);

  const autoStarted = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  /* ---------------------------------------------------------------- actions */

  const startExperiment = useCallback(
    async (taskText: string, isDemo: boolean) => {
      setError(null);
      setBusy(COMPARE_MESSAGES);

      const result = await postJson<ExperimentResult>("/api/experiment", {
        task: taskText,
        demo: isDemo,
      });

      setBusy(null);

      if (!result.ok) {
        setError({ message: result.error.message, code: result.error.code });
        return;
      }

      setTask(taskText);
      setDemo(result.demo);
      setExperiment(result.data);
      setActiveVariant("descriptive");
      setChosen(null);
      setReason("");
      setFeedback(null);
      setRunResult(null);
      setReflection(null);
      setChangeNote("");
      setDraft("");
      setStep("compare");
      recordExperiment(taskText);
    },
    [recordExperiment],
  );

  const submitJudgment = useCallback(async () => {
    if (!experiment || !chosen || !experiment) return;

    setError(null);
    setBusy(JUDGE_MESSAGES);

    const result = await postJson<JudgmentFeedback>("/api/judgment", {
      task,
      prompts: experiment.prompts,
      responses: experiment.responses,
      chosen,
      reason,
      demo,
    });

    setBusy(null);

    if (!result.ok) {
      setError({ message: result.error.message, code: result.error.code });
      return;
    }

    setFeedback(result.data);
    setDemo(result.demo);
    setEditing(chosen);
    setDraft(experiment.prompts[chosen]);
    setStep("feedback");
  }, [experiment, chosen, reason, task, demo]);

  const runImproved = useCallback(async () => {
    setError(null);
    setBusy(RUN_MESSAGES);

    const result = await postJson<ImprovedRun>("/api/run-prompt", {
      task,
      prompt: draft,
      demo,
    });

    setBusy(null);

    if (!result.ok) {
      setError({ message: result.error.message, code: result.error.code });
      return;
    }

    setRunResult(result.data);
    setDemo(result.demo);
    setStep("result");
  }, [task, draft, demo]);

  const submitReflection = useCallback(async () => {
    if (!experiment) return;

    setError(null);
    setBusy(REFLECT_MESSAGES);

    const result = await postJson<Reflection>("/api/reflection", {
      task,
      originalPrompt: experiment.prompts[editing],
      improvedPrompt: draft,
      changeNote,
      demo,
    });

    setBusy(null);

    if (!result.ok) {
      setError({ message: result.error.message, code: result.error.code });
      return;
    }

    setReflection(result.data);
    setDemo(result.demo);
    setStep("done");
    recordReflection(`Reflected on “${task.slice(0, 50)}”`);
  }, [experiment, task, editing, draft, changeNote, demo, recordReflection]);

  // Deep link from the homepage: /lab?demo=1 runs the walkthrough immediately.
  useEffect(() => {
    if (!initialDemo || autoStarted.current) return;
    autoStarted.current = true;
    void startExperiment(demoTask, true);
  }, [initialDemo, demoTask, startExperiment]);

  const retry = () => {
    const map: Partial<Record<Step, () => void>> = {
      task: () => void startExperiment(task || demoTask, demo),
      compare: () => void startExperiment(task, demo),
      judge: () => void submitJudgment(),
      feedback: () => void submitJudgment(),
      improve: () => void runImproved(),
      result: () => void runImproved(),
      reflect: () => void submitReflection(),
    };
    map[step]?.();
  };

  /* ------------------------------------------------------------------ render */

  return (
    <div>
      <StepRail stage={RAIL[step]} />

      {demo ? (
        <div className="mb-5">
          <DemoNotice />
        </div>
      ) : null}

      {error ? (
        <div className="mb-5">
          <ErrorNotice
            message={error.message}
            code={error.code}
            onRetry={retry}
            onDismiss={() => setError(null)}
          />
        </div>
      ) : null}

      {busy ? (
        <LoadingPanel
          title={busy[0]}
          messages={busy}
        />
      ) : (
        <>
          {step === "task" ? (
            <TaskStep
              task={task}
              setTask={setTask}
              configured={configured}
              statusLoading={statusLoading}
              onStart={() => void startExperiment(task.trim(), false)}
              onDemo={() => void startExperiment(demoTask, true)}
            />
          ) : null}

          {step === "compare" && experiment ? (
            <CompareStep
              experiment={experiment}
              active={activeVariant}
              onChange={setActiveVariant}
              onContinue={() => setStep("judge")}
            />
          ) : null}

          {step === "judge" && experiment ? (
            <JudgeStep
              experiment={experiment}
              chosen={chosen}
              setChosen={setChosen}
              reason={reason}
              setReason={setReason}
              onSubmit={() => void submitJudgment()}
            />
          ) : null}

          {step === "feedback" && feedback ? (
            <FeedbackStep
              feedback={feedback}
              chosen={chosen}
              onContinue={() => setStep("improve")}
            />
          ) : null}

          {step === "improve" && experiment ? (
            <ImproveStep
              experiment={experiment}
              editing={editing}
              setEditing={setEditing}
              draft={draft}
              setDraft={setDraft}
              onSubmit={() => void runImproved()}
            />
          ) : null}

          {step === "result" && runResult ? (
            <ResultStep
              runResult={runResult}
              prompt={draft}
              onContinue={() => setStep("reflect")}
            />
          ) : null}

          {step === "reflect" ? (
            <ReflectStep
              changeNote={changeNote}
              setChangeNote={setChangeNote}
              onSubmit={() => void submitReflection()}
            />
          ) : null}

          {step === "done" && reflection ? (
            <DoneStep
              reflection={reflection}
              onRestart={() => {
                setStep("task");
                setTask("");
                setDemo(false);
                setExperiment(null);
                setFeedback(null);
                setRunResult(null);
                setReflection(null);
                setChosen(null);
                setReason("");
                setChangeNote("");
                setDraft("");
              }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 1 — the task                                                          */
/* -------------------------------------------------------------------------- */

function TaskStep({
  task,
  setTask,
  configured,
  statusLoading,
  onStart,
  onDemo,
}: {
  task: string;
  setTask: (value: string) => void;
  configured: boolean;
  statusLoading: boolean;
  onStart: () => void;
  onDemo: () => void;
}) {
  const trimmed = task.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < 3;

  return (
    <div className="space-y-5">
      <Card>
        <Pill tone="glow">Step 1</Pill>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-mist-100 balance sm:text-3xl">
          What do you want AI to help you do?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist-300 pretty">
          You will get three different ways of asking for the same thing, and
          the replies they produce. Then you will decide which one you would
          have used — and find out what you noticed and what you missed.
        </p>

        <label
          htmlFor="lab-task"
          className="mt-6 block text-xs font-semibold tracking-[0.12em] text-mist-300 uppercase"
        >
          Your task
        </label>
        <textarea
          id="lab-task"
          rows={3}
          maxLength={400}
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="e.g. Explain photosynthesis to a Grade 12 student"
          className="mt-2 w-full resize-y rounded-xl border border-ink-600 bg-ink-900/80 px-4 py-3 text-[15px] leading-relaxed text-mist-100 placeholder:text-mist-400/60 focus:border-glow-400/60"
          aria-describedby="lab-task-help"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p id="lab-task-help" className="text-xs text-mist-400">
            Keep it to a sentence. Do not include personal information.
          </p>
          <p className="text-xs text-mist-400">{trimmed.length}/400</p>
        </div>

        {tooShort ? (
          <p className="mt-3 text-xs text-amber-400">
            Give it at least a few words so the experiment has something to work
            with.
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={onStart}
            disabled={trimmed.length < 3 || !configured}
            className="sm:w-auto sm:flex-1"
          >
            Design the experiment
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={onDemo}
            className="sm:w-auto"
          >
            Try the demo
          </Button>
        </div>

        {!statusLoading && !configured ? (
          <p className="mt-4 rounded-xl bg-ink-900/80 p-3 text-xs leading-relaxed text-mist-400">
            This server has no AI key configured, so live experiments are
            switched off. The demo runs the full walkthrough with prepared
            example content — and every learning module works completely.
          </p>
        ) : null}
      </Card>

      <Card>
        <CardTitle icon="📚">Example tasks, including Zambian contexts</CardTitle>
        <p className="mt-2 text-xs text-mist-400">
          Pick one to try, or write your own.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_TASKS.map((example) => (
            <li key={example.label}>
              <button
                type="button"
                onClick={() => setTask(example.label)}
                className="rounded-full border border-ink-600 bg-ink-800/60 px-3.5 py-2 text-left text-xs text-mist-200 transition-colors hover:border-glow-400/50 hover:text-mist-100"
              >
                <span className="mr-1.5 text-[10px] tracking-wide text-mist-400 uppercase">
                  {example.subject}
                </span>
                {example.label}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2 — compare                                                           */
/* -------------------------------------------------------------------------- */

function CompareStep({
  experiment,
  active,
  onChange,
  onContinue,
}: {
  experiment: ExperimentResult;
  active: PromptVariant;
  onChange: (variant: PromptVariant) => void;
  onContinue: () => void;
}) {
  const { analysis, focusPoints, prompts, responses } = experiment;

  return (
    <div className="space-y-5">
      <Card>
        <Pill tone="glow">Step 2</Pill>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-mist-100 balance sm:text-2xl">
          Three approaches to your task
        </h1>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-mist-400">Topic</dt>
            <dd className="mt-0.5 text-mist-100">{analysis.subject}</dd>
          </div>
          <div>
            <dt className="text-mist-400">Subject area</dt>
            <dd className="mt-0.5 text-mist-100">{analysis.domain}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-mist-400">Level</dt>
            <dd className="mt-0.5 text-mist-100">{analysis.level}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-relaxed text-mist-200 pretty">
          {analysis.summary}
        </p>
      </Card>

      <Card className="border-glow-400/25 bg-ink-900/50">
        <CardTitle icon="🔎">What to look at</CardTitle>
        <ul className="mt-3 space-y-2">
          {focusPoints.map((point) => (
            <li
              key={point}
              className="flex gap-3 text-sm leading-relaxed text-mist-200 pretty"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-glow-400"
              />
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-mist-400">
          These are lenses, not answers. You decide what matters.
        </p>
      </Card>

      <ResponsePanel
        prompts={prompts}
        responses={responses}
        active={active}
        onChange={onChange}
      />

      <Button size="lg" fullWidth onClick={onContinue}>
        I have compared them
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3 — judgment                                                          */
/* -------------------------------------------------------------------------- */

function JudgeStep({
  experiment,
  chosen,
  setChosen,
  reason,
  setReason,
  onSubmit,
}: {
  experiment: ExperimentResult;
  chosen: PromptVariant | null;
  setChosen: (variant: PromptVariant) => void;
  reason: string;
  setReason: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card>
        <Pill tone="glow">Step 3</Pill>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-mist-100 balance sm:text-2xl">
          Which response would you choose?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist-300 pretty">
          There is no score here. We want your judgment, not the right answer.
        </p>

        <fieldset className="mt-5">
          <legend className="sr-only">Choose one response</legend>
          <ul className="space-y-3">
            {PROMPT_VARIANTS.map((variant, index) => {
              const selected = chosen === variant;
              return (
                <li key={variant}>
                  <button
                    type="button"
                    onClick={() => setChosen(variant)}
                    aria-pressed={selected}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? "border-glow-400/60 bg-glow-400/8"
                        : "border-ink-600 bg-ink-900/60 hover:border-mist-400/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-mist-400">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm font-semibold text-mist-100">
                        {VARIANT_SHORT[variant]}
                      </span>
                      {selected ? (
                        <span className="ml-auto text-xs text-glow-300">
                          Selected
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-mist-300">
                      {experiment.prompts[variant]}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </Card>

      {chosen ? (
        <Card className="animate-fade-up">
          <Pill tone="iris">Step 4</Pill>
          <h2 className="mt-4 text-lg font-semibold text-mist-100">
            Why would you choose {VARIANT_LABEL[chosen]}?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist-300 pretty">
            Write it as you would say it out loud. Naming what you noticed is
            what turns a comparison into learning.
          </p>

          <label htmlFor="lab-reason" className="sr-only">
            Your reason
          </label>
          <textarea
            id="lab-reason"
            rows={4}
            maxLength={1200}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. It tells the AI who the answer is for, so it will not guess at the level. The other two either leave too much open or never actually explain anything."
            className="mt-4 w-full resize-y rounded-xl border border-ink-600 bg-ink-900/80 px-4 py-3 text-sm leading-relaxed text-mist-100 placeholder:text-mist-400/60 focus:border-glow-400/60"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-mist-400">
              {reason.trim().length}/1200
            </span>
          </div>

          <div className="mt-4">
            <Button
              size="lg"
              fullWidth
              onClick={onSubmit}
              disabled={reason.trim().length < 2}
            >
              Submit my reasoning
            </Button>
            <p className="mt-3 text-center text-xs text-mist-400">
              The analysis appears only after you submit.
            </p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 4 — feedback                                                          */
/* -------------------------------------------------------------------------- */

function FeedbackStep({
  feedback,
  chosen,
  onContinue,
}: {
  feedback: JudgmentFeedback;
  chosen: PromptVariant | null;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card className="border-mint-400/25">
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone="mint">Analysis</Pill>
          {chosen ? (
            <span className="text-xs text-mist-400">
              You chose {VARIANT_SHORT[chosen]}
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-mist-100 pretty">
          {feedback.acknowledgement}
        </p>
      </Card>

      <Card className="space-y-7">
        <BulletBlock
          title="What you got right"
          items={feedback.strengths}
          tone="mint"
          icon="✓"
        />
        <BulletBlock
          title="Good observations"
          items={feedback.goodObservations}
          tone="glow"
        />
        <BulletBlock
          title="What you did not mention"
          items={feedback.missedFactors}
          tone="amber"
        />
        <BulletBlock
          title="Worth keeping in mind"
          items={feedback.possibleMisconceptions}
          tone="iris"
        />
      </Card>

      <Card>
        <CardTitle icon="🔀">What actually changed between the approaches</CardTitle>
        <ul className="mt-4 space-y-5">
          {feedback.differences.map((entry) => (
            <li key={entry.variant}>
              <h4 className="text-sm font-semibold text-mist-100">
                <span className="mr-2 font-mono text-[11px] text-mist-400">
                  {VARIANT_LABEL[entry.variant].slice(-1)}
                </span>
                {entry.headline}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-mist-300 pretty">
                {entry.detail}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-amber-400/25 bg-amber-400/5">
        <CardTitle icon="🛡">Before you rely on any of this</CardTitle>
        <p className="mt-3 text-sm leading-relaxed text-mist-200 pretty">
          {feedback.uncertaintyNote}
        </p>
      </Card>

      <Card className="border-glow-400/25">
        <CardTitle icon="→">Your next step</CardTitle>
        <p className="mt-3 text-sm leading-relaxed text-mist-200 pretty">
          {feedback.nextStep}
        </p>
        <div className="mt-5">
          <Button size="lg" fullWidth onClick={onContinue}>
            Now improve a prompt myself
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 5 — improve                                                           */
/* -------------------------------------------------------------------------- */

function ImproveStep({
  experiment,
  editing,
  setEditing,
  draft,
  setDraft,
  onSubmit,
}: {
  experiment: ExperimentResult;
  editing: PromptVariant;
  setEditing: (variant: PromptVariant) => void;
  draft: string;
  setDraft: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card>
        <Pill tone="iris">Step 5</Pill>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-mist-100 balance sm:text-2xl">
          Rewrite a prompt in your own words
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist-300 pretty">
          Start from any of the three approaches, then change what you think
          needs changing. Keep the parts that already work and add what you
          noticed was missing.
        </p>

        <div
          role="radiogroup"
          aria-label="Starting point"
          className="mt-5 flex flex-wrap gap-2"
        >
          {PROMPT_VARIANTS.map((variant) => (
            <button
              key={variant}
              type="button"
              role="radio"
              aria-checked={editing === variant}
              onClick={() => {
                setEditing(variant);
                setDraft(experiment.prompts[variant]);
              }}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                editing === variant
                  ? "border-iris-400/60 bg-iris-400/10 text-iris-300"
                  : "border-ink-600 bg-ink-800/60 text-mist-300 hover:text-mist-100"
              }`}
            >
              Start from {VARIANT_SHORT[variant]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setEditing("descriptive");
              setDraft("");
            }}
            className="rounded-full border border-ink-600 bg-ink-800/60 px-3.5 py-2 text-xs font-semibold text-mist-300 transition-colors hover:text-mist-100"
          >
            Start from scratch
          </button>
        </div>

        <label
          htmlFor="lab-draft"
          className="mt-5 block text-xs font-semibold tracking-[0.12em] text-mist-300 uppercase"
        >
          Your prompt
        </label>
        <textarea
          id="lab-draft"
          rows={7}
          maxLength={2000}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write the prompt you would actually use next time."
          className="mt-2 w-full resize-y rounded-xl border border-ink-600 bg-ink-900/80 px-4 py-3 font-mono text-[13px] leading-relaxed text-mist-100 placeholder:text-mist-400/60 focus:border-glow-400/60"
        />

        <div className="mt-2 text-right text-xs text-mist-400">
          {draft.trim().length}/2000
        </div>

        <div className="mt-4">
          <Button
            size="lg"
            fullWidth
            onClick={onSubmit}
            disabled={draft.trim().length < 5}
          >
            Run my prompt
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 6 — result                                                            */
/* -------------------------------------------------------------------------- */

function ResultStep({
  runResult,
  prompt,
  onContinue,
}: {
  runResult: ImprovedRun;
  prompt: string;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card>
        <Pill tone="iris">Step 6</Pill>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-mist-100 balance sm:text-2xl">
          What your prompt produced
        </h1>
        <p className="mt-4 border-l-2 border-iris-400/40 pl-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-mist-300">
          {prompt}
        </p>
      </Card>

      <Card>
        <h3 className="text-xs font-semibold tracking-[0.14em] text-mist-300 uppercase">
          The reply
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap text-mist-200 pretty">
          {runResult.response}
        </p>
      </Card>

      <Card className="space-y-7">
        <BulletBlock
          title="What your wording changed"
          items={runResult.whatThisPromptAdds}
          tone="mint"
          icon="✓"
        />
        <BulletBlock
          title="Still worth checking"
          items={runResult.watchOutFor}
          tone="amber"
        />
      </Card>

      <Button size="lg" fullWidth onClick={onContinue}>
        Continue to reflection
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 7 — reflection                                                        */
/* -------------------------------------------------------------------------- */

function ReflectStep({
  changeNote,
  setChangeNote,
  onSubmit,
}: {
  changeNote: string;
  setChangeNote: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Card>
      <Pill tone="mint">Step 7</Pill>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-mist-100 balance sm:text-2xl">
        What did you change, and why?
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-mist-300 pretty">
        One or two sentences is enough. Putting the change into words is what
        makes it stick.
      </p>

      <label htmlFor="lab-change" className="sr-only">
        What you changed and why
      </label>
      <textarea
        id="lab-change"
        rows={4}
        maxLength={800}
        value={changeNote}
        onChange={(event) => setChangeNote(event.target.value)}
        placeholder="e.g. I added who the answer is for and asked it to test me at the end, because the first reply explained everything without checking whether I had followed it."
        className="mt-4 w-full resize-y rounded-xl border border-ink-600 bg-ink-900/80 px-4 py-3 text-sm leading-relaxed text-mist-100 placeholder:text-mist-400/60 focus:border-glow-400/60"
      />

      <div className="mt-2 text-right text-xs text-mist-400">
        {changeNote.trim().length}/800
      </div>

      <div className="mt-4">
        <Button
          size="lg"
          fullWidth
          onClick={onSubmit}
          disabled={changeNote.trim().length < 2}
        >
          Finish the experiment
        </Button>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 8 — done                                                              */
/* -------------------------------------------------------------------------- */

function DoneStep({
  reflection,
  onRestart,
}: {
  reflection: Reflection;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card className="border-mint-400/25">
        <Pill tone="mint">Experiment complete</Pill>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-mist-100 balance sm:text-2xl">
          What you did this time
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-mist-100 pretty">
          {reflection.changeSummary}
        </p>
      </Card>

      <Card className="space-y-7">
        <BulletBlock
          title="What is stronger now"
          items={reflection.whatImproved}
          tone="mint"
          icon="✓"
        />
        <BulletBlock
          title="What to try next time"
          items={reflection.whatToTryNext}
          tone="glow"
        />
      </Card>

      <Card className="border-glow-400/25 bg-ink-900/50">
        <p className="text-[15px] leading-relaxed text-mist-100 pretty">
          {reflection.closing}
        </p>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" fullWidth onClick={onRestart}>
          Run another experiment
        </Button>
        <ButtonLink size="lg" variant="secondary" fullWidth href="/learn">
          Practise the four skills
        </ButtonLink>
      </div>

      <p className="text-center text-xs text-mist-400">
        You can see everything you have completed on the{" "}
        <Link href="/progress" className="text-glow-300 underline-offset-2 hover:underline">
          progress page
        </Link>
        .
      </p>
    </div>
  );
}
