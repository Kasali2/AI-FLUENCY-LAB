import type { Agent } from "./shared";

/**
 * RESPONSE GENERATOR
 * Single responsibility: produce the reply each prompt would realistically
 * receive, so the student has real material to compare.
 */
export const responseGenerator: Agent = {
  key: "RESPONSE GENERATOR",
  responsibility:
    "Write the reply each of the three prompts would honestly receive.",
  brief: `Write the reply each prompt would realistically receive, as if you were the assistant answering it.

- "minimal": a short, generic answer that is helpful on the surface but thin. Under 120 words.
- "descriptive": an answer that visibly honours the audience, structure, constraints and success criteria the prompt asked for. Under 240 words.
- "collaborative": an answer that deliberately does NOT complete the task. Instead it opens a dialogue — finds out what the learner already knows, teaches a single step, and pauses for the learner to respond. Under 180 words.

Rules:
- None of the three replies may comment on itself or on the other replies, or claim to be better.
- Write each reply straight, in the voice of a capable assistant.
- Do not pad the minimal reply to make it look reasonable, and do not sabotage it either. Make it genuinely what a vague request produces.
- For the descriptive reply, if the prompt asked for something checkable (such as practice questions), provide it, but keep it brief.
- Where a claim in a reply would normally need a source, either state it carefully without inventing a reference, or note that it should be checked.`,
  outputContract: `  "responses": {
    "minimal": string,
    "descriptive": string,
    "collaborative": string
  }`,
};
