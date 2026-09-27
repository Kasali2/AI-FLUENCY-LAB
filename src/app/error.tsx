"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Detail stays in the browser console for whoever is running the app.
    console.error("[ai-fluency-lab] route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-10">
      <Pill tone="coral">Something broke</Pill>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mist-100 text-balance">
        This page could not be shown
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-mist-300 text-pretty">
        Nothing you did caused this, and nothing you entered has been lost. The
        rest of the lab should still work.
      </p>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="md" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" size="md" variant="secondary">
            Back to the homepage
          </ButtonLink>
        </div>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-mist-400">
            Reference: {error.digest}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
