/**
 * Errors that are safe to show a student.
 *
 * Anything that is *not* an ApiError is treated as an internal fault: the real
 * message is logged on the server and the student sees a generic, friendly
 * notice. Stack traces never reach the browser.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  static badRequest(message: string, code = "bad_request") {
    return new ApiError(400, code, message);
  }

  static tooManyRequests(message: string, code = "rate_limited") {
    return new ApiError(429, code, message);
  }

  static unavailable(message: string, code = "ai_unavailable") {
    return new ApiError(503, code, message);
  }

  static upstream(message: string, code = "ai_error") {
    return new ApiError(502, code, message);
  }

  static timeout(message: string, code = "ai_timeout") {
    return new ApiError(504, code, message);
  }
}

export const GENERIC_MESSAGE =
  "Something went wrong on our side. Please try again in a moment.";

export function toPublicError(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  if (error instanceof ApiError) {
    return { status: error.status, code: error.code, message: error.message };
  }

  // Log the detail server-side only.
  console.error("[ai-fluency-lab] unexpected error:", error);

  return { status: 500, code: "internal_error", message: GENERIC_MESSAGE };
}
