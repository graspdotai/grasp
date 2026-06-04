import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/server/apiResponse";
import { requireSessionUserId } from "@/server/authSession";
import { deleteUserAccount } from "@/server/profilesService";

const bodySchema = z.object({
  confirm: z.literal("DELETE"),
});

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireSessionUserId();
    const body = bodySchema.parse(await req.json());

    if (body.confirm !== "DELETE") {
      return NextResponse.json(
        { error: "Confirmation required", code: "CONFIRMATION_REQUIRED" },
        { status: 400 },
      );
    }

    await deleteUserAccount(userId);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
