import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";
import { ACCENT_CLASSES, getModule, MODULES } from "@/data/modules";

export function generateStaticParams() {
  return MODULES.map((entry) => ({ module: entry.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: moduleId } = await params;
  const mod = getModule(moduleId);

  if (!mod) return { title: "Module not found" };

  return {
    title: mod.title,
    description: `${mod.question} — ${mod.tagline}`,
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleId } = await params;
  const mod = getModule(moduleId);

  if (!mod) notFound();

  const accent = ACCENT_CLASSES[mod.accent];
  const firstLesson = mod.lessons[0];
  const position = MODULES.findIndex((entry) => entry.id === mod.id);
  const nextModule = MODULES[position + 1];

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-mist-400">
        <Link href="/learn" className="hover:text-mist-200">
          Learn
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-mist-300">{mod.title}</span>
      </nav>

      <header>
        <Pill tone={mod.accent}>
          Module {mod.step} of {MODULES.length}
        </Pill>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mist-100 text-balance sm:text-4xl">
          {mod.title}
        </h1>
        <p className={`mt-3 text-base font-medium ${accent.text} text-pretty`}>
          {mod.question}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-300 text-pretty">
          {mod.tagline}
        </p>
      </header>

      <Card>
        <h2 className="text-xs font-semibold tracking-[0.14em] text-mist-300 uppercase">
          What this module covers
        </h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {mod.covers.map((item) => (
            <li key={item}>
              <Pill tone="neutral">{item}</Pill>
            </li>
          ))}
        </ul>
      </Card>

      <ol className="space-y-3">
        {mod.lessons.map((lesson, index) => (
          <Card as="li" key={lesson.id}>
            <div className="flex flex-wrap items-start gap-4">
              <span
                aria-hidden="true"
                className={`grid size-9 shrink-0 place-items-center rounded-lg border font-mono text-xs font-bold ${accent.border} ${accent.bg} ${accent.text}`}
              >
                {mod.step}
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-mist-100">
                  {lesson.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-mist-300 text-pretty">
                  {lesson.summary}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ButtonLink
                href={`/learn/${mod.id}/${lesson.id}`}
                size="sm"
                variant="secondary"
              >
                Start activity
              </ButtonLink>
            </div>
          </Card>
        ))}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/learn/${mod.id}/${firstLesson.id}`} size="lg" fullWidth>
          Start the first activity
        </ButtonLink>
        {nextModule ? (
          <ButtonLink
            href={`/learn/${nextModule.id}`}
            size="lg"
            variant="secondary"
            fullWidth
          >
            Next: {nextModule.title}
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
