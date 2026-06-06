import { z } from "zod";
import { formatOnboardingForPrompt, type OnboardingProfile } from "@/lib/onboarding";
import { estimateDurationFromSlides } from "@/lib/lessonDuration";
import { getOpenAiApiKey } from "@/server/env";
import { HttpError } from "@/server/errors";

const slideLayoutSchema = z.enum(["bullets", "title", "visual", "two-col", "statement"]);

const moduleSlidesSchema = z.object({
  keyPoints: z.array(z.string()),
  slides: z.array(
    z.object({
      title: z.string().min(1),
      points: z.array(z.string()),
      explanationText: z.string().min(10),
      diagramQuery: z.string().optional().nullable(),
      layout: slideLayoutSchema.default("bullets"),
    })
  ),
});

export type SlideLayout = z.infer<typeof slideLayoutSchema>;

export type ModuleContent = z.infer<typeof moduleSlidesSchema> & {
  duration: string;
};

export async function generateModuleContent(input: {
  topic: string;
  goal: string;
  learnerLevel: string;
  moduleTitle: string;
  moduleDescription: string;
  sourceHighlights: string[];
  learningObjectives: string[];
  onboarding?: OnboardingProfile;
}): Promise<ModuleContent> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    const errMsg = "OpenAI is not configured. Set OPENAI_API_KEY.";
    console.error("[OpenaiService] [generateModuleContent] Error: " + errMsg);
    throw new HttpError(500, "OPENAI_NOT_CONFIGURED", errMsg);
  }

  console.log("[OpenaiService] [generateModuleContent] Start generating content", { 
    topic: input.topic, 
    moduleTitle: input.moduleTitle,
    learnerLevel: input.learnerLevel
  });

  const sourcesBlock =
    input.sourceHighlights.length > 0
      ? input.sourceHighlights.slice(0, 12).map((h) => `- ${h}`).join("\n")
      : "- No external highlights available. Keep content general and accurate.";

  const onboardingBlock = input.onboarding
    ? `\nLearner profile:\n${formatOnboardingForPrompt(input.onboarding)}\n`
    : "";

  const systemPrompt = `You are Professor Aethex on Grasp — a warm, expert teacher recording a voice lesson for one student.
Write content that will be read aloud by text-to-speech. Sound like a real instructor in a classroom, not a report, blog post, or slide deck.

Voice rules (critical):
- Speak directly to the learner ("you", "we", "let's").
- Teach step by step with examples and short checks for understanding.
- NEVER say "this slide", "on this slide", "the next slide", "in this module", "as mentioned above", or "this section".
- NEVER use report language ("this document", "the following points", "we will now examine").
- No markdown. No bullet symbols in explanationText — bullets belong only in the points array.
- Stay grounded in source highlights when provided.
Use plain language for ${input.learnerLevel} learners.
When a lesson language is specified, write learner-facing text in that language; keep JSON keys in English.

Math notation rules:
- When a slide covers mathematical or scientific content with formulas/equations, write them using LaTeX syntax.
- Use $...$ for inline math (e.g. $E = mc^2$) and $$...$$ for block/display math (e.g. $$\\int_0^\\infty e^{-x}\\,dx = 1$$).
- Math notation is allowed in both points and explanationText.
- Only use math notation when it genuinely aids understanding — do not force it on non-mathematical content.

Diagram rules (CRITICAL — diagrams dramatically improve learning, do not skip them):
- ANY slide covering biology, anatomy, chemistry, physics, astronomy, ecology, geology, medicine, or earth science MUST have a diagramQuery.
- ANY slide introducing a named structure (cell organelles, DNA, atom, heart, lung, brain, neuron, leaf, flower, rock cycle, water cycle, food chain, solar system, circuit, etc.) MUST have a diagramQuery.
- Set diagramQuery to the most specific, accurate Wikipedia article title for the concept (e.g. "Cell (biology)", "Animal cell", "Plant cell", "Mitochondrion", "DNA", "Atom", "Human heart", "Neuron", "Photosynthesis", "Water cycle", "Solar System", "Periodic table", "Chloroplast", "Ribosome", "Chromosome").
- For historical events, math concepts, language skills, or abstract ideas with no physical structure to visualize, set diagramQuery to null.
- diagramQuery must be a precise English Wikipedia article title. When in doubt, include one — it is better to try than to leave it null.

Slide layout rules (CRITICAL — vary layouts for engagement, never use only "bullets"):
Available layouts and when to use them:
- "title": Use for the FIRST slide of every module and any major section-opening concept. Has a large centered title and a brief subtitle. Points array should have exactly 1 item (the subtitle/hook sentence).
- "visual": Use when the slide has a diagramQuery AND the diagram is the primary teaching tool (e.g., "This is a cell", "The water cycle", "The periodic table"). Points serve as labeled callouts (2–3 short labels only). The diagram takes center stage.
- "two-col": Use for compare/contrast, cause/effect, or process slides. Points split into two columns — use exactly 4 to 6 points so they split evenly.
- "statement": Use for a single powerful concept, a surprising fact, a key definition, or a memorable takeaway. Points array has exactly 1 item — a bold, punchy sentence.
- "bullets": Default. Use for explanation slides with 3–5 normal bullet points.
Distribute layouts across all slides in a module so no more than 3 consecutive slides share the same layout.
A 7-slide module should aim for: 1 title, 1–2 visual, 1 statement, 1 two-col, 2–3 bullets.`;

  const userPrompt = `Topic: ${input.topic}
Goal: ${input.goal}
Learner level: ${input.learnerLevel}
${onboardingBlock}
Module title: ${input.moduleTitle}
Module description: ${input.moduleDescription}

Course learning objectives:
${input.learningObjectives.map((o) => `- ${o}`).join("\n")}

Source highlights:
${sourcesBlock}

Return JSON only:
{
  "keyPoints": ["string"],
  "slides": [
    {
      "title": "short lesson beat title",
      "layout": "bullets | title | visual | two-col | statement",
      "points": ["spoken bullet", "spoken bullet", "spoken bullet"],
      "explanationText": "full voice script the teacher reads aloud",
      "diagramQuery": "Wikipedia article title or null"
    }
  ]
}

Content rules:
- 6 to 8 slides per module — exhaustive coverage, not a skim
- 5 to 8 keyPoints summarizing the module
- 3 to 5 points per slide (concrete, not generic), except: title=1, statement=1, visual=2-3, two-col=4-6
- Each explanationText: 200–320 words of continuous spoken teaching for that beat
- Open with a hook, teach the idea, give an example, close with a takeaway
- Do NOT include duration — we calculate it from word count
- Science/biology/anatomy/physics slides MUST set diagramQuery to a real Wikipedia article title
- Vary layouts — aim for a mix of title + visual + two-col + statement + bullets across the module`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 8192,
      temperature: 0.45,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[OpenaiService] [generateModuleContent] OpenAI request failed", { status: response.status, errorText });
    throw new HttpError(502, "OPENAI_REQUEST_FAILED", `OpenAI request failed: ${errorText}`);
  }

  console.log("[OpenaiService] [generateModuleContent] OpenAI request succeeded");

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new HttpError(502, "OPENAI_EMPTY_RESPONSE", "OpenAI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new HttpError(502, "OPENAI_INVALID_JSON", "OpenAI returned invalid JSON.");
  }

  const validated = moduleSlidesSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("OpenAI module schema mismatch details:", validated.error.format());
    throw new HttpError(
      502,
      "OPENAI_SCHEMA_MISMATCH",
      `OpenAI response did not match the expected module schema: ${validated.error.message}`
    );
  }

  const duration = estimateDurationFromSlides(validated.data.slides);

  console.log("[OpenaiService] [generateModuleContent] Content parsed and validated successfully", { 
    moduleTitle: input.moduleTitle, 
    duration 
  });

  return {
    ...validated.data,
    duration,
  };
}

const lessonPackSchema = z.object({
  summary: z.string(),
  learningObjectives: z.array(z.string()).min(1),
  lessonOutline: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string(),
    })
  ).min(1),
  quizQuestions: z.array(z.string()),
  sources: z.array(
    z.object({
      title: z.string().min(1),
      url: z.string(),
      highlights: z.array(z.string()),
    })
  ),
});

export async function generateLessonPack(input: {
  topic: string;
  goal: string;
  learnerLevel: string;
  onboarding?: OnboardingProfile;
  type?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  maxAgeHours?: number;
}) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    const errMsg = "OpenAI is not configured. Set OPENAI_API_KEY.";
    console.error("[OpenaiService] [generateLessonPack] Error: " + errMsg);
    throw new HttpError(500, "OPENAI_NOT_CONFIGURED", errMsg);
  }

  console.log("[OpenaiService] [generateLessonPack] Start generating lesson pack", { 
    topic: input.topic, 
    learnerLevel: input.learnerLevel 
  });

  const onboardingBlock = input.onboarding
    ? `\nLearner profile:\n${formatOnboardingForPrompt(input.onboarding)}\n`
    : "";

  const systemPrompt = `You are a curriculum designer and researcher for Grasp.
Your job is to design a high-quality lesson pack for a user's target topic and goals.
Additionally, act as a web search research engine and provide 2-5 high-quality, real-world educational resources (from trusted domains like wikipedia.org, khanacademy.org, nasa.gov, britannica.com, or university sites) relevant to the topic.
For each source, provide a real or highly accurate URL, a descriptive title, and 2-4 actual content highlights/snippets discussing the topic.

Return JSON in this exact structure:
{
  "summary": "Max 2 short sentences (~200 chars). Why this topic matters.",
  "learningObjectives": ["objective 1", "objective 2"],
  "lessonOutline": [
    {
      "title": "Module Title",
      "description": "Max 2 short sentences (~150 chars)."
    }
  ],
  "quizQuestions": ["question 1", "question 2"],
  "sources": [
    {
      "title": "Title of the web resource",
      "url": "https://example.com/topic-url",
      "highlights": ["Snippet 1 from the resource", "Snippet 2 from the resource"]
    }
  ]
}`;

  const userPrompt = `Topic: ${input.topic}
Goal: ${input.goal}
Learner level: ${input.learnerLevel}
${onboardingBlock}
Please design a tailored lesson pack and research sources matching this profile.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[OpenaiService] [generateLessonPack] OpenAI request failed", { status: response.status, errorText });
    throw new HttpError(502, "OPENAI_REQUEST_FAILED", `OpenAI request failed: ${errorText}`);
  }

  console.log("[OpenaiService] [generateLessonPack] OpenAI request succeeded");

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new HttpError(502, "OPENAI_EMPTY_RESPONSE", "OpenAI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new HttpError(502, "OPENAI_INVALID_JSON", "OpenAI returned invalid JSON.");
  }

  const validated = lessonPackSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("OpenAI lesson pack schema mismatch details:", validated.error.format());
    throw new HttpError(
      502,
      "OPENAI_SCHEMA_MISMATCH",
      `OpenAI response did not match the expected lesson pack schema: ${validated.error.message}`
    );
  }

  console.log("[OpenaiService] [generateLessonPack] Pack parsed and validated successfully", {
    topic: input.topic,
    summary: validated.data.summary,
    modulesCount: validated.data.lessonOutline.length
  });

  return {
    query: `openai-search: ${input.topic}`,
    type: input.type ?? "openai",
    sourceResults: validated.data.sources,
    content: {
      summary: validated.data.summary,
      learningObjectives: validated.data.learningObjectives,
      lessonOutline: validated.data.lessonOutline,
      quizQuestions: validated.data.quizQuestions,
    },
    grounding: [],
  };
}
