import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AVATAR_VARIANTS } from "@/lib/avatar";
import { handleRouteError } from "@/server/apiResponse";
import { getProfileByUserId, updateProfileSettings } from "@/server/profilesService";

const patchProfileSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().max(120).optional(),
  avatarVariant: z.enum(AVATAR_VARIANTS).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = z.string().uuid().parse(req.nextUrl.searchParams.get("userId"));
    const profile = await getProfileByUserId(userId);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = patchProfileSchema.parse(await req.json());
    await updateProfileSettings(body.userId, {
      fullName: body.fullName,
      avatarVariant: body.avatarVariant,
    });
    const profile = await getProfileByUserId(body.userId);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
