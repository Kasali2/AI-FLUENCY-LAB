import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

export const promptVariantSchema = z.enum([
  "minimal",
  "descriptive",
  "collaborative",
]);

export type PromptVariant = z.infer<typeof promptVariantSchema>;

export const PROMPT_VARIANTS: PromptVariant[] = [
  "minimal",
  "descriptive",
  "collaborative",
];

export const VARIANT_LABEL: Record<PromptVariant, string> = {
  minimal: "Prompt A — Minimal",
  descriptive: "Prompt B — Descriptive",
  collaborative: "Prompt C — Collaborative",
};

export const VARIANT_SHORT: Record<PromptVariant, string> = {
  minimal: "Minimal",
  descriptive: "Descriptive",
  collaborative: "Collaborative",
};

/* -------------------------------------------------------------------------- */
/* Shared field helpers                                                       */
/*                                                                            */
/* Model output limits are deliberately generous: a strict schema turns a      */
/* slightly verbose model into a broken screen. We validate shape strictly and */
/* trim length leniently.                                                     */
/* -------------------------------------------------------------------------- */

const bulletText = z.string().trim().min(1).max(700);
const proseText = z.string().trim().min(1).max(1600);
const longText = z.string().trim().min(1).max(8000);

/* -------------------------------------------------------------------------- */
/* Requests                                                                   */
/* -------------------------------------------------------------------------- */

export const taskRequestSchema = z.object({
  task: z
    .string()
    .trim()
    .min(3, "Please describe your task in at least a few words.")
    .max(400, "Please keep your task under 400 characters."),
  demo: z.boolean().optional().default(false),
});

export const judgmentRequestSchema = z.object({
  task: z.string().trim().min(3).max(400),
  prompts: z.object({
    minimal: z.string().trim().min(1).max(2000),
    descriptive: z.string().trim().min(1).max(2000),
    collaborative: z.string().trim().min(1).max(2000),
  }),
  responses: z.object({
    minimal: z.string().trim().min(1).max(8000),
    descriptive: z.string().trim().min(1).max(8000),
    collaborative: z.string().trim().min(1).max(8000),
  }),
  chosen: promptVariantSchema,
  reason: z
    .string()
    .trim()
    .min(2, "Tell us a little about why you chose that response.")
    .max(1200, "Please keep your explanation under 1200 characters."),
  demo: z.boolean().optional().default(false),
});

export const runPromptRequestSchema = z.object({
  task: z.string().trim().min(3).max(400),
  prompt: z
    .string()
    .trim()
    .min(5, "Please write a prompt before running it.")
    .max(2000, "Please keep your prompt under 2000 characters."),
  demo: z.boolean().optional().default(false),
});

export const reflectionRequestSchema = z.object({
  task: z.string().trim().min(3).max(400),
  originalPrompt: z.string().trim().min(1).max(2000),
  improvedPrompt: z.string().trim().min(1).max(2000),
  changeNote: z
    .string()
    .trim()
    .min(2, "Tell us what you changed and why.")
    .max(800, "Please keep your reflection under 800 characters."),
  demo: z.boolean().optional().default(false),
});

export type TaskRequest = z.infer<typeof taskRequestSchema>;
export type JudgmentRequest = z.infer<typeof judgmentRequestSchema>;
export type RunPromptRequest = z.infer<typeof runPromptRequestSchema>;
export type ReflectionRequest = z.infer<typeof reflectionRequestSchema>;

/* -------------------------------------------------------------------------- */
/* Agent outputs                                                              */
/* -------------------------------------------------------------------------- */

/** TASK ANALYSER — what the student is actually trying to do. */
export const taskAnalysisSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  domain: z.string().trim().min(1).max(120),
  level: z.string().trim().min(1).max(200),
  summary: proseText,
  keyFactors: z.array(bulletText).min(1).max(10),
});

/** PROMPT DESIGNER — three genuinely different ways to make the same request. */
export const promptSetSchema = z.object({
  minimal: z.string().trim().min(1).max(3000),
  descriptive: z.string().trim().min(1).max(3000),
  collaborative: z.string().trim().min(1).max(3000),
});

/** GENERATOR — the reply each prompt would receive. */
export const responseSetSchema = z.object({
  minimal: longText,
  descriptive: longText,
  collaborative: longText,
});

/** OUTPUT ANALYSER + the assembled experiment payload. */
export const experimentResultSchema = z.object({
  analysis: taskAnalysisSchema,
  prompts: promptSetSchema,
  responses: responseSetSchema,
  focusPoints: z.array(bulletText).min(1).max(10),
});

export type TaskAnalysis = z.infer<typeof taskAnalysisSchema>;
export type PromptSet = z.infer<typeof promptSetSchema>;
export type ResponseSet = z.infer<typeof responseSetSchema>;
export type ExperimentResult = z.infer<typeof experimentResultSchema>;

/** FEEDBACK ANALYSER — revealed only after the student commits to a judgment. */
export const judgmentFeedbackSchema = z.object({
  acknowledgement: proseText,
  strengths: z.array(bulletText).min(1).max(10),
  goodObservations: z.array(bulletText).min(1).max(10),
  missedFactors: z.array(bulletText).min(1).max(10),
  possibleMisconceptions: z.array(bulletText).min(1).max(10),
  nextStep: proseText,
  differences: z
    .array(
      z.object({
        variant: promptVariantSchema,
        headline: z.string().trim().min(1).max(400),
        detail: proseText,
      }),
    )
    .min(1)
    .max(6),
  uncertaintyNote: proseText,
});

export type JudgmentFeedback = z.infer<typeof judgmentFeedbackSchema>;

/** PROMPT IMPROVER — runs the student's rewritten prompt. */
export const improvedRunSchema = z.object({
  response: z.string().trim().min(1).max(12000),
  whatThisPromptAdds: z.array(bulletText).min(1).max(10),
  watchOutFor: z.array(bulletText).min(1).max(10),
});

export type ImprovedRun = z.infer<typeof improvedRunSchema>;

/** REFLECTION COACH — closes the loop. */
export const reflectionSchema = z.object({
  changeSummary: proseText,
  whatImproved: z.array(bulletText).min(1).max(10),
  whatToTryNext: z.array(bulletText).min(1).max(10),
  closing: proseText,
});

export type Reflection = z.infer<typeof reflectionSchema>;

/* -------------------------------------------------------------------------- */
/* Envelope                                                                   */
/* -------------------------------------------------------------------------- */

export type ApiEnvelope<T> =
  | { ok: true; data: T; demo: boolean }
  | { ok: false; error: { code: string; message: string } };
