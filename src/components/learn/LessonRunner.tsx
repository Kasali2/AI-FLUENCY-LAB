"use client";

import { useMemo, useState } from "react";

import { PromptBuilder } from "@/components/learn/PromptBuilder";
import { useProgress } from "@/components/progress/ProgressProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, Pill } from "@/components/ui/Card";
import { ACCENT_CLASSES, type Lesson, type PracticeModule } from "@/data/modules";

/**
 * Each lesson follows the same five beats:
 *   CONCEPT → EXAMPLE → INTERACTION → FEEDBACK → REFLECTION
 *
 * The student commits to a judgment before any explanation appears, which is
 * the mechanism the whole project is built on.
 */

const STAGES = ["Concept", "Example", "Try it", "Feedback", "Reflection"] as const;

export function LessonRunner({
  module,
  lesson,
  nextHref,
}: {
  module: PracticeModule;
  lesson: Lesson;
  nextHref?: { href: string; label: string };
}) {
  const accent = ACCENT_CLASSES[module.accent];
  const { recordLesson, recordReflection } = useProgress();

  const [choice, setChoice] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  const interaction = lesson.interaction;

  const auditScore = useMemo(() => {
    if (interaction.kind !== "audit") return null;

    const correct = interaction.options.filter((option) => option.correct);
    const hit = correct.filter((option) => flagged.includes(option.id)).length;
    const falseAlarms = interaction.options.filter(
      (option) => !option.correct && flagged.includes(option.id),
    ).length;

    return { total: correct.length, hit, falseAlarms };
  }, [interaction, flagged]);

  function submit() {
    if (submitted) return;
    setSubmitted(true);
    recordLesson(module.id, lesson.id, lesson.title);
  }

  function toggle(id: string) {
    if (submitted) return;
    setFlagged((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }

  const canSubmit =
    interaction.kind === "choose"
      ? choice !== null
      : interaction.kind === "audit"
        ? flagged.length > 0
        : false;

  return (
    <div className="space-y-5">
      {/* Concept ---------------------------------------------------------- */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Pill tone={module.accent}>{STAGES[0]}</Pill>
          <span className="text-xs text-mist-400">
            Step {module.step} · {module.title}
          </span>
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-mist-100 balance sm:text-2xl">
          {lesson.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-mist-200 pretty">
          {lesson.concept}
        </p>
      </Card>

      {/* Example ---------------------------------------------------------- */}
      <Card>
        <CardTitle icon="🔍">{STAGES[1]}</CardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-coral-400/25 bg-coral-400/5 p-4">
            <h4 className="text-xs font-semibold tracking-[0.12em] text-coral-400 uppercase">
              Weaker
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-mist-200 pretty">
              {lesson.example.weak}
            </p>
          </div>
          <div className="rounded-xl border border-mint-400/25 bg-mint-400/5 p-4">
            <h4 className="text-xs font-semibold tracking-[0.12em] text-mint-400 uppercase">
              Stronger
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-mist-200 pretty">
              {lesson.example.strong}
            </p>
          </div>
        </div>
        <p className={`mt-4 text-sm leading-relaxed ${accent.text} pretty`}>
          {lesson.example.note}
        </p>
      </Card>

      {/* Interaction ------------------------------------------------------ */}
      {interaction.kind === "builder" ? (
        <div className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <Pill tone="iris">{STAGES[2]}</Pill>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mist-200 pretty">
              {interaction.question}
            </p>
          </Card>

          <PromptBuilder />

          {!submitted ? (
            <Button size="lg" fullWidth onClick={submit}>
              I have finished building
            </Button>
          ) : null}

          {submitted ? (
            <>
              <Card className="border-mint-400/25">
                <CardTitle icon="✓">{STAGES[3]}</CardTitle>
                <p className="mt-3 text-[15px] leading-relaxed text-mist-200 pretty">
                  {interaction.reveal}
                </p>
              </Card>

              <ReflectionCard
                question={lesson.reflection}
                value={reflection}
                saved={saved}
                onChange={setReflection}
                onSave={() => {
                  setSaved(true);
                  recordReflection(`Reflected on “${lesson.title}”`);
                }}
                accentText={accent.text}
              />

              {nextHref ? (
                <NextLink href={nextHref.href} label={nextHref.label} />
              ) : null}
            </>
          ) : null}
        </div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone={interaction.kind === "audit" ? "amber" : "glow"}>
              {STAGES[2]}
            </Pill>
            <span className="text-xs text-mist-400">
              {interaction.kind === "audit"
                ? "Select every problem you can find"
                : "Choose the strongest option"}
            </span>
          </div>

          <p className="mt-3 text-[15px] leading-relaxed text-mist-100 pretty">
            {interaction.question}
          </p>

          {interaction.kind === "audit" ? (
            <figure className="mt-5">
              <figcaption className="text-xs text-mist-400">
                {interaction.context}
              </figcaption>
              <blockquote className="mt-3 border-l-2 border-amber-400/50 bg-ink-950/60 py-3 pr-3 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-mist-200 pretty">
                {interaction.material}
              </blockquote>
            </figure>
          ) : null}

          <fieldset className="mt-5" disabled={submitted}>
            <legend className="sr-only">
              {interaction.kind === "audit"
                ? "Statements to consider"
                : "Possible requests"}
            </legend>

            <ul className="space-y-3">
              {interaction.options.map((option) => {
                const isSelected =
                  interaction.kind === "audit"
                    ? flagged.includes(option.id)
                    : choice === option.id;

                return (
                  <li key={option.id}>
                    <OptionRow
                      option={option}
                      kind={interaction.kind}
                      selected={isSelected}
                      submitted={submitted}
                      accentRing={accent.ring}
                      onSelect={() =>
                        interaction.kind === "audit"
                          ? toggle(option.id)
                          : setChoice(option.id)
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {!submitted ? (
            <div className="mt-5">
              <Button size="lg" fullWidth onClick={submit} disabled={!canSubmit}>
                Submit my judgment
              </Button>
              <p className="mt-3 text-center text-xs text-mist-400">
                {canSubmit
                  ? "The explanation appears only after you commit to a choice."
                  : interaction.kind === "audit"
                    ? "Select at least one statement to continue."
                    : "Choose an option to continue."}
              </p>
            </div>
          ) : null}

          {submitted && auditScore ? (
            <p
              aria-live="polite"
              className="mt-5 rounded-xl border border-ink-600 bg-ink-950/60 p-4 text-sm text-mist-200"
            >
              You found{" "}
              <strong className={accent.text}>
                {auditScore.hit} of {auditScore.total}
              </strong>{" "}
              genuine problems
              {auditScore.falseAlarms > 0
                ? `, and flagged ${auditScore.falseAlarms} thing${
                    auditScore.falseAlarms === 1 ? "" : "s"
                  } that were not actually problems`
                : ", with no false alarms"}
              . Both numbers matter — over-flagging is its own kind of
              misjudgment.
            </p>
          ) : null}
        </Card>
      )}

      {/* Feedback + reflection for choose/audit --------------------------- */}
      {submitted && interaction.kind !== "builder" ? (
        <>
          <Card className="border-mint-400/25">
            <CardTitle icon="✓">{STAGES[3]}</CardTitle>
            <p className="mt-3 text-[15px] leading-relaxed text-mist-200 pretty">
              {interaction.reveal}
            </p>
          </Card>

          <ReflectionCard
            question={lesson.reflection}
            value={reflection}
            saved={saved}
            onChange={setReflection}
            onSave={() => {
              setSaved(true);
              recordReflection(`Reflected on “${lesson.title}”`);
            }}
            accentText={accent.text}
          />

          {nextHref ? <NextLink href={nextHref.href} label={nextHref.label} /> : null}
        </>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function OptionRow({
  option,
  kind,
  selected,
  submitted,
  accentRing,
  onSelect,
}: {
  option: { id: string; label: string; correct: boolean; feedback: string };
  kind: "choose" | "audit";
  selected: boolean;
  submitted: boolean;
  accentRing: string;
  onSelect: () => void;
}) {
  const isCorrect = option.correct;

  let tone = "border-ink-600 bg-ink-900/60 hover:border-mist-400/40";
  if (selected && !submitted) {
    tone = `border-transparent bg-ink-800 ring-2 ${accentRing}`;
  } else if (submitted && isCorrect && selected) {
    tone = "border-mint-400/50 bg-mint-400/8";
  } else if (submitted && !isCorrect && selected) {
    tone = "border-coral-400/50 bg-coral-400/8";
  } else if (submitted && isCorrect && !selected) {
    tone = "border-amber-400/40 bg-amber-400/5";
  } else if (submitted) {
    tone = "border-ink-700 bg-ink-900/40 opacity-70";
  }

  const badge = (() => {
    if (!submitted) return null;
    if (isCorrect && selected) return { text: "Correctly flagged", tone: "mint" };
    if (!isCorrect && selected)
      return { text: "Not actually a problem", tone: "coral" };
    if (isCorrect && !selected) return { text: "You missed this", tone: "amber" };
    return { text: "Correctly left alone", tone: "neutral" };
  })();

  const inputType = kind === "audit" ? "checkbox" : "radio";

  return (
    <div className={`rounded-xl border p-4 transition-colors ${tone}`}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type={inputType}
          name={`options-${kind}`}
          value={option.id}
          checked={selected}
          onChange={onSelect}
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-glow-400)]"
        />
        <span className="text-sm leading-relaxed text-mist-100 pretty">
          {option.label}
        </span>
      </label>

      {submitted ? (
        <div className="animate-fade-in mt-3 space-y-2 pl-7">
          {badge ? (
            <Pill tone={badge.tone as "mint" | "coral" | "amber" | "neutral"}>
              {badge.text}
            </Pill>
          ) : null}
          <p className="text-sm leading-relaxed text-mist-300 pretty">
            {option.feedback}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ReflectionCard({
  question,
  value,
  saved,
  onChange,
  onSave,
  accentText,
}: {
  question: string;
  value: string;
  saved: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  accentText: string;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <Pill tone="iris">Reflection</Pill>
      </div>
      <p className={`mt-3 text-[15px] leading-relaxed ${accentText} pretty`}>
        {question}
      </p>

      <label htmlFor="lesson-reflection" className="sr-only">
        Your reflection
      </label>
      <textarea
        id="lesson-reflection"
        rows={3}
        maxLength={800}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write a sentence or two in your own words."
        className="mt-4 w-full resize-y rounded-xl border border-ink-600 bg-ink-900/80 px-3 py-3 text-sm leading-relaxed text-mist-100 placeholder:text-mist-400/60 focus:border-glow-400/60"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          variant={saved ? "secondary" : "primary"}
          size="sm"
          onClick={onSave}
          disabled={value.trim().length < 2}
        >
          {saved ? "Reflection saved" : "Save reflection"}
        </Button>
        <span className="text-xs text-mist-400">
          {value.trim().length}/800 characters
        </span>
      </div>

      {saved ? (
        <p className="animate-fade-in mt-3 text-xs text-mint-400">
          Saved to your progress. Reflections stay in this browser.
        </p>
      ) : null}
    </Card>
  );
}

function NextLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-card border border-ink-600 bg-ink-800/60 p-4 transition-colors hover:border-glow-400/40 hover:bg-ink-800"
    >
      <span className="text-sm font-semibold text-mist-100">{label}</span>
      <span aria-hidden="true" className="text-glow-300">
        →
      </span>
    </a>
  );
}
