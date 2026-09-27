import { guardRate, handleRoute, ok, readBody } from "@/lib/api";
import { runExperiment } from "@/lib/pipeline";
import { taskRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const limited = guardRate(request, "experiment", 20);
    if (limited) return limited;

    const { task, demo } = await readBody(request, taskRequestSchema);
    const { result, demo: isDemo } = await runExperiment(task, demo);

    return ok(result, isDemo);
  });
}
