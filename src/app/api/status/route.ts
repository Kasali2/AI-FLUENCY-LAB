import { NextResponse } from "next/server";

import { DEMO_TASK } from "@/lib/demo";
import { getModel, isAiConfigured } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tells the browser whether the AI engine is configured. It exposes the model
 * *name* (useful for support and for the About page) and nothing else — never
 * the key, and never any part of it.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true as const,
      data: {
        aiConfigured: isAiConfigured(),
        model: getModel(),
        demoTask: DEMO_TASK,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
