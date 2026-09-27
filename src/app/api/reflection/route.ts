import { guardRate, handleRoute, ok, readBody } from "@/lib/api";
import { runReflection } from "@/lib/pipeline";
import { reflectionRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const limited = guardRate(request, "reflection", 20);
    if (limited) return limited;

    const input = await readBody(request, reflectionRequestSchema);
    const { result, demo } = await runReflection(input);

    return ok(result, demo);
  });
}
