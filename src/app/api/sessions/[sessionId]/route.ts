import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/server/apiResponse";
import { getSessionUserId } from "@/server/authSession";
import { deleteLearningSession } from "@/server/sessionsService";

const bodySchema = z.object({
  userId: z.string().uuid().optional(),
});

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    const sessionUserId = await getSessionUserId();

    let body: z.infer<typeof bodySchema> = {};
    const rawBody = await req.text();
    if (rawBody) {
      body = bodySchema.parse(JSON.parse(rawBody));
    } else {
      const fromQuery = req.nextUrl.searchParams.get("userId");
      if (fromQuery) body = { userId: fromQuery };
    }

    const userId = sessionUserId ?? body.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to delete this course.", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    if (sessionUserId && body.userId && sessionUserId !== body.userId) {
      return NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    const result = await deleteLearningSession(sessionId, userId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
