import { z } from "zod";
import { formatOnboardingForPrompt, type OnboardingProfile } from "@/lib/onboarding";
import { estimateDurationFromSlides } from "@/lib/lessonDuration";
import { getOpenAiApiKey } from "@/server/env";
import { HttpError } from "@/server/errors";

const moduleSlidesSchema = z.object({
  keyPoints: z.array(z.string().min(3)).min(5).max(10),
  slides: z
    .array(
      z.object({
        title: z.string().min(3),
        points: z.array(z.string().min(3)).min(3).max(6),
        explanationText: z.string().min(120),
      })
    )
    .min(6)
    .max(10),
});

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
    throw new HttpError(500, "OPENAI_NOT_CONFIGURED", "OpenAI is not configured. Set OPENAI_API_KEY.");
  }

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
When a lesson language is specified, write learner-facing text in that language; keep JSON keys in English.`;

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
      "points": ["spoken bullet", "spoken bullet", "spoken bullet"],
      "explanationText": "full voice script the teacher reads aloud"
    }
  ]
}

Content rules:
- 6 to 8 slides per module — exhaustive coverage, not a skim
- 5 to 8 keyPoints summarizing the module
- 3 to 5 points per slide (concrete, not generic)
- Each explanationText: 200–320 words of continuous spoken teaching for that beat
- Open with a hook, teach the idea, give an example, close with a takeaway
- Do NOT include duration — we calculate it from word count`;

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
    throw new HttpError(502, "OPENAI_REQUEST_FAILED", `OpenAI request failed: ${errorText}`);
  }

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
    throw new HttpError(
      502,
      "OPENAI_SCHEMA_MISMATCH",
      "OpenAI response did not match the expected module schema."
    );
  }

  const duration = estimateDurationFromSlides(validated.data.slides);

  return {
    ...validated.data,
    duration,
  };
}
