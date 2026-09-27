import assert from "node:assert/strict";
import test from "node:test";

import { ApiError, toPublicError } from "../src/lib/errors.ts";
import { clampText } from "../src/lib/text.ts";
import { extractJsonObject, parseStructured } from "../src/lib/validate.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";
import {
  demoExperiment,
  demoImprovedRun,
  demoJudgment,
  demoReflection,
} from "../src/lib/demo.ts";
import {
  experimentResultSchema,
  improvedRunSchema,
  judgmentFeedbackSchema,
  promptVariantSchema,
  reflectionSchema,
  taskRequestSchema,
} from "../src/lib/schemas.ts";

/* -------------------------------------------------------------------------- */
/* JSON extraction — the model is not trusted to return clean JSON            */
/* -------------------------------------------------------------------------- */

test("extractJsonObject parses plain JSON", () => {
  assert.deepEqual(extractJsonObject('{"a":1}'), { a: 1 });
});

test("extractJsonObject strips a markdown code fence", () => {
  assert.deepEqual(extractJsonObject('```json\n{"a":1}\n```'), { a: 1 });
});

test("extractJsonObject ignores prose around the object", () => {
  const raw = 'Sure! Here is the JSON:\n{"a":1}\nLet me know if you need more.';
  assert.deepEqual(extractJsonObject(raw), { a: 1 });
});

test("extractJsonObject is not confused by braces inside strings", () => {
  const raw = '{"text":"a } brace { in a string"}';
  assert.deepEqual(extractJsonObject(raw), {
    text: "a } brace { in a string",
  });
});

test("extractJsonObject handles escaped quotes", () => {
  const raw = '{"text":"she said \\"hi\\" loudly"}';
  assert.deepEqual(extractJsonObject(raw), { text: 'she said "hi" loudly' });
});

test("extractJsonObject returns null rather than throwing", () => {
  assert.equal(extractJsonObject(""), null);
  assert.equal(extractJsonObject("   "), null);
  assert.equal(extractJsonObject("not json at all"), null);
  assert.equal(extractJsonObject("{unbalanced"), null);
  assert.equal(extractJsonObject("[1,2,3]"), null);
});

test("clampText leaves short text alone and truncates long text", () => {
  assert.equal(clampText("  short  ", 40), "short");

  const long = "word ".repeat(60).trim();
  const clamped = clampText(long, 50);
  assert.ok(clamped.length <= 51, `expected <= 51 chars, got ${clamped.length}`);
  assert.ok(clamped.endsWith("…"));
});

/* -------------------------------------------------------------------------- */
/* Request validation                                                         */
/* -------------------------------------------------------------------------- */

test("taskRequestSchema rejects short and overlong tasks", () => {
  assert.equal(taskRequestSchema.safeParse({ task: "hi" }).success, false);

  const tooLong = { task: "x".repeat(401) };
  assert.equal(taskRequestSchema.safeParse(tooLong).success, false);
});

test("taskRequestSchema defaults demo to false", () => {
  const result = taskRequestSchema.safeParse({ task: "Explain the nitrogen cycle" });
  assert.ok(result.success);
  assert.equal(result.data.demo, false);
});

test("promptVariantSchema rejects an invented variant", () => {
  assert.equal(promptVariantSchema.safeParse("best").success, false);
  assert.equal(promptVariantSchema.safeParse("descriptive").success, true);
});

test("experimentResultSchema rejects a payload with missing sections", () => {
  const broken = { analysis: demoExperiment().analysis };
  assert.equal(experimentResultSchema.safeParse(broken).success, false);
});

/* -------------------------------------------------------------------------- */
/* Demo fixtures must satisfy the same schemas as live model output           */
/* -------------------------------------------------------------------------- */

test("demo experiment satisfies the experiment schema", () => {
  const result = experimentResultSchema.safeParse(demoExperiment());
  assert.ok(result.success, JSON.stringify(result.error?.issues));
});

test("demo judgment satisfies the feedback schema for every choice", () => {
  for (const choice of ["minimal", "descriptive", "collaborative"] as const) {
    const parsed = judgmentFeedbackSchema.safeParse(demoJudgment(choice));
    assert.ok(parsed.success, `failed for ${choice}`);
    assert.equal(parsed.data.differences.length, 3);
  }
});

test("demo judgment always acknowledges the choice the student actually made", () => {
  const minimal = demoJudgment("minimal").acknowledgement;
  const collaborative = demoJudgment("collaborative").acknowledgement;
  assert.notEqual(minimal, collaborative);
  assert.match(minimal, /Reply A/);
  assert.match(collaborative, /Reply C/);
});

test("demo improved run satisfies the schema and reacts to the prompt", () => {
  const collaborative = demoImprovedRun(
    "Teach me step by step and check my understanding",
  );
  const direct = demoImprovedRun("Give me the key points on photosynthesis.");

  assert.ok(improvedRunSchema.safeParse(collaborative).success);
  assert.ok(improvedRunSchema.safeParse(direct).success);
  assert.notEqual(collaborative.response, direct.response);
});

test("demo reflection satisfies the reflection schema", () => {
  const parsed = reflectionSchema.safeParse(demoReflection());
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues));
});

test("no demo copy contains an invented citation", () => {
  const blob = JSON.stringify([
    demoExperiment(),
    demoJudgment("descriptive"),
    demoImprovedRun("anything"),
    demoReflection(),
  ]);

  // Approved patterns for dates and units only. Anything else numeric-and-long
  // would be a suspicious invented identifier.
  assert.ok(!/\bet al\./i.test(blob));
  assert.ok(!/doi:\s*10\./i.test(blob));
  assert.ok(!/\bISBN\b/i.test(blob));
});

/* -------------------------------------------------------------------------- */
/* Structured output — the retry decision                                     */
/* -------------------------------------------------------------------------- */

test("parseStructured accepts a clean model response", () => {
  const raw = JSON.stringify({
    ...demoExperiment(),
    ignoredExtraKey: "the model added something we did not ask for",
  });

  const outcome = parseStructured(experimentResultSchema, raw);
  assert.equal(outcome.ok, true);
});

test("parseStructured accepts fenced and prose-wrapped responses", () => {
  const json = JSON.stringify(demoReflection());
  const fenced = "```json\n" + json + "\n```";

  assert.equal(parseStructured(reflectionSchema, fenced).ok, true);
  assert.equal(
    parseStructured(reflectionSchema, `Certainly! ${json} Hope that helps.`).ok,
    true,
  );
});

test("parseStructured rejects the malformed responses a model actually produces", () => {
  const cases: Array<[string, string]> = [
    ["empty", ""],
    ["plain text", "I am sorry, I cannot help with that."],
    ["truncated", '{"acknowledgement": "You noticed"'],
    ["a top-level array", JSON.stringify([1, 2, 3])],
    ["a bare string", JSON.stringify("here you go")],
    ["empty object", "{}"],
  ];

  for (const [label, raw] of cases) {
    const outcome = parseStructured(reflectionSchema, raw);
    assert.equal(outcome.ok, false, `expected failure for ${label}`);
    if (!outcome.ok) {
      assert.ok(outcome.reason.length > 0);
      assert.ok(!outcome.reason.includes("    at "), "reason must not be a stack trace");
    }
  }
});

test("parseStructured rejects structurally wrong values", () => {
  const wrongType = {
    ...demoReflection(),
    whatImproved: "this should have been an array",
  };

  assert.equal(
    parseStructured(reflectionSchema, JSON.stringify(wrongType)).ok,
    false,
  );
});

test("a failed parse reports which field was wrong, for server-side logs", () => {
  const outcome = parseStructured(
    experimentResultSchema,
    JSON.stringify({ analysis: demoExperiment().analysis }),
  );

  assert.equal(outcome.ok, false);
  if (!outcome.ok) {
    assert.match(outcome.reason, /prompts|responses|focusPoints/);
  }
});

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

test("rate limiter allows the budget then refuses", () => {
  const key = `test-${Math.random()}`;

  for (let i = 0; i < 3; i += 1) {
    assert.equal(checkRateLimit(key, 3, 10_000).allowed, true);
  }

  const blocked = checkRateLimit(key, 3, 10_000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);
});

test("rate limiter uses a separate budget per key", () => {
  const a = `test-a-${Math.random()}`;
  const b = `test-b-${Math.random()}`;

  checkRateLimit(a, 1, 10_000);
  assert.equal(checkRateLimit(a, 1, 10_000).allowed, false);
  assert.equal(checkRateLimit(b, 1, 10_000).allowed, true);
});

/* -------------------------------------------------------------------------- */
/* Error handling                                                             */
/* -------------------------------------------------------------------------- */

test("toPublicError passes through curated ApiError details", () => {
  const mapped = toPublicError(
    ApiError.unavailable("The AI engine is not configured.", "ai_not_configured"),
  );

  assert.equal(mapped.status, 503);
  assert.equal(mapped.code, "ai_not_configured");
  assert.equal(mapped.message, "The AI engine is not configured.");
});

test("toPublicError hides unexpected errors behind a generic message", () => {
  const mapped = toPublicError(new TypeError("cannot read properties of undefined"));

  assert.equal(mapped.status, 500);
  assert.equal(mapped.code, "internal_error");
  assert.ok(!mapped.message.includes("undefined"));
});
