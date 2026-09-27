import { NextResponse } from "next/server";
import type { z } from "zod";

import { ApiError, toPublicError } from "./errors";
import { checkRateLimit, clientKey } from "./rate-limit";

/** Hard ceiling on request bodies, before any parsing happens. */
const MAX_BODY_BYTES = 32_000;

export function ok<T>(data: T, demo: boolean) {
  return NextResponse.json(
    { ok: true as const, data, demo },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json(
    { ok: false as const, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Wraps a handler so that no unexpected throw ever reaches the student as a
 * stack trace.
 */
export async function handleRoute(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    const { status, code, message } = toPublicError(error);
    return fail(status, code, message);
  }
}

/** Best-effort rate limiting. Returns an error response when the budget is spent. */
export function guardRate(request: Request, scope: string, limit = 20) {
  const { allowed, retryAfterSeconds } = checkRateLimit(
    clientKey(request, scope),
    limit,
  );

  if (!allowed) {
    const response = fail(
      429,
      "rate_limited",
      "That is a lot of requests in a short time. Please wait a moment and try again.",
    );
    response.headers.set("Retry-After", String(retryAfterSeconds));
    return response;
  }

  return null;
}

/** Reads, size-limits and validates a JSON body without leaking parse errors. */
export async function readBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength && declaredLength > MAX_BODY_BYTES) {
    throw ApiError.badRequest(
      "That request was too large. Please shorten your text and try again.",
      "payload_too_large",
    );
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    throw ApiError.badRequest("We could not read that request.", "unreadable_body");
  }

  if (raw.length > MAX_BODY_BYTES) {
    throw ApiError.badRequest(
      "That request was too large. Please shorten your text and try again.",
      "payload_too_large",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw ApiError.badRequest("That request was not valid JSON.", "invalid_json");
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw ApiError.badRequest(
      friendlyIssueMessage(result.error.issues[0]),
      "invalid_input",
    );
  }

  return result.data;
}

/**
 * Zod's built-in messages read like internal diagnostics ("Invalid input:
 * expected string, received undefined"). A student should never see that, so
 * only messages we authored ourselves are passed through.
 */
const INTERNAL_MESSAGE =
  /^(invalid|expected|too small|too big|unrecognized|unprocessable|not a)/i;

function friendlyIssueMessage(
  issue: { code?: string; message?: string } | undefined,
): string {
  const fallback = "Please check what you entered and try again.";
  if (!issue) return fallback;

  if (issue.code === "invalid_type") {
    return "Some information was missing from that request. Please try again.";
  }

  const message = issue.message?.trim();
  if (!message || INTERNAL_MESSAGE.test(message)) {
    const field = (issue as { path?: Array<string | number> }).path?.[0];
    return field
      ? `Please check the “${String(field)}” field and try again.`
      : fallback;
  }

  return message;
}
