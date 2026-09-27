import type { z } from "zod";

/**
 * The single decision the AI pipeline makes about a model reply: is this usable
 * structured data, or does it need to be retried?
 *
 * This module has no runtime imports at all — not even relative ones — so it is
 * pure, testable in isolation, and safe to reason about.
 */

export type ParseOutcome<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

/**
 * Asks the schema whether a raw model reply is usable.
 *
 * The student never sees the result of a failure: on `ok: false` the caller
 * retries once with a repair instruction and then falls back to a calm message.
 */
export function parseStructured<T>(
  schema: z.ZodType<T>,
  raw: string,
): ParseOutcome<T> {
  const parsed = extractJsonObject(raw);

  if (parsed === null) {
    return { ok: false, reason: "response was not a JSON object" };
  }

  const result = schema.safeParse(parsed);

  if (!result.success) {
    const summary = result.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");

    return { ok: false, reason: `response failed validation — ${summary}` };
  }

  return { ok: true, value: result.data };
}

/* -------------------------------------------------------------------------- */
/* JSON extraction                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Model responses are text, not guarantees. This pulls the most plausible JSON
 * object out of a response without ever throwing on malformed input.
 */
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 1. The happy path: the model returned pure JSON.
  const direct = tryParseObject(trimmed);
  if (direct !== undefined) return direct;

  // 2. Strip a markdown fence if present.
  const unfenced = stripCodeFence(trimmed);
  if (unfenced !== trimmed) {
    const parsed = tryParseObject(unfenced);
    if (parsed !== undefined) return parsed;
  }

  // 3. Fall back to the outermost balanced braces.
  const sliced = sliceBalancedObject(unfenced);
  if (sliced) {
    const parsed = tryParseObject(sliced);
    if (parsed !== undefined) return parsed;
  }

  return null;
}

/**
 * Parses only if the result is a plain JSON object. A top-level array or a
 * scalar is valid JSON but never a usable structured response, so it is treated
 * as a failure and triggers the retry path.
 */
function tryParseObject(value: string): unknown {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function stripCodeFence(value: string): string {
  const fence = /^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/;
  const match = value.match(fence);
  return match ? match[1].trim() : value;
}

/**
 * Scans for the first `{` and the matching closing brace, ignoring braces that
 * appear inside string literals.
 */
function sliceBalancedObject(value: string): string | null {
  const start = value.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < value.length; i += 1) {
    const char = value[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(start, i + 1);
    }
  }

  return null;
}
