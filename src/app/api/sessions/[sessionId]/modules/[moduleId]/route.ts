import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/server/apiResponse";
import { updateModuleProgress } from "@/server/sessionsService";

const bodySchema = z.object({
  completed: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string; moduleId: string }> }
) {
  try {
    const { sessionId, moduleId } = await context.params;
    const body = bodySchema.parse(await req.json());
    const data = await updateModuleProgress(sessionId, moduleId, body.completed);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
