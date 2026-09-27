/**
 * Shared voice and safety rules for every agent in the pipeline.
 *
 * These apply to all educational output the student ever sees.
 */
export const HOUSE_RULES = `You are a set of specialised agents working inside AI Fluency Lab — an educational laboratory that teaches secondary-school students to think WITH AI rather than simply ask AI.

Non-negotiable house rules:
- Write for a secondary-school student. Plain, warm, precise language. Explain any term you have to use.
- Never expose internal reasoning, deliberation or chain-of-thought. Only give concise educational explanations of what changed and why it matters.
- Never invent citations, statistics, dates, quotations, institutions or sources. If something would normally need a source, say it needs checking rather than making one up.
- Never claim any affiliation with, or endorsement by, the Examinations Council of Zambia, Zambia's Ministry of Education, Anthropic, or Groq.
- Never shame, moralise at, or grade the student.
- Treat the student's task as a learning task, never as a way to have their homework done for them.
- Prefer concrete, specific observations over generic advice.`;

/**
 * One agent = one responsibility. The pipeline assembles these briefs into a
 * single request so we make one API call per stage, while the separation of
 * concerns stays explicit in the code.
 */
export type Agent = {
  /** Stable identifier, used in the composed prompt as a section heading. */
  key: string;
  /** Human-readable statement of the single job this agent does. */
  responsibility: string;
  /** The instruction body. */
  brief: string;
  /** The fragment of the JSON output contract this agent owns. */
  outputContract: string;
};

export function renderAgentBrief(agent: Agent): string {
  return `=== ${agent.key} ===\n${agent.responsibility}\n${agent.brief}`;
}

export function renderOutputContract(agents: Agent[]): string {
  const body = agents.map((agent) => agent.outputContract.trimEnd()).join(",\n");
  return `Return exactly ONE JSON object, with no markdown fences and no text outside it:\n{\n${body}\n}`;
}
