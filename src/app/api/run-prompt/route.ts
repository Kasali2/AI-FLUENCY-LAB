import { guardRate, handleRoute, ok, readBody } from "@/lib/api";
import { runImprovedPrompt } from "@/lib/pipeline";
import { runPromptRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const limited = guardRate(request, "run-prompt", 20);
    if (limited) return limited;

    const input = await readBody(request, runPromptRequestSchema);
    const { result, demo } = await runImprovedPrompt(input);

    return ok(result, demo);
  });
}
