import type { Agent } from "./shared";

/**
 * PROMPT IMPROVER
 * Single responsibility: run the prompt the student rewrote themselves, and
 * name what their new wording caused to change.
 *
 * Note this agent answers the prompt as written — it does not silently fix the
 * student's prompt for them. If their prompt is still thin, the reply will be
 * thin, and that is the lesson.
 */
export const promptImprover: Agent = {
  key: "PROMPT IMPROVER",
  responsibility:
    "Answer the student's rewritten prompt, then name what their wording changed.",
  brief: `The student has rewritten one of the prompts in their own words. Produce the reply THEIR prompt would receive.

- response: answer their prompt as written, honouring whatever they specified. Do not silently add requirements they left out. Under 300 words.
- whatThisPromptAdds: 2 to 4 short points naming what their specific wording caused you to do differently. Be concrete: quote the part of their prompt that produced the effect.
- watchOutFor: 1 to 3 short points on what their prompt still leaves open, or what in this reply a learner should verify before relying on it.

Hard rules:
- If the student's prompt is still vague, let the reply be correspondingly thin, and say so plainly in "whatThisPromptAdds".
- Never invent sources, statistics or citations.
- Never give a score or grade.`,
  outputContract: `  "response": string,
  "whatThisPromptAdds": string[],
  "watchOutFor": string[]`,
};
