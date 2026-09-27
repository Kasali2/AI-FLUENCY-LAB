import type { Agent } from "./shared";

/**
 * TASK ANALYSER
 * Single responsibility: work out what the student is actually trying to
 * achieve, so that the prompt designer can build prompts for the real goal
 * rather than the literal words typed.
 */
export const taskAnalyser: Agent = {
  key: "TASK ANALYSER",
  responsibility: "Describe what the student is actually trying to do.",
  brief: `Read the student's task and identify the underlying goal, not just the words they used.

Determine:
- subject: the specific topic being asked about.
- domain: the school subject area (for example Biology, Chemistry, Physics, Geography, Civic Education, Computer Science, Robotics, Mathematics, English). Use "General" if the task is not tied to a subject.
- level: the most likely learner level implied by the task. If the student has not said, infer sensibly (for example "Grade 12 secondary school") rather than leaving it blank.
- summary: one or two sentences describing what the student would consider a success for this task.
- keyFactors: 3 to 5 things a strong request for THIS specific task should contain — for example the intended audience, a length or depth limit, a required output format, or something that must be explained in a particular way. These must be specific to this task. Never write generic advice such as "be clear" or "give context".`,
  outputContract: `  "analysis": {
    "subject": string,
    "domain": string,
    "level": string,
    "summary": string,
    "keyFactors": string[]
  }`,
};
