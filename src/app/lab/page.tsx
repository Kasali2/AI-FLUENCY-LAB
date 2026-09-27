import type { Metadata } from "next";

import { LabClient } from "@/components/lab/LabClient";
import { DEMO_TASK } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Run an AI experiment: bring a task, compare three approaches and their replies, judge them, then rewrite a prompt in your own words.",
};

export default async function LabPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const initialDemo = params.demo === "1" || params.demo === "true";

  return <LabClient initialDemo={initialDemo} demoTask={DEMO_TASK} />;
}
