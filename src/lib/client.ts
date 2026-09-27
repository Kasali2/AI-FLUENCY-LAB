import type { ApiEnvelope } from "./schemas";

export type ApiResult<T> = ApiEnvelope<T>;

const NETWORK_ERROR: ApiResult<never> = {
  ok: false,
  error: {
    code: "network",
    message:
      "We could not reach the server. Check your connection and try again.",
  },
};

/**
 * Every browser call goes through here, so a network failure, an HTML error
 * page, or a malformed body all become the same calm, typed result rather than
 * an unhandled rejection in a component.
 */
export async function postJson<T>(
  url: string,
  body: unknown,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json: unknown = await response.json().catch(() => null);

    if (!json || typeof json !== "object") {
      return {
        ok: false,
        error: {
          code: "bad_response",
          message: "We could not read the server's reply. Please try again.",
        },
      };
    }

    const envelope = json as ApiResult<T>;

    if (envelope.ok) return envelope;

    if (envelope.error?.message) return envelope;

    return {
      ok: false,
      error: {
        code: "unknown",
        message: "Something went wrong. Please try again in a moment.",
      },
    };
  } catch {
    return NETWORK_ERROR;
  }
}

export type AiStatus = {
  aiConfigured: boolean;
  model: string;
  demoTask: string;
};

export async function getAiStatus(): Promise<AiStatus | null> {
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    if (!response.ok) return null;
    const json = (await response.json()) as ApiResult<AiStatus>;
    return json.ok ? json.data : null;
  } catch {
    return null;
  }
}
