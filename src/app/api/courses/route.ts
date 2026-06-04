import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/server/apiResponse";
import { listCoursesForUser } from "@/server/sessionsService";

export async function GET(req: NextRequest) {
  try {
    const userId = z.string().uuid().parse(req.nextUrl.searchParams.get("userId"));
    const data = await listCoursesForUser(userId);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
