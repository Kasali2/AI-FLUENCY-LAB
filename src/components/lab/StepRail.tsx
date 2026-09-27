const STEPS = ["Task", "Compare", "Judge", "Improve", "Reflect"] as const;

export type RailStage = (typeof STEPS)[number];

export function stageIndex(stage: RailStage): number {
  return STEPS.indexOf(stage);
}

/**
 * A quiet progress indicator. It tells the student how far through the
 * experiment they are without turning the experience into a quiz.
 */
export function StepRail({ stage }: { stage: RailStage }) {
  const current = stageIndex(stage);

  return (
    <nav aria-label="Experiment progress" className="mb-6">
      <ol className="flex items-center gap-1.5">
        {STEPS.map((label, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li key={label} className="flex-1">
              <div
                aria-hidden="true"
                className={`h-1 rounded-full transition-colors duration-500 ${
                  done
                    ? "bg-glow-400"
                    : active
                      ? "bg-gradient-to-r from-glow-400 to-iris-400"
                      : "bg-ink-700"
                }`}
              />
              <span
                className={`mt-2 block text-center text-[10px] font-medium tracking-wide sm:text-xs ${
                  active
                    ? "text-glow-300"
                    : done
                      ? "text-mist-300"
                      : "text-mist-400/70"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
