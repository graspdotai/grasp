import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { onboardingProfileSchema } from "@/lib/onboarding";
import { handleRouteError } from "@/server/apiResponse";
import { upsertProfileFromOnboarding } from "@/server/profilesService";

const bodySchema = z.object({
  userId: z.string().uuid(),
  onboarding: onboardingProfileSchema,
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());
    await upsertProfileFromOnboarding(body.userId, body.onboarding, body.email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
