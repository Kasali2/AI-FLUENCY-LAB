"use client";

import { useRef } from "react";

import { Card, Pill } from "@/components/ui/Card";
import {
  PROMPT_VARIANTS,
  VARIANT_SHORT,
  type PromptSet,
  type PromptVariant,
  type ResponseSet,
} from "@/lib/schemas";

const KIND_NOTE: Record<PromptVariant, string> = {
  minimal:
    "A vague, one-line request — the kind you send when you are in a hurry.",
  descriptive:
    "A request that states the goal, audience, constraints and desired output.",
  collaborative:
    "A request that asks the AI to find out what you know first, then teach you.",
};

const TAB_TONE: Record<PromptVariant, "glow" | "iris" | "amber"> = {
  minimal: "glow",
  descriptive: "iris",
  collaborative: "amber",
};

/**
 * Three approaches, one at a time. Tabs keep the comparison usable on a phone,
 * where three full responses side by side would be unreadable.
 *
 * Deliberately no verdict is shown here: the student chooses first, and the
 * analysis is revealed only after they have committed.
 */
export function ResponsePanel({
  prompts,
  responses,
  active,
  onChange,
  locked,
}: {
  prompts: PromptSet;
  responses: ResponseSet;
  active: PromptVariant;
  onChange: (variant: PromptVariant) => void;
  locked?: boolean;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;

    event.preventDefault();
    const next =
      (index + delta + PROMPT_VARIANTS.length) % PROMPT_VARIANTS.length;
    onChange(PROMPT_VARIANTS[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Compare the three approaches"
        className="grid grid-cols-3 gap-1.5 rounded-2xl border border-ink-700 bg-ink-900/70 p-1.5"
      >
        {PROMPT_VARIANTS.map((variant, index) => {
          const selected = variant === active;

          return (
            <button
              key={variant}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              type="button"
              id={`tab-${variant}`}
              aria-selected={selected}
              aria-controls={`panel-${variant}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(variant)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                selected
                  ? "bg-ink-700 text-mist-100"
                  : "text-mist-400 hover:bg-ink-800 hover:text-mist-200"
              }`}
            >
              <span className="mr-1.5 font-mono text-[10px] opacity-70">
                {String.fromCharCode(65 + index)}
              </span>
              {VARIANT_SHORT[variant]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        key={active}
        className="animate-fade-in mt-4 space-y-4"
      >
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={TAB_TONE[active]}>{VARIANT_SHORT[active]} request</Pill>
            {locked ? <Pill tone="neutral">Locked</Pill> : null}
          </div>
          <p className="mt-2 text-xs text-mist-400">{KIND_NOTE[active]}</p>
          <p className="mt-4 border-l-2 border-mist-400/30 pl-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-mist-100">
            {prompts[active]}
          </p>
        </Card>

        <Card>
          <h3 className="text-xs font-semibold tracking-[0.14em] text-mist-300 uppercase">
            What the AI replied
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap text-mist-200 pretty">
            {responses[active]}
          </p>
        </Card>
      </div>
    </div>
  );
}
