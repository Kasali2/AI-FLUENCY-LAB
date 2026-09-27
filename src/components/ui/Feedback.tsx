"use client";

import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A loading panel that names what the pipeline is doing. Students should never
 * be left staring at a frozen screen, and they should never be shown an
 * internal step name either — these are the human-readable equivalents.
 */
export function LoadingPanel({
  messages,
  title = "Working…",
}: {
  messages: string[];
  title?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => Math.min(current + 1, messages.length - 1));
    }, 2600);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="panel rounded-card animate-fade-in p-6"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="animate-pulse-soft size-2.5 rounded-full bg-glow-400"
        />
        <p className="text-sm font-semibold text-mist-100">{title}</p>
      </div>

      <p key={index} className="animate-fade-in mt-3 text-sm text-mist-300">
        {messages[index]}
      </p>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-ink-800">
        <div className="animate-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-glow-400 to-transparent" />
      </div>

      <ol className="mt-5 space-y-2">
        {messages.map((message, position) => (
          <li
            key={message}
            className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
              position <= index ? "text-mist-300" : "text-mist-400/50"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${
                position <= index ? "bg-glow-400" : "bg-ink-600"
              }`}
            />
            {message}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export function ErrorNotice({
  message,
  code,
  onRetry,
  onDismiss,
}: {
  message: string;
  code?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Move focus to the error so keyboard and screen-reader users are told.
  useEffect(() => {
    ref.current?.focus();
  }, [message]);

  const isSetupIssue = code === "ai_not_configured";

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="animate-fade-in rounded-card border border-coral-400/35 bg-coral-400/8 p-5"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-lg leading-none">
          ⚠
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-coral-400">
            {isSetupIssue ? "AI engine not set up" : "That did not work"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-200 pretty">
            {message}
          </p>

          {isSetupIssue ? (
            <p className="mt-3 rounded-xl bg-ink-900/70 p-3 font-mono text-xs text-mist-300">
              Add <span className="text-glow-300">GROQ_API_KEY</span> to{" "}
              <span className="text-glow-300">.env.local</span> and restart the dev
              server. The demo and all learning modules work without it.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-ink-800 px-4 py-2 text-sm font-semibold text-mist-100 transition-colors hover:bg-ink-700"
              >
                Try again
              </button>
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-full px-4 py-2 text-sm font-medium text-mist-300 transition-colors hover:bg-ink-800"
              >
                Dismiss
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <p className="rounded-card border border-iris-400/30 bg-iris-400/8 px-4 py-3 text-xs leading-relaxed text-iris-300">
      <span className="font-semibold">Demonstration mode.</span>{" "}
      {children ??
        "You are seeing prepared example content, so the whole walkthrough works instantly without a live AI key."}
    </p>
  );
}
