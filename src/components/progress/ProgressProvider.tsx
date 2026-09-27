"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ModuleId = "delegation" | "description" | "discernment" | "diligence";

export const MODULE_IDS: ModuleId[] = [
  "delegation",
  "description",
  "discernment",
  "diligence",
];

export type ActivityEntry = {
  id: string;
  label: string;
  at: string;
};

export type ProgressState = {
  experiments: number;
  lessons: Record<ModuleId, string[]>;
  reflections: number;
  activity: ActivityEntry[];
};

const STORAGE_KEY = "ai-fluency-lab.progress.v1";
const MAX_ACTIVITY = 40;

function emptyState(): ProgressState {
  return {
    experiments: 0,
    lessons: {
      delegation: [],
      description: [],
      discernment: [],
      diligence: [],
    },
    reflections: 0,
    activity: [],
  };
}

/**
 * Progress lives entirely in the student's own browser. There is no account, no
 * server-side profile and no personal information collected — which is also
 * part of what this project is trying to teach.
 */
function load(): ProgressState {
  if (typeof window === "undefined") return emptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const base = emptyState();

    return {
      experiments:
        typeof parsed.experiments === "number" && parsed.experiments >= 0
          ? Math.floor(parsed.experiments)
          : 0,
      reflections:
        typeof parsed.reflections === "number" && parsed.reflections >= 0
          ? Math.floor(parsed.reflections)
          : 0,
      lessons: MODULE_IDS.reduce(
        (accumulator, id) => {
          const value = parsed.lessons?.[id];
          accumulator[id] = Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string")
            : [];
          return accumulator;
        },
        { ...base.lessons },
      ),
      activity: Array.isArray(parsed.activity)
        ? parsed.activity
            .filter(
              (entry): entry is ActivityEntry =>
                Boolean(entry) &&
                typeof entry.id === "string" &&
                typeof entry.label === "string" &&
                typeof entry.at === "string",
            )
            .slice(0, MAX_ACTIVITY)
        : [],
    };
  } catch {
    // A corrupted store should never break the app.
    return emptyState();
  }
}

function persist(state: ProgressState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). Progress is optional.
  }
}

/* -------------------------------------------------------------------------- */
/* External store                                                             */
/*                                                                            */
/* localStorage is an external system, so it is read through               */
/* useSyncExternalStore rather than copied into state inside an effect. The    */
/* server snapshot is empty, which keeps server and client markup identical    */
/* during hydration.                                                          */
/* -------------------------------------------------------------------------- */

let cached: ProgressState | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getClientSnapshot(): ProgressState {
  if (cached === null) cached = load();
  return cached;
}

const SERVER_SNAPSHOT = emptyState();

function getServerSnapshot(): ProgressState {
  return SERVER_SNAPSHOT;
}

function getHydrated() {
  return true;
}

function getHydratedServer() {
  return false;
}

function commit(next: ProgressState) {
  cached = next;
  persist(next);
  emit();
}

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

type ProgressContextValue = {
  state: ProgressState;
  hydrated: boolean;
  recordExperiment: (task: string) => void;
  recordLesson: (moduleId: ModuleId, lessonId: string, title: string) => void;
  recordReflection: (label: string) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const hydrated = useSyncExternalStore(
    subscribe,
    getHydrated,
    getHydratedServer,
  );

  const update = useCallback(
    (mutate: (current: ProgressState) => ProgressState) => {
      commit(mutate(getClientSnapshot()));
    },
    [],
  );

  const push = (activity: ActivityEntry[], entry: ActivityEntry) =>
    [entry, ...activity].slice(0, MAX_ACTIVITY);

  const recordExperiment = useCallback(
    (task: string) => {
      update((current) => ({
        ...current,
        experiments: current.experiments + 1,
        activity: push(current.activity, {
          id: `experiment-${Date.now()}`,
          label: `Ran an experiment on “${task.slice(0, 60)}”`,
          at: new Date().toISOString(),
        }),
      }));
    },
    [update],
  );

  const recordLesson = useCallback(
    (moduleId: ModuleId, lessonId: string, title: string) => {
      update((current) => {
        if (current.lessons[moduleId].includes(lessonId)) return current;

        return {
          ...current,
          lessons: {
            ...current.lessons,
            [moduleId]: [...current.lessons[moduleId], lessonId],
          },
          activity: push(current.activity, {
            id: `lesson-${lessonId}-${Date.now()}`,
            label: `Completed a ${moduleId} activity: ${title}`,
            at: new Date().toISOString(),
          }),
        };
      });
    },
    [update],
  );

  const recordReflection = useCallback(
    (label: string) => {
      update((current) => ({
        ...current,
        reflections: current.reflections + 1,
        activity: push(current.activity, {
          id: `reflection-${Date.now()}`,
          label,
          at: new Date().toISOString(),
        }),
      }));
    },
    [update],
  );

  const reset = useCallback(() => {
    update(() => emptyState());
  }, [update]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      hydrated,
      recordExperiment,
      recordLesson,
      recordReflection,
      reset,
    }),
    [state, hydrated, recordExperiment, recordLesson, recordReflection, reset],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used inside <ProgressProvider>");
  }
  return context;
}
