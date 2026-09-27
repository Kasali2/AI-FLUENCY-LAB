import type {
  ExperimentResult,
  ImprovedRun,
  JudgmentFeedback,
  PromptVariant,
  Reflection,
} from "./schemas";

/**
 * Demo mode exists so that the product can be understood in about a minute,
 * with no API key, no account and no waiting.
 *
 * It is deliberately a *fixture*, not a hidden fallback: the UI labels it as a
 * demonstration so students are never misled into thinking a live model
 * produced it.
 */

export const DEMO_TASK = "Explain photosynthesis to a Grade 12 student.";

export const DEMO_FALLBACK_TASK = "Explain photosynthesis to a Grade 12 student";

/* -------------------------------------------------------------------------- */
/* Stage 1 — analysis, prompts, replies                                       */
/* -------------------------------------------------------------------------- */

export function demoExperiment(): ExperimentResult {
  return {
    analysis: {
      subject: "Photosynthesis",
      domain: "Biology",
      level: "Grade 12 secondary school",
      summary:
        "You want to understand how plants turn light energy into chemical energy, and be able to answer exam questions about it rather than simply recall a definition.",
      keyFactors: [
        "The learner level — Grade 12, not a general audience",
        "Whether the word equation and the role of chlorophyll are explained",
        "Whether the light-dependent and light-independent stages are separated",
        "Whether the answer ends with something you can actually practise",
      ],
    },
    prompts: {
      minimal: "Explain photosynthesis.",
      descriptive:
        "Explain photosynthesis to a Grade 12 student in clear, simple language. Include the word equation, explain what chlorophyll does with light energy, and make the difference between the light-dependent and light-independent stages easy to see. Finish with three exam-style questions and their answers.",
      collaborative:
        "Help me understand photosynthesis rather than just telling me about it. Start by asking what I already know about how plants make food, then point out the gaps in my understanding. Teach me one idea at a time and check I have understood with a short question before moving on.",
    },
    responses: {
      minimal: `Photosynthesis is how plants make their own food. Plants take in carbon dioxide from the air and water from the soil, and they use energy from sunlight to turn these into glucose and oxygen.

The reaction happens in the chloroplasts, which contain a green pigment called chlorophyll. Chlorophyll absorbs light energy, and that energy drives the reaction.

The word equation is: carbon dioxide + water → glucose + oxygen. The oxygen is released into the air.

Photosynthesis matters because it gives the plant its food and gives other living things oxygen. It happens mainly in the leaves, and it needs sunlight, water and carbon dioxide to work well.`,
      descriptive: `At Grade 12 you need two things: the overall equation, and the two stages that make it happen.

The word equation
carbon dioxide + water → glucose + oxygen
In symbols: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, in the presence of light and chlorophyll.

Where chlorophyll fits in
Chlorophyll is the green pigment inside chloroplasts. It absorbs light energy and converts it into chemical energy. Without chlorophyll, light energy cannot be captured, so photosynthesis stops.

The two stages
1. Light-dependent stage, in the thylakoid membranes. Light energy splits water — this is photolysis. Oxygen is released, and the energy carriers ATP and NADPH are produced.
2. Light-independent stage, in the stroma — the Calvin cycle. The energy carriers are used to combine carbon dioxide with hydrogen to build glucose.

Notice that light energy is only captured in stage 1, but glucose is only built in stage 2. That separation is what examiners look for.

Exam-style questions
1. State the word equation for photosynthesis. — carbon dioxide + water → glucose + oxygen.
2. Explain the role of chlorophyll. — It absorbs light energy and converts it to chemical energy, which drives the splitting of water.
3. Why does photosynthesis stop in a plant kept in the dark? — Chlorophyll cannot absorb light, so the light-dependent stage stops supplying ATP and NADPH, and the Calvin cycle cannot continue.`,
      collaborative: `Happy to work through this with you. Before I explain anything, I want to know where you are starting from, because photosynthesis is usually taught assuming you are already comfortable with two earlier ideas.

Two quick questions:

1. In your own words, what do you think a plant actually uses as its "food" — and where does that substance come from?
2. Have you already met the idea of energy being transferred from light into a chemical store? Or would that be new?

Once you have answered, I will compare your answers with what Grade 12 expects, and we will take the first missing idea on its own. I will not move on to the next idea until you have had a go at a short question about the one we just covered.

One line per question is plenty to start with.`,
    },
    focusPoints: [
      "How much the reply assumed about what you already knew",
      "Whether the explanation matched a Grade 12 level",
      "Whether the reply did the task or invited you to do it",
      "What you could actually practise afterwards",
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Stage 2 — feedback after the student commits to a judgment                 */
/* -------------------------------------------------------------------------- */

const SHARED_DIFFERENCES: JudgmentFeedback["differences"] = [
  {
    variant: "minimal",
    headline: "Reply A had almost nothing to work with",
    detail:
      "The request gave no audience, no depth and no purpose, so the reply had to guess. It produced a correct, general summary that would suit almost any level — which is exactly why it does not fit Grade 12 well. Nothing in it is wrong; it simply had no reason to be specific.",
  },
  {
    variant: "descriptive",
    headline: "Reply B was shaped by the details in the request",
    detail:
      "Naming the audience, the concepts to cover, the contrast to make visible and the practice questions changed four separate things about the answer. The result is longer, but the length is a consequence of the specification, not the goal in itself. This is what a well-described task buys you.",
  },
  {
    variant: "collaborative",
    headline: "Reply C changed the relationship, not just the content",
    detail:
      "This request did not ask for an answer at all. It asked the AI to find out what you know first and teach in steps. That is a different kind of help: slower, and you have to participate. Whether that is the right choice depends entirely on whether you want the answer or want to understand it.",
  },
];

type VariantFeedback = Pick<
  JudgmentFeedback,
  "acknowledgement" | "strengths" | "goodObservations" | "missedFactors" | "nextStep"
>;

const BY_CHOICE: Record<PromptVariant, VariantFeedback> = {
  minimal: {
    acknowledgement:
      "You chose Reply A — the one written from a vague, one-line request. It reads cleanly and it is not wrong, which is exactly why this choice is worth examining.",
    strengths: [
      "You will have noticed that the shortest request produced the fastest, easiest-to-read reply.",
      "You are weighing usefulness, not just length — that is the right instinct.",
    ],
    goodObservations: [
      "Reply A is genuinely the most efficient option if all you needed was a quick reminder.",
    ],
    missedFactors: [
      "Reply A never mentions the light-dependent and light-independent stages separately, which is the part Grade 12 exams usually reward.",
      "It gives you nothing to practise with afterwards, so you cannot check whether you understood it.",
      "There is no sign that the reply knows it is talking to a Grade 12 student rather than a general reader.",
    ],
    nextStep:
      "Next time, ask first whether you want to be *given* the answer or to *build* it. If you want the answer, say who it is for and what it must contain.",
  },
  descriptive: {
    acknowledgement:
      "You chose Reply B — the one written from a fully described request. That is the choice most experienced learners make, and your reasoning is worth taking seriously.",
    strengths: [
      "You noticed that specifying the audience and the output format changed the reply itself.",
      "Reply B is the only one that gives you something to practise with, and you can see that immediately.",
    ],
    goodObservations: [
      "The extra length in Reply B is doing work: the two stages, the chlorophyll explanation and the questions each come from a specific instruction.",
    ],
    missedFactors: [
      "Reply B still does the task *for* you. You could read it, feel that it made sense, and retain very little of it.",
      "Nothing in Reply B asks you whether the explanation actually landed, so it cannot correct a misunderstanding you already hold.",
      "It is worth asking whether the three exam questions would be enough practice, or whether you would need to attempt them without looking first.",
    ],
    nextStep:
      "Next time, add one line that makes the AI check you: ask it to test you, or to ask what you already know before it explains.",
  },
  collaborative: {
    acknowledgement:
      "You chose Reply C — the one that turns the task into a conversation. That is the least obvious choice here, and it is worth saying why it is interesting.",
    strengths: [
      "You recognised that Reply C changes the relationship between you and the AI, not just the wording.",
      "Choosing the slower option is a real decision about how you want to learn.",
    ],
    goodObservations: [
      "Reply C deliberately withholds the answer. It asks two diagnostic questions first, which is the only way it can find your actual gaps.",
    ],
    missedFactors: [
      "Reply C gives you no written material to revise from. If your exam is tomorrow, a slow dialogue may not fit the time you have.",
      "It depends entirely on you answering honestly. If you claim to know something you do not, the whole sequence is built on a false starting point.",
      "You would still want to finish by producing your own written summary, or the understanding stays conversational.",
    ],
    nextStep:
      "Next time, decide how much time you have before choosing the collaborative route — and plan to write your own summary at the end of it.",
  },
};

export function demoJudgment(chosen: PromptVariant): JudgmentFeedback {
  return {
    ...BY_CHOICE[chosen],
    differences: SHARED_DIFFERENCES,
    possibleMisconceptions: [
      "Longer is not automatically better. Reply B is strong because it was *specified*, not because it is long — the same details in three sentences would still work.",
      "Do not read Reply C as a trick or a non-answer. It is doing something different on purpose: it is helping you build the explanation rather than handing it over.",
    ],
    uncertaintyNote:
      "Before you rely on any of these replies, check them against your syllabus or textbook. In photosynthesis the details that exams reward — how many ATP molecules are used, whether oxygen comes from water or carbon dioxide — are easy to state confidently and get slightly wrong. The overall equation is safe; the fine detail deserves verification.",
  };
}

/* -------------------------------------------------------------------------- */
/* Stage 3 — running the student's improved prompt                            */
/* -------------------------------------------------------------------------- */

export function demoImprovedRun(prompt: string): ImprovedRun {
  const looksCollaborative = /teach|ask me|check|understand|step/i.test(prompt);

  return {
    response: looksCollaborative
      ? `Let us build this together.

First, tell me: why do plants need glucose at all? If you can answer that, you already understand more than you think.

Take a minute with it. When you are ready, I will tell you what your answer shows, and then we will look at where the light energy actually goes.`
      : `Here is photosynthesis written for the level you specified.

Word equation: carbon dioxide + water → glucose + oxygen, using light energy and chlorophyll.

The two stages matter more than the summary sentence. In the light-dependent stage, chlorophyll absorbs light energy and water is split, releasing oxygen and producing the carriers ATP and NADPH. In the light-independent stage, those carriers power the Calvin cycle in the stroma, where carbon dioxide is fixed into glucose.

So light energy is captured in stage one, but glucose is built in stage two. That distinction is usually the difference between a mid-grade answer and a strong one.

Practice: write the two stages from memory, then check which parts you left out.`,
    whatThisPromptAdds: [
      "You named the level, so the explanation now talks about what an examiner expects rather than giving a general introduction.",
      "You asked for a structure, so the reply separates the two stages instead of describing photosynthesis as one event.",
      "You asked for something to practise, so the reply ends with a task rather than stopping at the explanation.",
    ],
    watchOutFor: [
      "The reply does not tell you whether you *understood* it. Reading a clear explanation can feel like learning while leaving very little behind.",
      "The finer detail — how many ATP molecules are used, exactly where each stage happens — is easy to state confidently and get slightly wrong. Check it against your syllabus.",
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Stage 4 — closing reflection                                               */
/* -------------------------------------------------------------------------- */

export function demoReflection(): Reflection {
  return {
    changeSummary:
      "You moved from a request that gave the AI nothing to work with towards one that says who the answer is for, what it must contain, and what you want to do with it afterwards. That is the whole idea behind description.",
    whatImproved: [
      "The audience is now explicit, so the reply can pitch itself correctly.",
      "You specified the output, which stopped the reply from deciding the structure for you.",
      "You gave yourself something to do afterwards, which is where the learning actually happens.",
    ],
    whatToTryNext: [
      "Add one line that makes the AI check your understanding before it moves on: \"ask me a question before continuing\".",
      "Decide before you type whether you want the answer or want to build it — the choice changes the whole reply.",
      "Note down one claim from the reply that you would verify, and check it against your textbook.",
    ],
    closing:
      "You are now writing requests that shape the answer instead of hoping for a good one — that shift is the point of this whole lab.",
  };
}
