import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/server/apiResponse";
import { getProfileByUserId } from "@/server/profilesService";

export async function GET(req: NextRequest) {
  try {
    const userId = z.string().uuid().parse(req.nextUrl.searchParams.get("userId"));
    const profile = await getProfileByUserId(userId);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
