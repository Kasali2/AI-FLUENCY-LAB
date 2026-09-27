"use client";

import { useEffect, useState } from "react";

import { getAiStatus, type AiStatus } from "./client";

/**
 * Reports whether the server has an AI key configured, so the interface can
 * explain itself rather than failing at the point of use.
 */
export function useAiStatus() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getAiStatus().then((result) => {
      if (cancelled) return;
      setStatus(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, loading, configured: status?.aiConfigured ?? false };
}
