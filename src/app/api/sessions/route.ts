import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/apiResponse";
import { createLearningSession } from "@/server/sessionsService";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createLearningSession(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
