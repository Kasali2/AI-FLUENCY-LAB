import type { Agent } from "./shared";

/**
 * OUTPUT ANALYSER
 * Single responsibility: name the dimensions worth judging, without judging.
 *
 * This agent deliberately withholds any verdict. The student must commit to a
 * choice first; the FEEDBACK ANALYSER handles the reveal afterwards.
 */
export const outputAnalyser: Agent = {
  key: "OUTPUT ANALYSER",
  responsibility:
    "Name what is worth comparing, without saying which reply is best.",
  brief: `Produce "focusPoints": 3 or 4 short, neutral dimensions a learner could use to compare the three replies about this specific task.

Good focus points sound like questions or lenses:
- "How much the reply assumed about what the learner already knew"
- "Whether the requested output format was actually followed"

Hard rules:
- Never state, hint at, or rank which reply is best.
- Never number the replies or describe them as good, better or worse.
- Keep each point under 15 words.
- Make them specific to this task, not generic advice about prompt writing.`,
  outputContract: `  "focusPoints": string[]`,
};
