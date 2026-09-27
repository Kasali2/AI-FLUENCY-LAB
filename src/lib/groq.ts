import "server-only";

import Groq, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  BadRequestError,
  RateLimitError,
} from "groq-sdk";
import type { z } from "zod";

import { ApiError } from "./errors";
import { parseStructured } from "./validate";

/**
 * The Groq API key is read here and nowhere else. This module is marked
 * `server-only`, so importing it from a Client Component is a build error
 * rather than a leaked secret.
 */

const DEFAULT_MODEL = "openai/gpt-oss-120b";

export function getModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

let client: Groq | null = null;

export function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  if (!client) {
    client = new Groq({
      apiKey,
      timeout: 45_000,
      maxRetries: 1,
    });
  }

  return client;
}

export const NOT_CONFIGURED_MESSAGE =
  "The AI engine is not configured on this server yet. You can still explore the guided demo and every learning module.";

/* -------------------------------------------------------------------------- */
/* Structured calls                                                           */
/* -------------------------------------------------------------------------- */

type Message = { role: "system" | "user"; content: string };

type StructuredOptions<T> = {
  schema: z.ZodType<T>;
  system: string;
  user: string;
  maxCompletionTokens?: number;
  temperature?: number;
};

/**
 * Asks the model for a JSON object, validates it against `schema`, and retries
 * with a repair instruction if the first attempt is unusable.
 *
 * The student never sees a parse error — either they get validated data or a
 * calm, actionable message.
 */
export async function callStructured<T>({
  schema,
  system,
  user,
  maxCompletionTokens = 3000,
  temperature = 0.7,
}: StructuredOptions<T>): Promise<T> {
  const groq = getGroqClient();
  if (!groq) {
    throw ApiError.unavailable(NOT_CONFIGURED_MESSAGE, "ai_not_configured");
  }

  const model = getModel();
  const repairNote =
    "\n\nIMPORTANT: Your previous reply could not be parsed. Respond with a single valid JSON object and nothing else. No markdown fences, no commentary before or after.";

  const attempts: Array<{ messages: Message[]; jsonMode: boolean }> = [
    {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      jsonMode: true,
    },
    {
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `${user}${repairNote}`,
        },
      ],
      jsonMode: false,
    },
  ];

  let lastIssue = "empty response";

  for (const attempt of attempts) {
    let text: string;

    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: attempt.messages,
        temperature,
        max_completion_tokens: maxCompletionTokens,
        ...(attempt.jsonMode
          ? { response_format: { type: "json_object" as const } }
          : {}),
      });

      text = completion.choices?.[0]?.message?.content ?? "";
    } catch (error) {
      throw translateGroqError(error, attempt.jsonMode);
    }

    const outcome = parseStructured(schema, text);
    if (outcome.ok) return outcome.value;

    lastIssue = outcome.reason;
  }

  console.error(`[ai-fluency-lab] unusable model output — ${lastIssue}`);

  throw ApiError.upstream(
    "The AI sent back something we could not read. This is usually temporary — please try again.",
    "malformed_ai_response",
  );
}

function translateGroqError(error: unknown, allowRetry: boolean): ApiError {
  // A model that rejects `response_format` is still usable on the plain path.
  if (error instanceof BadRequestError) {
    if (allowRetry && !/api key|model/i.test(error.message)) {
      return ApiError.upstream(
        "The AI provider rejected the request format. Please try again.",
        "ai_bad_request",
      );
    }
    return ApiError.upstream(
      "That AI model is not available with the current configuration.",
      "ai_bad_request",
    );
  }

  if (error instanceof AuthenticationError) {
    return ApiError.unavailable(
      "The AI provider rejected the API key configured on this server.",
      "ai_auth_failed",
    );
  }

  if (error instanceof RateLimitError) {
    return ApiError.tooManyRequests(
      "The AI service is busy right now. Please wait a moment and try again.",
      "ai_rate_limited",
    );
  }

  if (error instanceof APIConnectionTimeoutError) {
    return ApiError.timeout(
      "The AI service took too long to respond. Please try again.",
      "ai_timeout",
    );
  }

  if (error instanceof APIConnectionError) {
    return ApiError.upstream(
      "We could not reach the AI service. Check the server's network connection and try again.",
      "ai_unreachable",
    );
  }

  if (error instanceof APIError) {
    console.error("[ai-fluency-lab] groq api error:", error.status, error.message);
    return ApiError.upstream(
      "The AI service returned an error. Please try again shortly.",
      "ai_error",
    );
  }

  console.error("[ai-fluency-lab] unexpected groq failure:", error);
  return ApiError.upstream(
    "The AI service could not complete that request. Please try again.",
    "ai_error",
  );
}
