import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag className={`panel rounded-card p-5 sm:p-6 ${className}`}>{children}</Tag>
  );
}

export function CardTitle({
  children,
  icon,
  className = "",
}: {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`flex items-center gap-2 text-base font-semibold text-mist-100 ${className}`}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </h3>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "glow" | "iris" | "mint" | "amber" | "coral";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-ink-600 bg-ink-800/70 text-mist-300",
    glow: "border-glow-400/40 bg-glow-400/10 text-glow-300",
    iris: "border-iris-400/40 bg-iris-400/10 text-iris-300",
    mint: "border-mint-400/40 bg-mint-400/10 text-mint-400",
    amber: "border-amber-400/40 bg-amber-400/10 text-amber-400",
    coral: "border-coral-400/40 bg-coral-400/10 text-coral-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** A headed block of short bullet points, used throughout the feedback screens. */
export function BulletBlock({
  title,
  items,
  tone = "neutral",
  icon,
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "mint" | "amber" | "coral" | "glow" | "iris";
  icon?: ReactNode;
}) {
  if (!items.length) return null;

  const dot: Record<string, string> = {
    neutral: "bg-mist-400",
    mint: "bg-mint-400",
    amber: "bg-amber-400",
    coral: "bg-coral-400",
    glow: "bg-glow-400",
    iris: "bg-iris-400",
  };

  const heading: Record<string, string> = {
    neutral: "text-mist-200",
    mint: "text-mint-400",
    amber: "text-amber-400",
    coral: "text-coral-400",
    glow: "text-glow-300",
    iris: "text-iris-300",
  };

  return (
    <section className="animate-fade-in">
      <h4
        className={`flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase ${heading[tone]}`}
      >
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        {title}
      </h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="flex gap-3 text-sm leading-relaxed text-mist-200 pretty"
          >
            <span
              aria-hidden="true"
              className={`mt-2 size-1.5 shrink-0 rounded-full ${dot[tone]}`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
