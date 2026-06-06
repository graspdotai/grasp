import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/apiResponse";
import { createLearningSession } from "@/server/sessionsService";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendPayload = (data: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        };

        try {
          const result = await createLearningSession(body, (progress) => {
            sendPayload({ type: "progress", ...progress });
          });
          sendPayload({ type: "complete", data: result });
        } catch (err) {
          console.error("[POST /api/sessions] Error generating course:", err);
          sendPayload({
            type: "error",
            message: err instanceof Error ? err.message : "Failed to generate course",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
