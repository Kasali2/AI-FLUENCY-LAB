import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonRunner } from "@/components/learn/LessonRunner";
import { MODULES, getLesson } from "@/data/modules";

export function generateStaticParams() {
  return MODULES.flatMap((module) =>
    module.lessons.map((lesson) => ({
      module: module.id,
      lesson: lesson.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}): Promise<Metadata> {
  const { module: moduleId, lesson: lessonId } = await params;
  const found = getLesson(moduleId, lessonId);

  if (!found) return { title: "Activity not found" };

  return {
    title: found.lesson.title,
    description: found.lesson.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}) {
  const { module: moduleId, lesson: lessonId } = await params;
  const found = getLesson(moduleId, lessonId);

  if (!found) notFound();

  const { module, lesson } = found;
  const index = module.lessons.findIndex((entry) => entry.id === lesson.id);
  const next = module.lessons[index + 1];
  const nextModule = MODULES[MODULES.findIndex((entry) => entry.id === module.id) + 1];

  const nextHref = next
    ? { href: `/learn/${module.id}/${next.id}`, label: `Next activity: ${next.title}` }
    : nextModule
      ? {
          href: `/learn/${nextModule.id}`,
          label: `Next module: ${nextModule.title}`,
        }
      : { href: "/lab", label: "Practise this in the Lab" };

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-mist-400">
        <Link href="/learn" className="hover:text-mist-200">
          Learn
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link href={`/learn/${module.id}`} className="hover:text-mist-200">
          {module.title}
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-mist-300">{lesson.title}</span>
      </nav>

      <LessonRunner module={module} lesson={lesson} nextHref={nextHref} />
    </div>
  );
}
