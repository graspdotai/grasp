import { z } from "zod";
import { formatOnboardingForPrompt, type OnboardingProfile } from "@/lib/onboarding";
import { getOpenAiApiKey } from "@/server/env";
import { HttpError } from "@/server/errors";

const moduleContentSchema = z.object({
  duration: z.string().min(3),
  keyPoints: z.array(z.string().min(3)).min(4).max(8),
  slides: z
    .array(
      z.object({
        title: z.string().min(3),
        points: z.array(z.string().min(3)).min(3).max(6),
        explanationText: z.string().min(80),
      })
    )
    .min(4)
    .max(6),
});

export type ModuleContent = z.infer<typeof moduleContentSchema>;

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

  const targetDuration = input.onboarding?.lessonLength ?? "10 min";
  const sourcesBlock =
    input.sourceHighlights.length > 0
      ? input.sourceHighlights.slice(0, 12).map((h) => `- ${h}`).join("\n")
      : "- No external highlights available. Keep content general and accurate.";

  const onboardingBlock = input.onboarding
    ? `\nLearner profile:\n${formatOnboardingForPrompt(input.onboarding)}\n`
    : "";

  const systemPrompt = `You are a course author for Grasp, a voice-first learning platform.
Generate structured module content as JSON only.
Stay grounded in the provided source highlights when available.
Use plain language suitable for ${input.learnerLevel} learners.
When a preferred lesson language is given, write slide text in that language but keep JSON keys in English.
Do not use markdown.`;

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

Return JSON with this exact shape:
{
  "duration": "${targetDuration}",
  "keyPoints": ["string", "string"],
  "slides": [
    {
      "title": "string",
      "points": ["bullet", "bullet", "bullet"],
      "explanationText": "A full spoken lesson for this slide (120-180 words)"
    }
  ]
}

Rules:
- 4 to 5 slides per module with substantive teaching content
- 4 to 5 keyPoints for the module
- 3 to 4 bullet points per slide (specific, not generic)
- explanationText is conversational and TTS-friendly (120-180 words per slide)
- duration should be about ${targetDuration}`;

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

  const validated = moduleContentSchema.safeParse(parsed);
  if (!validated.success) {
    throw new HttpError(
      502,
      "OPENAI_SCHEMA_MISMATCH",
      "OpenAI response did not match the expected module schema."
    );
  }

  return validated.data;
}
