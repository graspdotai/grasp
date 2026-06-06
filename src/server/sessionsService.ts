import { z } from "zod";
import {
  clampText,
  COURSE_SUMMARY_MAX,
  MODULE_DESCRIPTION_MAX,
} from "@/lib/clampText";
import { onboardingProfileSchema } from "@/lib/onboarding";
import { HttpError } from "@/server/errors";
import { generateModuleContent, generateLessonPack, type ModuleContent } from "@/server/openaiService";
import { upsertProfileFromOnboarding } from "@/server/profilesService";
import { getSupabaseAdminClient } from "@/server/supabase";
import { generateAethexTts } from "@/server/aethexService";
import { uploadAudioToCloudinary } from "@/server/cloudinaryService";
import { onboardingLanguageToTts } from "@/lib/courseApi";

const searchTypeSchema = z.enum([
  "auto",
  "fast",
  "instant",
  "deep-lite",
  "deep",
  "deep-reasoning",
]);

const createSessionSchema = z.object({
  topic: z.string().min(3),
  goal: z.string().min(3),
  learnerLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  type: searchTypeSchema.default("deep"),
  includeDomains: z.array(z.string().min(3)).optional(),
  excludeDomains: z.array(z.string().min(3)).optional(),
  maxAgeHours: z.coerce.number().int().min(-1).optional(),
  onboarding: onboardingProfileSchema.optional(),
  userId: z.string().uuid().optional(),
});

const lessonPackContentSchema = z.object({
  summary: z.string(),
  learningObjectives: z.array(z.string()).default([]),
  lessonOutline: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .default([]),
  quizQuestions: z.array(z.string()).default([]),
});

const sessionIdSchema = z.string().uuid();

type SessionModuleRow = {
  id: number;
  position: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
};

type KeyPointRow = { module_id: number; position: number; text: string };
type SlideRow = {
  id: number;
  module_id: number;
  position: number;
  title: string;
  explanation_text: string;
  audio_url?: string | null;
  diagram_query?: string | null;
  layout?: string | null;
};
type SlidePointRow = { slide_id: number; position: number; text: string };

function flattenHighlights(sourceResults: Array<{ highlights: string[] }>): string[] {
  return sourceResults.flatMap((source) => source.highlights).filter(Boolean);
}

function defaultModuleDuration(onboarding?: z.infer<typeof onboardingProfileSchema>): string {
  return onboarding?.lessonLength ?? "10 mins";
}

async function persistModuleContent(
  moduleId: number,
  content: ModuleContent,
  nowIso: string,
  language: string = "english",
  onProgress?: (slideIndex: number, slideTitle: string) => void
): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error: moduleUpdateError } = await supabase
    .from("session_modules")
    .update({ duration: content.duration })
    .eq("id", moduleId);

  if (moduleUpdateError) {
    console.error("[SessionsService] [persistModuleContent] Module update failed", { moduleId, error: moduleUpdateError.message });
    throw new HttpError(500, "MODULE_UPDATE_FAILED", moduleUpdateError.message);
  }

  console.log("[SessionsService] [persistModuleContent] Updated module duration", { moduleId, duration: content.duration });

  const keyPointRows = content.keyPoints.map((text, index) => ({
    module_id: moduleId,
    position: index + 1,
    text,
    created_at: nowIso,
  }));

  if (keyPointRows.length > 0) {
    const { error } = await supabase.from("session_module_key_points").insert(keyPointRows);
    if (error) throw new HttpError(500, "KEY_POINTS_FAILED", error.message);
  }

  for (const [slideIndex, slide] of content.slides.entries()) {
    onProgress?.(slideIndex + 1, slide.title);
    let audioUrl: string | null = null;
    try {
      if (slide.explanationText) {
        console.log(`[SessionsService] [persistModuleContent] Pregenerating Aethex TTS audio for slide`, {
          title: slide.title,
          language
        });
        const audioBuffer = await generateAethexTts(slide.explanationText, language);
        audioUrl = await uploadAudioToCloudinary(audioBuffer);
        console.log(`[SessionsService] [persistModuleContent] Cloudinary audio uploaded`, { audioUrl });
      }
    } catch (audioErr) {
      console.error(`[SessionsService] [persistModuleContent] Failed to pregenerate audio for slide`, {
        title: slide.title,
        error: audioErr
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: slideRow, error: slideError } = await (supabase
      .from("session_slides") as any)
      .insert({
        module_id: moduleId,
        position: slideIndex + 1,
        title: slide.title,
        explanation_text: slide.explanationText,
        audio_url: audioUrl,
        diagram_query: slide.diagramQuery ?? null,
        layout: slide.layout ?? "bullets",
        created_at: nowIso,
      })
      .select("id")
      .single();

    if (slideError || !slideRow) {
      throw new HttpError(500, "SLIDE_INSERT_FAILED", slideError?.message ?? "Unknown error");
    }

    const pointRows = slide.points.map((text, pointIndex) => ({
      slide_id: slideRow.id,
      position: pointIndex + 1,
      text,
      created_at: nowIso,
    }));

    if (pointRows.length > 0) {
      const { error: pointError } = await supabase.from("session_slide_points").insert(pointRows);
      if (pointError) throw new HttpError(500, "SLIDE_POINTS_FAILED", pointError.message);
    }
  }
}

function buildCourseSections(
  modules: SessionModuleRow[],
  keyPoints: KeyPointRow[],
  slides: SlideRow[],
  slidePoints: SlidePointRow[]
) {
  const keyPointsByModule = new Map<number, string[]>();
  for (const row of keyPoints) {
    const list = keyPointsByModule.get(row.module_id) ?? [];
    list.push(row.text);
    keyPointsByModule.set(row.module_id, list);
  }

  const pointsBySlide = new Map<number, string[]>();
  for (const row of slidePoints) {
    const list = pointsBySlide.get(row.slide_id) ?? [];
    list.push(row.text);
    pointsBySlide.set(row.slide_id, list);
  }

  const slidesByModule = new Map<number, SlideRow[]>();
  for (const slide of slides) {
    const list = slidesByModule.get(slide.module_id) ?? [];
    list.push(slide);
    slidesByModule.set(slide.module_id, list);
  }

  return modules.map((module) => {
    const moduleSlides = (slidesByModule.get(module.id) ?? []).sort(
      (a, b) => a.position - b.position
    );

    return {
      id: String(module.id),
      title: module.title,
      duration: module.duration,
      completed: module.completed,
      description: module.description,
      keyPoints: keyPointsByModule.get(module.id) ?? [],
      slides: moduleSlides.map((slide) => ({
        title: slide.title,
        points: pointsBySlide.get(slide.id) ?? [],
        explanationText: slide.explanation_text,
        audioUrl: slide.audio_url || null,
        diagramQuery: slide.diagram_query || null,
        layout: (slide.layout || "bullets") as "bullets" | "title" | "visual" | "two-col" | "statement",
      })),
    };
  });
}

function parseOnboardingFromRaw(raw: unknown): z.infer<typeof onboardingProfileSchema> | undefined {
  if (!raw || typeof raw !== "object" || !("onboarding" in raw)) return undefined;
  const parsed = onboardingProfileSchema.safeParse((raw as { onboarding: unknown }).onboarding);
  return parsed.success ? parsed.data : undefined;
}

export async function createLearningSession(
  payload: unknown,
  onProgress?: (progress: { status: string; message: string; step?: number; totalSteps?: number }) => void
) {
  const input = createSessionSchema.parse(payload);
  console.log("[SessionsService] [createLearningSession] Start session creation", { 
    topic: input.topic, 
    learnerLevel: input.learnerLevel,
    type: input.type
  });

  onProgress?.({
    status: "researching",
    message: "Analyzing your topic and researching sources..."
  });

  const supabase = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const moduleDurationDefault = defaultModuleDuration(input.onboarding);

  if (input.userId && input.onboarding) {
    try {
      await upsertProfileFromOnboarding(input.userId, input.onboarding);
      console.log("[SessionsService] [createLearningSession] Profile upserted for user", { userId: input.userId });
    } catch (profileError) {
      console.warn("[SessionsService] [createLearningSession] Profile upsert skipped:", profileError);
    }
  }

  const lessonPack = await generateLessonPack(input);
  const parsedContent = lessonPackContentSchema.safeParse(lessonPack.content);
  if (!parsedContent.success) {
    console.error("[SessionsService] [createLearningSession] Lesson pack parsing failed", parsedContent.error.format());
    throw new HttpError(
      502,
      "LESSON_PACK_INVALID",
      "Exa returned an invalid lesson pack. Try again with a narrower topic."
    );
  }
  
  console.log("[SessionsService] [createLearningSession] Generated lesson pack successfully");

  onProgress?.({
    status: "planning",
    message: "Structuring custom curriculum..."
  });

  const sourceHighlights = flattenHighlights(lessonPack.sourceResults);

  const { data: sessionRow, error: sessionError } = await supabase
    .from("learning_sessions")
    .insert({
      user_id: input.userId ?? null,
      topic: input.topic,
      goal: input.goal,
      learner_level: input.learnerLevel,
      search_type: input.type,
      status: "generating",
      summary: clampText(parsedContent.data.summary, COURSE_SUMMARY_MAX),
      learning_objectives: parsedContent.data.learningObjectives,
      quiz_questions: parsedContent.data.quizQuestions,
      grounding: lessonPack.grounding,
      raw_content: {
        ...(typeof lessonPack.content === "object" && lessonPack.content ? lessonPack.content : {}),
        onboarding: input.onboarding ?? null,
      },
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select(
      "id, user_id, topic, goal, learner_level, search_type, status, summary, learning_objectives, quiz_questions, created_at, raw_content"
    )
    .single();

  if (sessionError || !sessionRow) {
    console.error("[SessionsService] [createLearningSession] Failed to insert session", { error: sessionError });
    throw new HttpError(500, "SESSION_CREATE_FAILED", sessionError?.message ?? "Unknown error");
  }

  console.log("[SessionsService] [createLearningSession] Created session row", { sessionId: sessionRow.id });

  const sourceRows = lessonPack.sourceResults.map((source) => ({
    session_id: sessionRow.id,
    title: source.title,
    url: source.url,
    highlights: source.highlights,
    created_at: nowIso,
  }));

  if (sourceRows.length > 0) {
    const { error: sourceError } = await supabase.from("session_sources").insert(sourceRows);
    if (sourceError) throw new HttpError(500, "SESSION_SOURCES_FAILED", sourceError.message);
  }

  try {
    const totalModules = parsedContent.data.lessonOutline.length;
    for (const [index, outlineModule] of parsedContent.data.lessonOutline.entries()) {
      onProgress?.({
        status: "generating_module",
        message: `Generating module ${index + 1} of ${totalModules}: ${outlineModule.title}`,
        step: index + 1,
        totalSteps: totalModules
      });

      const { data: moduleRow, error: moduleError } = await supabase
        .from("session_modules")
        .insert({
          session_id: sessionRow.id,
          position: index + 1,
          title: outlineModule.title,
          description: clampText(outlineModule.description, MODULE_DESCRIPTION_MAX),
          duration: moduleDurationDefault,
          completed: false,
          created_at: nowIso,
        })
        .select("id, title, description")
        .single();

      if (moduleError || !moduleRow) {
        throw new HttpError(500, "SESSION_MODULES_FAILED", moduleError?.message ?? "Unknown error");
      }

      const moduleContent = await generateModuleContent({
        topic: input.topic,
        goal: input.goal,
        learnerLevel: input.learnerLevel,
        moduleTitle: outlineModule.title,
        moduleDescription: outlineModule.description,
        sourceHighlights,
        learningObjectives: parsedContent.data.learningObjectives,
        onboarding: input.onboarding,
      });

      const lang = input.onboarding?.language
        ? onboardingLanguageToTts(input.onboarding.language)
        : "english";
      await persistModuleContent(moduleRow.id, moduleContent, nowIso, lang, (slideIndex, slideTitle) => {
        onProgress?.({
          status: "generating_slide",
          message: `Generating module ${index + 1} of ${totalModules}: ${outlineModule.title} (Slide ${slideIndex} of ${moduleContent.slides.length})`,
          step: index + 1,
          totalSteps: totalModules
        });
      });
      console.log("[SessionsService] [createLearningSession] Module processing complete", { moduleId: moduleRow.id });
    }

    onProgress?.({
      status: "finalizing",
      message: "Finalizing your classroom..."
    });

    await supabase
      .from("learning_sessions")
      .update({ status: "ready", updated_at: new Date().toISOString() })
      .eq("id", sessionRow.id);

    console.log("[SessionsService] [createLearningSession] Session marked as ready", { sessionId: sessionRow.id });
    sessionRow.status = "ready";
  } catch (error) {
    console.error("[SessionsService] [createLearningSession] Error processing modules", { sessionId: sessionRow.id, error });
    await supabase
      .from("learning_sessions")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", sessionRow.id);
    throw error;
  }

  return getFullCourseBySessionId(sessionRow.id);
}

export async function getFullCourseBySessionId(sessionIdValue: string) {
  const sessionId = sessionIdSchema.parse(sessionIdValue);
  const supabase = getSupabaseAdminClient();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("learning_sessions")
    .select(
      "id, user_id, topic, goal, learner_level, search_type, status, summary, learning_objectives, quiz_questions, created_at, raw_content"
    )
    .eq("id", sessionId)
    .single();

  if (sessionError || !sessionRow) {
    throw new HttpError(404, "SESSION_NOT_FOUND", "Learning session not found.");
  }

  const onboarding = parseOnboardingFromRaw(sessionRow.raw_content);

  const { data: modules, error: modulesError } = await supabase
    .from("session_modules")
    .select("id, position, title, description, duration, completed")
    .eq("session_id", sessionId)
    .order("position", { ascending: true });

  if (modulesError) {
    throw new HttpError(500, "SESSION_MODULES_READ_FAILED", modulesError.message);
  }

  const moduleIds = (modules ?? []).map((m) => m.id);

  let keyPoints: KeyPointRow[] = [];
  let slides: SlideRow[] = [];
  let slidePoints: SlidePointRow[] = [];

  if (moduleIds.length > 0) {
    const { data: keyPointRows, error: keyPointsError } = await supabase
      .from("session_module_key_points")
      .select("module_id, position, text")
      .in("module_id", moduleIds)
      .order("position", { ascending: true });

    if (keyPointsError) throw new HttpError(500, "KEY_POINTS_READ_FAILED", keyPointsError.message);
    keyPoints = keyPointRows ?? [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: slideRows, error: slidesError } = await (supabase
      .from("session_slides") as any)
      .select("id, module_id, position, title, explanation_text, audio_url, diagram_query, layout")
      .in("module_id", moduleIds)
      .order("position", { ascending: true });

    if (slidesError) throw new HttpError(500, "SLIDES_READ_FAILED", slidesError.message);
    slides = (slideRows ?? []) as SlideRow[];

    const slideIds = slides.map((s) => s.id);
    if (slideIds.length > 0) {
      const { data: pointRows, error: pointsError } = await supabase
        .from("session_slide_points")
        .select("slide_id, position, text")
        .in("slide_id", slideIds)
        .order("position", { ascending: true });

      if (pointsError) throw new HttpError(500, "SLIDE_POINTS_READ_FAILED", pointsError.message);
      slidePoints = pointRows ?? [];
    }
  }

  const { data: sources } = await supabase
    .from("session_sources")
    .select("title, url")
    .eq("session_id", sessionId);

  const sections = buildCourseSections(modules ?? [], keyPoints, slides, slidePoints);
  const completedCount = sections.filter((s) => s.completed).length;
  const progressPercent =
    sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;

  return {
    course: {
      id: sessionRow.id,
      userId: sessionRow.user_id,
      title: sessionRow.topic,
      goal: sessionRow.goal,
      summary: sessionRow.summary,
      learnerLevel: sessionRow.learner_level,
      status: sessionRow.status,
      learningObjectives: sessionRow.learning_objectives,
      quizQuestions: sessionRow.quiz_questions,
      progressPercent,
      createdAt: sessionRow.created_at,
      onboarding: onboarding ?? null,
    },
    sections,
    sources: sources ?? [],
  };
}

export async function updateModuleProgress(
  sessionIdValue: string,
  moduleIdValue: string,
  completed: boolean
) {
  const sessionId = sessionIdSchema.parse(sessionIdValue);
  const moduleId = z.coerce.number().int().positive().parse(moduleIdValue);
  const supabase = getSupabaseAdminClient();

  const { data: moduleRow, error } = await supabase
    .from("session_modules")
    .update({ completed })
    .eq("id", moduleId)
    .eq("session_id", sessionId)
    .select("id, session_id, completed")
    .single();

  if (error || !moduleRow) {
    throw new HttpError(404, "MODULE_NOT_FOUND", "Module not found for this course.");
  }

  const { data: modules } = await supabase
    .from("session_modules")
    .select("completed")
    .eq("session_id", sessionId);

  const total = modules?.length ?? 0;
  const done = modules?.filter((m) => m.completed).length ?? 0;
  const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    moduleId: String(moduleRow.id),
    sessionId: moduleRow.session_id,
    completed: moduleRow.completed,
    progressPercent,
  };
}

export async function listCoursesForUser(userIdValue: string) {
  const userId = z.string().uuid().parse(userIdValue);
  const supabase = getSupabaseAdminClient();

  const { data: sessions, error } = await supabase
    .from("learning_sessions")
    .select("id, topic, goal, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new HttpError(500, "COURSES_LIST_FAILED", error.message);
  }

  const courses = await Promise.all(
    (sessions ?? []).map(async (session) => {
      const { data: modules } = await supabase
        .from("session_modules")
        .select("completed")
        .eq("session_id", session.id);

      const total = modules?.length ?? 0;
      const done = modules?.filter((m) => m.completed).length ?? 0;
      const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        id: session.id,
        title: session.topic,
        goal: session.goal,
        status: session.status,
        progressPercent,
        moduleCount: total,
        createdAt: session.created_at,
      };
    })
  );

  return { courses };
}

export async function deleteLearningSession(sessionIdValue: string, userIdValue: string) {
  const sessionId = sessionIdSchema.parse(sessionIdValue);
  const userId = z.string().uuid().parse(userIdValue);
  const supabase = getSupabaseAdminClient();

  const { data: session, error: fetchError } = await supabase
    .from("learning_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (fetchError) {
    throw new HttpError(500, "SESSION_READ_FAILED", fetchError.message);
  }

  if (!session) {
    throw new HttpError(404, "SESSION_NOT_FOUND", "Course not found.");
  }

  if (session.user_id !== userId) {
    throw new HttpError(403, "FORBIDDEN", "You can only delete your own courses.");
  }

  const { error: deleteError } = await supabase
    .from("learning_sessions")
    .delete()
    .eq("id", sessionId);

  if (deleteError) {
    throw new HttpError(500, "SESSION_DELETE_FAILED", deleteError.message);
  }

  return { deleted: true, sessionId };
}
