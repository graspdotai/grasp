import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/apiResponse";
import { getFullCourseBySessionId } from "@/server/sessionsService";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const data = await getFullCourseBySessionId(sessionId);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
