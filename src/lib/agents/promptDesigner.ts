import type { Agent } from "./shared";

/**
 * PROMPT DESIGNER
 * Single responsibility: turn one task into three requests that differ in how
 * much the human contributes — not merely in how much they type.
 */
export const promptDesigner: Agent = {
  key: "PROMPT DESIGNER",
  responsibility:
    "Write three genuinely different requests for the same task.",
  brief: `Write three prompts for the SAME student task. What must differ is how much of the thinking the human contributes — not simply how long the prompt is.

A) "minimal" — the vague one-line request a student types when in a hurry. Keep it under 15 words. Do NOT add detail, context or structure.

B) "descriptive" — a well-specified request that carries the goal, relevant context, the intended audience, constraints, the desired output format, and what a good answer would satisfy. It should read like a thoughtful student wrote it, not like a filled-in form. Do not label the parts.

C) "collaborative" — a request that makes the AI work WITH the learner. The AI should first find out what the learner already knows, then teach one step at a time and check understanding before moving on.

Rules:
- Never use the words "minimal", "descriptive" or "collaborative" inside the prompts themselves.
- Every prompt must be something a real student could actually type.
- All three must be aimed at the same underlying task.`,
  outputContract: `  "prompts": {
    "minimal": string,
    "descriptive": string,
    "collaborative": string
  }`,
};
