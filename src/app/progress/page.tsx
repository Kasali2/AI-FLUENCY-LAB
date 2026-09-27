import type { Metadata } from "next";

import { ProgressClient } from "@/components/progress/ProgressClient";

export const metadata: Metadata = {
  title: "Progress",
  description:
    "See the experiments and learning activities you have completed. Stored in your browser only.",
};

export default function ProgressPage() {
  return <ProgressClient />;
}
