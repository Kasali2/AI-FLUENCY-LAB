import type { ModuleId } from "@/components/progress/ProgressProvider";

export type Accent = "glow" | "iris" | "amber" | "mint";

export type Option = {
  id: string;
  label: string;
  /**
   * `choose` lessons: this is the strongest option.
   * `audit` lessons: this statement genuinely is a problem with the material.
   */
  correct: boolean;
  feedback: string;
};

export type LessonInteraction =
  | {
      kind: "choose";
      question: string;
      options: Option[];
      reveal: string;
    }
  | {
      kind: "audit";
      question: string;
      /** Framing shown above the material being examined. */
      context: string;
      /** The AI output the student is auditing. */
      material: string;
      options: Option[];
      reveal: string;
    }
  | {
      kind: "builder";
      question: string;
      reveal: string;
    };

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  concept: string;
  example: { weak: string; strong: string; note: string };
  interaction: LessonInteraction;
  reflection: string;
};

export type PracticeModule = {
  id: ModuleId;
  step: number;
  title: string;
  question: string;
  tagline: string;
  accent: Accent;
  covers: string[];
  lessons: Lesson[];
};

/* -------------------------------------------------------------------------- */
/* Module 1 — DELEGATION                                                      */
/* -------------------------------------------------------------------------- */

const delegation: PracticeModule = {
  id: "delegation",
  step: 1,
  title: "Delegation",
  question: "Should AI do this task, or help you do it?",
  tagline: "Decide what to hand over — and what to keep.",
  accent: "glow",
  covers: [
    "Brainstorming",
    "Explanation",
    "Summarising",
    "Tutoring",
    "Debugging",
    "Organising and comparing",
    "When AI should not take the wheel",
  ],
  lessons: [
    {
      id: "d1",
      title: "The exam tomorrow",
      summary: "Two requests for the same task, and very different learning.",
      concept:
        "Delegation means deciding what to hand over. AI is very good at producing a plausible first draft, and very bad at knowing what you personally need to learn. So the useful question is not \u201ccan AI do this?\u201d — it is \u201cwhat do I want to be able to do afterwards?\u201d",
      example: {
        weak: "Give me the complete answer on mitosis so I can memorise it.",
        strong:
          "Help me find out which part of mitosis I actually do not understand, then test me on it.",
        note: "Both use AI. The difference is where the thinking lands. The first moves it away from you; the second moves it towards you.",
      },
      interaction: {
        kind: "choose",
        question:
          "You have an exam tomorrow and you do not understand mitosis. Which request would help you most?",
        options: [
          {
            id: "d1-a",
            label:
              "Give me the complete answer on mitosis so I can memorise it.",
            correct: false,
            feedback:
              "This produces a confident summary you can read and repeat. It will not tell you which stage is confusing you, and repeating wording is not the same as understanding a process.",
          },
          {
            id: "d1-b",
            label:
              "Help me identify which part of mitosis I do not understand, then test me on it.",
            correct: true,
            feedback:
              "This hands over the diagnosis and the questioning, not the answer. You still do the explaining, which is exactly where understanding forms.",
          },
          {
            id: "d1-c",
            label:
              "Summarise mitosis and give me five practice questions with answers.",
            correct: false,
            feedback:
              "A reasonable middle path. Practice beats pure memorising — but it still assumes you already know what you are stuck on, which is the thing you are unsure about.",
          },
        ],
        reveal:
          "All three use AI, and none of them is irrational. What changes is where the work lands: the first moves the thinking away from you, the second moves it towards you. A workable rule is to let AI handle the parts that are not the point of the task, and keep the parts that are. The question worth asking before you type is: what do I want to be able to do tomorrow, without AI?",
      },
      reflection:
        "Think of something you have to do this week. Which part is the actual learning, and which part is just work around the edges?",
    },
    {
      id: "d2",
      title: "When AI should not take the wheel",
      summary:
        "Some tasks should not be handed over, even when the output looks finished.",
      concept:
        "The more a task depends on your own experience, your own judgement or your own honesty, the less of it you should hand over. AI cannot know what you observed, what you measured, or what you actually think — so any output that claims to will be invented, however plausible it reads.",
      example: {
        weak: "Write the discussion section of my experiment report from these results.",
        strong:
          "What does a strong discussion section normally cover? I will write mine, then ask you to check whether my reasoning holds.",
        note: "\u201cCheck my reasoning\u201d keeps the reasoning yours. \u201cWrite it\u201d replaces it.",
      },
      interaction: {
        kind: "choose",
        question:
          "You have to submit a report on an experiment you actually carried out. Where should AI sit in that task?",
        options: [
          {
            id: "d2-a",
            label: "Ask AI to write the discussion section from my results.",
            correct: false,
            feedback:
              "The discussion is where you explain what your results mean. If AI writes it, the report describes reasoning you did not do. Teachers read your earlier work and can usually tell — and more importantly, you will not be able to defend it.",
          },
          {
            id: "d2-b",
            label:
              "Write the discussion myself, then ask AI where my reasoning is weak.",
            correct: true,
            feedback:
              "You keep the thinking and use AI as a critic. It is far more useful as a critic than as a ghost-writer, because it can see what you left out — and the thinking stays yours.",
          },
          {
            id: "d2-c",
            label:
              "Ask AI to produce the whole report, then rewrite it in my own words.",
            correct: false,
            feedback:
              "Rewording is not the same as doing the work. The structure, the interpretation and the conclusions would still be someone else's — and paraphrasing usually makes reasoning weaker rather than stronger.",
          },
        ],
        reveal:
          "The finished-looking output is the trap. A discussion section that reads well but describes reasoning you did not do is not your work, and it will not help you answer a question about it under exam conditions. Use AI most confidently on tasks where you can already judge whether the output is any good.",
      },
      reflection:
        "Name one task where you could judge AI output well, and one where you could not. What is different between them?",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Module 2 — DESCRIPTION                                                     */
/* -------------------------------------------------------------------------- */

const description: PracticeModule = {
  id: "description",
  step: 2,
  title: "Description",
  question: "What information does the AI need?",
  tagline:
    "Every detail you add removes a decision the AI would otherwise make for you.",
  accent: "iris",
  covers: [
    "Goal",
    "Context",
    "Audience",
    "Constraints",
    "Output format",
    "Success criteria",
  ],
  lessons: [
    {
      id: "s1",
      title: "Build a request",
      summary: "Assemble a request from six decidable parts.",
      concept:
        "A description is not decoration. Each piece of context you add removes one decision the AI would otherwise make silently on your behalf — and those silent decisions are where most disappointing answers come from. You do not need all six parts every time, but you should know which ones you are deliberately leaving out.",
      example: {
        weak: "Explain urban sprawl.",
        strong:
          "Explain urban sprawl for a Grade 11 Geography test. Cover two causes and two effects, and include one named example from a developing country.",
        note: "The first leaves the level, the depth and the output to chance. The second decides all three, for the cost of one extra line of typing.",
      },
      interaction: {
        kind: "builder",
        question:
          "Assemble a request about a topic you are actually studying right now.",
        reveal:
          "Notice that none of that required cleverness. You simply decided, in advance, the things you would otherwise have complained about afterwards: the level, the depth, the format and what counts as finished. Those four decisions are most of what people mean by \u201cprompting\u201d — and they are decisions about your task, not about the AI.",
      },
      reflection:
        "Which of the six parts do you most often leave out, and what does that cost you?",
    },
    {
      id: "s2",
      title: "Spot the missing detail",
      summary: "A request can sound thorough and still say nothing useful.",
      concept:
        "Judging a request is a different skill from judging an answer. A request can be polite, long and confident, and still give the AI nothing it can act on. The test is simple: could you tell, afterwards, whether the reply had followed your instructions? If not, your request did not specify anything.",
      example: {
        weak: "Explain climate change in a lot of detail please, it is for school.",
        strong:
          "Explain two causes and two effects of climate change for a Grade 11 Geography test, in about 250 words, ending with three questions I could be asked.",
        note: "\u201cA lot of detail\u201d describes effort. The second request describes requirements you could check.",
      },
      interaction: {
        kind: "choose",
        question:
          "You want something you can actually revise from. Which request will get it?",
        options: [
          {
            id: "s2-a",
            label:
              "Explain climate change in a lot of detail please, it is for school.",
            correct: false,
            feedback:
              "Polite, but it gives no level, no length, no scope and no output. The AI must decide all four — and it will probably decide them differently from what you needed.",
          },
          {
            id: "s2-b",
            label:
              "Explain two causes and two effects of climate change for a Grade 11 Geography test, in about 250 words, ending with three questions I could be asked.",
            correct: true,
            feedback:
              "Every part of this is decidable: level, scope, length, output. You can immediately tell whether the reply followed your instructions — which is what makes evaluating it possible at all.",
          },
          {
            id: "s2-c",
            label:
              "Explain climate change, then keep going until I tell you to stop.",
            correct: false,
            feedback:
              "This sounds collaborative but it hands control of the scope back to the AI. You will get a lot of text and no way to tell whether you have covered what your syllabus expects.",
          },
        ],
        reveal:
          "The difference is not length or politeness — it is that one request made its requirements checkable. Once you can check whether a reply followed your instructions, you have already done half of the evaluating. That is why description and discernment are really the same skill seen from two ends.",
      },
      reflection:
        "Rewrite one request you have made recently so that its requirements are checkable.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Module 3 — DISCERNMENT                                                     */
/* -------------------------------------------------------------------------- */

const discernment: PracticeModule = {
  id: "discernment",
  step: 3,
  title: "Discernment",
  question: "Which answer would you trust, and why?",
  tagline: "Read AI output critically, before you act on it.",
  accent: "amber",
  covers: [
    "Unsupported claims",
    "Incorrect reasoning",
    "Excessive confidence",
    "Missing information",
    "Instruction following",
    "Audience fit",
  ],
  lessons: [
    {
      id: "c1",
      title: "Audit a confident answer",
      summary:
        "Find the real problems in an answer that reads very well.",
      concept:
        "AI output is fluent. Fluency reads as authority, and that is the whole risk: a confident sentence is not a verified sentence. When you evaluate AI output, look for four things in particular — claims with nothing supporting them, overstatement, reasoning that contradicts itself, and important things left out.",
      example: {
        weak: "It reduces harmful emissions by 99%.",
        strong:
          "It significantly reduces harmful emissions once the converter has warmed up; the exact figure depends on the engine and the standard it is tested against.",
        note: "The second is slower and less impressive, and far safer to rely on. Precision is not the same thing as accuracy.",
      },
      interaction: {
        kind: "audit",
        question:
          "Flag every statement that is a genuine problem with this answer — not just a matter of taste.",
        context:
          "A student asked: \u201cExplain why a catalytic converter reduces pollution.\u201d The AI replied:",
        material:
          "Cars produce harmful gases such as carbon monoxide, unburnt hydrocarbons and nitrogen oxides. A catalytic converter contains a catalyst — usually platinum, palladium and rhodium — which speeds up the reactions that turn these gases into less harmful substances. Carbon monoxide is oxidised to carbon dioxide, and nitrogen oxides are reduced to nitrogen and oxygen. This happens at around 400\u00b0C. Catalytic converters reduce harmful emissions by up to 99%, which is why modern cars produce almost no pollution. Some converters also remove carbon dioxide, which helps to reduce global warming. For this reason, a catalytic converter is the single most effective way to reduce a car's impact on the environment.",
        options: [
          {
            id: "c1-a",
            label: "A statistic with nothing supporting it",
            correct: true,
            feedback:
              "The 99% figure arrives with no source and no conditions attached. Emissions standards differ by country and by test cycle, so a single unqualified number like this is misleading even if it was accurate somewhere once.",
          },
          {
            id: "c1-b",
            label: "A claim that is probably incorrect",
            correct: true,
            feedback:
              "Catalytic converters do not remove carbon dioxide — they cannot. Some converter designs can even produce a little carbon dioxide as a product. The answer states the opposite as established fact.",
          },
          {
            id: "c1-c",
            label: "Confident overstatement",
            correct: true,
            feedback:
              "\u201cThe single most effective way to reduce a car's impact on the environment\u201d is a sweeping claim. Electric vehicles, public transport, and simply driving less all belong in that conversation.",
          },
          {
            id: "c1-d",
            label: "Important information left out",
            correct: true,
            feedback:
              "It never mentions that a converter only works well once it has reached operating temperature. That omission genuinely matters, because short journeys produce far more pollution per kilometre.",
          },
          {
            id: "c1-e",
            label: "It uses technical vocabulary",
            correct: false,
            feedback:
              "Naming platinum, palladium and rhodium is appropriate here — the mechanism is the whole point of the question. Technical terms used accurately are not a fault.",
          },
          {
            id: "c1-f",
            label: "It does not include a diagram",
            correct: false,
            feedback:
              "The question asked why the converter reduces pollution, not how it is built. Nothing is missing simply because a diagram was left out.",
          },
        ],
        reveal:
          "Four genuine problems, two false alarms. Notice that the false alarms were about style and completeness — and that they are the easiest things to complain about, which is exactly why they crowd out the real issues. A useful habit: ask \u201ccould I check this?\u201d before \u201cdoes this sound right?\u201d",
      },
      reflection:
        "Which was harder — finding the problems, or deciding that some things were fine as they were?",
    },
    {
      id: "c2",
      title: "Audit an answer that ignored you",
      summary: "Technically correct is not the same as fit for purpose.",
      concept:
        "Instructions are part of the task. An answer can be accurate and still fail, because it ignored the level, the length or the purpose you set out. Checking instruction-following is usually the fastest way to find problems, because you can compare the reply against what you actually asked for rather than against your own knowledge.",
      example: {
        weak: "A 150-word answer full of formulas to a request for a 100-word explanation.",
        strong:
          "A 90-word answer at the right level, with the formula offered as an optional extension.",
        note: "Accurate is not the same as appropriate. Both things have to be checked.",
      },
      interaction: {
        kind: "audit",
        question:
          "The student set a clear boundary in the request. Flag every genuine problem below.",
        context:
          "A Grade 10 student asked: \u201cExplain stopping distance for my physics test, in under 100 words.\u201d The AI replied:",
        material:
          "Stopping distance is the total distance travelled from the moment a driver perceives a hazard to the moment the vehicle comes to rest. It is the sum of the thinking distance and the braking distance. Thinking distance is the distance covered during the driver's reaction time, typically taken as 0.7 s for an alert driver. Braking distance depends on the coefficient of friction between the tyres and the road surface and on the square of the velocity: s = u\u00b2 / (2a). For a vehicle travelling at 30 m/s braking at 6 m/s\u00b2, the braking distance is 75 m. Kinetic energy is dissipated as heat in the brake discs. Road gradient, tyre pressure, load and wet conditions all change the result. Because kinetic energy is proportional to the square of speed, doubling the speed roughly doubles the braking distance.",
        options: [
          {
            id: "c2-a",
            label: "It ignored an instruction",
            correct: true,
            feedback:
              "The student asked for under 100 words and this is around 150. The answer is competent, but it did not do what it was asked to do — which is the fastest thing to check and the easiest to overlook.",
          },
          {
            id: "c2-b",
            label: "It did not match the stated audience",
            correct: true,
            feedback:
              "It opens with s = u\u00b2 / (2a) and works a numerical example. For a Grade 10 student asking for a short explanation, that is pitched above the request and adds material nobody asked for.",
          },
          {
            id: "c2-c",
            label: "A claim that contradicts the reasoning right beside it",
            correct: true,
            feedback:
              "Doubling the speed roughly quadruples the braking distance, because kinetic energy depends on the square of speed. The answer states that relationship in its very next-to-last sentence and then contradicts it in the last one.",
          },
          {
            id: "c2-d",
            label: "It answered far more than was asked",
            correct: true,
            feedback:
              "The worked example and the list of road conditions were never requested. Extra material is not automatically a fault on its own, but here it is what pushed the answer past the limit the student set.",
          },
          {
            id: "c2-e",
            label: "It gives a correct overall definition of stopping distance",
            correct: false,
            feedback:
              "That definition is accurate, and it is not a problem. A true statement is not a flaw just because other parts of the answer have issues.",
          },
          {
            id: "c2-f",
            label: "It mentions the driver's reaction time",
            correct: false,
            feedback:
              "Reaction time is a legitimate part of thinking distance and belongs in the answer. Mentioning it is correct, not a fault.",
          },
        ],
        reveal:
          "This answer was the hardest kind to catch, because most of it is right. The failures were about the request, not about the physics: the length, the level and the one contradictory sentence. That is why you check the reply against what you asked for first — it is the only comparison you can make without already knowing the answer.",
      },
      reflection:
        "What would you have asked the AI to change, in a single follow-up sentence?",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Module 4 — DILIGENCE                                                       */
/* -------------------------------------------------------------------------- */

const diligence: PracticeModule = {
  id: "diligence",
  step: 4,
  title: "Diligence",
  question: "What should you verify before acting on this?",
  tagline: "Match your checking to the cost of being wrong.",
  accent: "mint",
  covers: [
    "Factual verification",
    "Calculations",
    "Sources",
    "Uncertainty",
    "Privacy and sensitive information",
    "Decisions that matter",
    "The limits of AI",
  ],
  lessons: [
    {
      id: "l1",
      title: "What must you check?",
      summary: "Not everything needs verifying — but some things always do.",
      concept:
        "Diligence is not distrust. It is matching how much you check to how much it would cost you to be wrong. A cooking idea can be wrong cheaply; a statistic in an assignment, a citation or a dose cannot. Three questions do most of the work: how costly would an error be, how easily could the AI have got this wrong, and could I check it without much effort?",
      example: {
        weak: "Using a statistic from an AI summary without opening the source.",
        strong:
          "Checking the figure against the original article, and the named report against the publisher's own site.",
        note: "Verifying is usually a two-minute job. The difficulty is remembering to do it, not doing it.",
      },
      interaction: {
        kind: "audit",
        question:
          "Which of these would you need to check before using the summary in your assignment?",
        context:
          "You asked AI to summarise a news article for a Civic Education assignment. The summary includes three statistics and names a report the figures supposedly came from.",
        material:
          "The summary is well written and reads as authoritative. It restates three figures, attributes them to a named national report, and adds one sentence of interpretation about what the figures mean for young people. Nothing in it looks out of place.",
        options: [
          {
            id: "l1-a",
            label: "Whether the three statistics are correct",
            correct: true,
            feedback:
              "Numbers are restated confidently and are easy to get subtly wrong. Check each one against the original article itself — not against a second AI summary, which may have inherited the same error.",
          },
          {
            id: "l1-b",
            label: "Whether the named report actually exists",
            correct: true,
            feedback:
              "AI can produce plausible-sounding report titles and organisations. Search for the exact title and the publishing body. If you cannot find it, treat it as invented until proven otherwise.",
          },
          {
            id: "l1-c",
            label: "Whether the summary preserved the article's meaning",
            correct: true,
            feedback:
              "Summarising can flip emphasis. Read the original once and ask whether the article's main point is still the summary's main point, or whether something important was quietly dropped.",
          },
          {
            id: "l1-d",
            label: "Whether the article is recent enough for your assignment",
            correct: true,
            feedback:
              "A correct figure from an old article can still be the wrong answer for a current assignment. Check the publication date as well as the figure.",
          },
          {
            id: "l1-e",
            label: "Whether the writing style is good enough",
            correct: false,
            feedback:
              "Style is not a correctness problem. You should rewrite it in your own words, but that is a writing decision, not a factual one.",
          },
          {
            id: "l1-f",
            label: "Whether the AI used British or American spelling",
            correct: false,
            feedback:
              "This is a formatting preference, not something to verify. Change it to match your school's convention if you like — nothing is falsified either way.",
          },
        ],
        reveal:
          "The four things worth checking are all about facts and provenance. The two that are not are about presentation. Being able to tell those apart is what keeps verification quick enough that you will actually do it.",
      },
      reflection:
        "Where would you have drawn the line if this were a personal project instead of an assignment?",
    },
    {
      id: "l2",
      title: "Money, prices and plans",
      summary: "Numbers are the least reliable part of an AI answer.",
      concept:
        "AI is fluent about numbers and structurally weak at them. It can produce a tidy budget table with prices from an unknown date, arithmetic that does not match the rows above it, and components that cannot be bought in the same country — and none of it looks wrong on the page. Structure is not evidence.",
      example: {
        weak: "Submitting a components budget straight from an AI-generated table.",
        strong:
          "Re-adding the total yourself, then checking each price with a local supplier.",
        note: "The total is the fastest thing to check and the most embarrassing thing to get wrong.",
      },
      interaction: {
        kind: "audit",
        question:
          "The budget has to be approved by your school. What must you check first?",
        context:
          "You are using AI to help plan a school robotics club budget of K4,000. It produced a table of components, unit prices and a total.",
        material:
          "The table lists twelve components — an ultrasonic sensor, a motor driver, a microcontroller board, jumper wires, a battery pack, a chassis kit and others — with a unit price for each, a quantity, and a line total. A row at the bottom reads \u201cTotal: K3,940\u201d, comfortably inside the K4,000 you mentioned. The list is grouped neatly by component type.",
        options: [
          {
            id: "l2-a",
            label: "Every price in the table",
            correct: true,
            feedback:
              "Prices are the least reliable part of any AI answer. They are learned from material of unknown date, and local availability and import costs change quickly. Check each one against a real supplier.",
          },
          {
            id: "l2-b",
            label: "The addition in the total",
            correct: true,
            feedback:
              "A model can produce a total that does not match the rows above it, and the table still looks tidy. Add the column yourself once — it takes about a minute.",
          },
          {
            id: "l2-c",
            label: "Whether the components are compatible with each other",
            correct: true,
            feedback:
              "Two individually correct parts can be wrong together — voltage, connector type, pin count, current draw. Compatibility is exactly the kind of joined-up reasoning that is easy to state confidently and easy to get wrong.",
          },
          {
            id: "l2-d",
            label: "Whether the parts can actually be bought locally",
            correct: true,
            feedback:
              "Stock, delivery time and import duty all change the plan. This is information the AI simply does not have, no matter how well the table is organised.",
          },
          {
            id: "l2-e",
            label: "Whether you have avoided sharing private details",
            correct: true,
            feedback:
              "Do not paste your school's banking details, pupil names, or your own address or ID number into an AI tool. Planning a budget does not require any of that, and anything you do paste may be retained.",
          },
          {
            id: "l2-f",
            label: "Whether the table has clear headings",
            correct: false,
            feedback:
              "Headings are a formatting nicety. Nothing about them can be wrong in a way that costs your club money.",
          },
          {
            id: "l2-g",
            label: "Whether the AI chose the cheapest possible options",
            correct: false,
            feedback:
              "Cheapest is a preference, not a fact you can verify. What matters is that the plan fits your real K4,000 constraint and the parts work together.",
          },
        ],
        reveal:
          "Five things genuinely need checking here, and four of them the AI could not have known: today's prices, local stock, your school's rules, and whether the parts fit together. That pattern is worth remembering. The more a task depends on current, local or personal facts, the less AI can be trusted on it — however well formatted the answer looks.",
      },
      reflection:
        "Which single check on that list would have caught the most expensive mistake?",
    },
    {
      id: "l3",
      title: "When the stakes are high",
      summary: "Some questions should not be settled by an AI at all.",
      concept:
        "Anything involving health, safety, money you cannot afford to lose, legal matters, or another person's private information belongs with a qualified human — usually one who can see the whole situation. This is not a limit of today's models that better models will fix. It is a limit of what any system without responsibility for the outcome can tell you.",
      example: {
        weak: "\u201cThe AI said it was fairly confident, so it should be fine.\u201d",
        strong: "\u201cIt might be right, but the cost of it being wrong is too high to find out from a chatbot.\u201d",
        note: "\u201cFairly confident\u201d is a style of writing, not a measurement.",
      },
      interaction: {
        kind: "choose",
        question:
          "An AI tool says it is \u201cfairly confident\u201d that a particular medicine dose is right for your younger brother. What do you do?",
        options: [
          {
            id: "l3-a",
            label: "Follow it — it said it was fairly confident.",
            correct: false,
            feedback:
              "\u201cFairly confident\u201d is a phrase the model produces, not a measurement it took. It has no way to know your brother's weight, age, allergies or history, and it cannot see him. Confidence in wording says nothing about correctness.",
          },
          {
            id: "l3-b",
            label:
              "Treat it as unverified, and ask a pharmacist, nurse or doctor.",
            correct: true,
            feedback:
              "A pharmacist can check a dose against a chart in a few minutes, and knows the interactions that matter. This is not distrust of AI — it is matching the level of checking to the cost of being wrong.",
          },
          {
            id: "l3-c",
            label:
              "Ask two other AI models, and follow whatever they agree on.",
            correct: false,
            feedback:
              "Two models agreeing is not verification. They were trained on overlapping material, so they tend to make similar mistakes with similar confidence. Agreement narrows nothing.",
          },
        ],
        reveal:
          "The phrase to watch is \u201cI am fairly confident\u201d. It sounds like a probability, but it is a style of writing. AI cannot assess its own reliability the way a pharmacist can check a dose against a chart. The rule: the steeper the consequence of being wrong, the more the answer has to come from someone who is accountable for it.",
      },
      reflection:
        "Where is your line? Name one thing you would happily act on from AI, and one thing you never would.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Module 2's prompt builder fields                                           */
/* -------------------------------------------------------------------------- */

export const BUILDER_FIELDS = [
  {
    id: "goal",
    label: "Goal",
    hint: "What do you actually want to walk away with?",
    placeholder: "e.g. Understand how enzymes are affected by temperature",
    example: "Help me understand how temperature affects enzyme activity.",
  },
  {
    id: "context",
    label: "Context",
    hint: "What is the situation? What have you already got?",
    placeholder: "e.g. I have the practical results but not the explanation",
    example: "I have my practical results but I cannot explain the pattern.",
  },
  {
    id: "audience",
    label: "Audience",
    hint: "Who is this for? What level are they at?",
    placeholder: "e.g. Me — Grade 12, revising for an exam",
    example: "Write it for me at Grade 12 level.",
  },
  {
    id: "constraints",
    label: "Constraints",
    hint: "Limits to respect — length, scope, level, things to avoid.",
    placeholder: "e.g. Under 250 words, no calculus",
    example: "Keep it under 250 words and avoid maths beyond simple ratios.",
  },
  {
    id: "format",
    label: "Output format",
    hint: "How should the answer be laid out?",
    placeholder: "e.g. A short explanation, then two exam-style questions",
    example:
      "Give a short explanation, then two exam-style questions with answers.",
  },
  {
    id: "success",
    label: "Success criteria",
    hint: "How will you know the answer is good enough?",
    placeholder: "e.g. I could explain it to someone else without notes",
    example:
      "I should be able to explain the pattern to a classmate without looking at my notes.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

export const MODULES: PracticeModule[] = [
  delegation,
  description,
  discernment,
  diligence,
];

export const TOTAL_LESSONS = MODULES.reduce(
  (total, entry) => total + entry.lessons.length,
  0,
);

export function getModule(id: string): PracticeModule | undefined {
  return MODULES.find((entry) => entry.id === id);
}

export function getLesson(
  moduleId: string,
  lessonId: string,
): { module: PracticeModule; lesson: Lesson } | undefined {
  const parent = getModule(moduleId);
  if (!parent) return undefined;

  const lesson = parent.lessons.find((entry) => entry.id === lessonId);
  if (!lesson) return undefined;

  return { module: parent, lesson };
}

export const ACCENT_CLASSES: Record<
  Accent,
  { text: string; border: string; bg: string; dot: string; ring: string }
> = {
  glow: {
    text: "text-glow-300",
    border: "border-glow-400/40",
    bg: "bg-glow-400/10",
    dot: "bg-glow-400",
    ring: "ring-glow-400/40",
  },
  iris: {
    text: "text-iris-300",
    border: "border-iris-400/40",
    bg: "bg-iris-400/10",
    dot: "bg-iris-400",
    ring: "ring-iris-400/40",
  },
  amber: {
    text: "text-amber-400",
    border: "border-amber-400/40",
    bg: "bg-amber-400/10",
    dot: "bg-amber-400",
    ring: "ring-amber-400/40",
  },
  mint: {
    text: "text-mint-400",
    border: "border-mint-400/40",
    bg: "bg-mint-400/10",
    dot: "bg-mint-400",
    ring: "ring-mint-400/40",
  },
};
