import { guardRate, handleRoute, ok, readBody } from "@/lib/api";
import { runJudgmentFeedback } from "@/lib/pipeline";
import { judgmentRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const limited = guardRate(request, "judgment", 20);
    if (limited) return limited;

    const input = await readBody(request, judgmentRequestSchema);
    const { result, demo } = await runJudgmentFeedback(input);

    return ok(result, demo);
  });
}
