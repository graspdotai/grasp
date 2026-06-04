import { Exa, type SearchResponse } from "exa-js";
import { z } from "zod";
import { exaSearchRetries, exaSearchTimeoutMs, getExaApiKey } from "@/server/env";
import { HttpError } from "@/server/errors";
import {
  formatOnboardingForPrompt,
  onboardingProfileSchema,
  type OnboardingProfile,
} from "@/lib/onboarding";

const searchTypeSchema = z.enum([
  "auto",
  "fast",
  "instant",
  "deep-lite",
  "deep",
  "deep-reasoning",
]);

const lessonPackRequestSchema = z.object({
  topic: z.string().min(3),
  goal: z.string().min(3),
  learnerLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  type: searchTypeSchema.default("deep"),
  includeDomains: z.array(z.string().min(3)).optional(),
  excludeDomains: z.array(z.string().min(3)).optional(),
  maxAgeHours: z.coerce.number().int().min(-1).optional(),
  onboarding: onboardingProfileSchema.optional(),
});

function getExaClient() {
  const apiKey = getExaApiKey();
  if (!apiKey) {
    throw new HttpError(500, "EXA_NOT_CONFIGURED", "Exa is not configured. Set EXA_API_KEY.");
  }
  return new Exa(apiKey);
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("network") ||
    message.includes("rate limit") ||
    message.includes("429") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new HttpError(504, "EXA_TIMEOUT", "Exa request timed out."));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function runWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  const attempts = exaSearchRetries + 1;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await withTimeout(fn(), exaSearchTimeoutMs);
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt >= attempts) break;
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
    }
  }

  if (lastError instanceof HttpError) throw lastError;
  if (lastError instanceof Error) {
    throw new HttpError(502, "EXA_REQUEST_FAILED", `Exa request failed: ${lastError.message}`);
  }
  throw new HttpError(502, "EXA_REQUEST_FAILED", "Exa request failed.");
}

function mapSearchResults(
  rawResults: unknown
): Array<{ title: string | null; url: string; highlights: string[] }> {
  const safeArray = Array.isArray(rawResults) ? rawResults : [];

  return safeArray
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const maybeTitle = "title" in item && typeof item.title === "string" ? item.title : null;
      const maybeUrl = "url" in item && typeof item.url === "string" ? item.url : null;
      const maybeHighlights =
        "highlights" in item && Array.isArray(item.highlights)
          ? item.highlights.filter((h: unknown): h is string => typeof h === "string")
          : [];

      if (!maybeUrl) return null;

      return { title: maybeTitle, url: maybeUrl, highlights: maybeHighlights };
    })
    .filter(
      (result): result is { title: string | null; url: string; highlights: string[] } =>
        Boolean(result)
    );
}

function buildLessonQuery(input: z.infer<typeof lessonPackRequestSchema>): string {
  const parts = [input.topic, input.goal, input.learnerLevel, "tutorial, examples, exercises"];

  if (input.onboarding?.interests.length) {
    parts.push(input.onboarding.interests.join(" "));
  }
  if (input.onboarding?.personas.length) {
    parts.push(`for ${input.onboarding.personas.join(" ")}`);
  }

  return parts.join(" ");
}

function buildOnboardingSystemNote(onboarding?: OnboardingProfile): string {
  if (!onboarding) {
    return "Prefer primary and high-quality educational sources. Deduplicate similar sources. Keep output grounded in retrieved evidence.";
  }

  return [
    "Prefer primary and high-quality educational sources. Deduplicate similar sources. Keep output grounded in retrieved evidence.",
    "Tailor the lesson outline to this learner profile:",
    formatOnboardingForPrompt(onboarding),
  ].join(" ");
}

export async function generateLessonPack(payload: unknown) {
  const input = lessonPackRequestSchema.parse(payload);
  const exa = getExaClient();
  const query = buildLessonQuery(input);

  const response = await runWithRetry<SearchResponse<{ highlights: true }>>(() =>
    exa.search(query, {
      type: input.type,
      numResults: 8,
      includeDomains: input.includeDomains,
      excludeDomains: input.excludeDomains,
      systemPrompt: buildOnboardingSystemNote(input.onboarding),
      outputSchema: {
        type: "object",
        required: ["summary", "learningObjectives", "lessonOutline", "quizQuestions"],
        properties: {
          summary: { type: "string", description: "Grounded summary of the topic and why it matters." },
          learningObjectives: { type: "array", items: { type: "string" } },
          lessonOutline: {
            type: "array",
            items: {
              type: "object",
              required: ["title", "description"],
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
            },
          },
          quizQuestions: { type: "array", items: { type: "string" } },
        },
      },
      contents: { highlights: true, maxAgeHours: input.maxAgeHours },
    })
  );

  const output = typeof response.output === "object" && response.output ? response.output : null;
  const structuredContent =
    output && "content" in output && typeof output.content === "object" ? output.content : null;
  const grounding =
    output && "grounding" in output && Array.isArray(output.grounding) ? output.grounding : [];

  return {
    query,
    type: input.type,
    sourceResults: mapSearchResults(response.results),
    content: structuredContent,
    grounding,
  };
}
