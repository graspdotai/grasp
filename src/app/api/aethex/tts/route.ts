import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      language = "english",
      voice_id = "52f5a931-0eac-5a77-94e7-aa3053e99739",
      streaming = false,
    } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const BASE_URL = "https://api.aethexai.com/api/v1";
    const headers = {
      "X-API-Key": process.env.AETHEX_API_KEY!,
      "Content-Type": "application/json",
    };

    const aethexResponse = await fetch(`${BASE_URL}/tts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text,
        language,
        streaming,
        voice_id: "52f5a931-0eac-5a77-94e7-aa3053e99739",
      }),
    });

    const headersObj: Record<string, string> = {};
    aethexResponse.headers.forEach((val, key) => {
      headersObj[key] = val;
    });
    const timestamp = new Date().toISOString();
    const endpoint = `${BASE_URL}/tts`;
    const xRequestId =
      aethexResponse.headers.get("x-request-id") ||
      aethexResponse.headers.get("x-correlation-id") ||
      "Not Found";

    console.log("\n================ AETHEX REQUEST LOG ================");
    console.log(`Timestamp:    ${timestamp}`);
    console.log(`Endpoint:     POST ${endpoint}`);
    console.log(`X-Request-ID: ${xRequestId}`);
    console.log(`All Headers:  ${JSON.stringify(headersObj, null, 2)}`);
    console.log("====================================================\n");

    if (!aethexResponse.ok) {
      const errorText = await aethexResponse.text();
      return NextResponse.json(
        { error: errorText || "Aethex TTS API error" },
        { status: aethexResponse.status },
      );
    }

    // Forward the binary audio stream or WAV file directly
    const contentType =
      aethexResponse.headers.get("Content-Type") || "audio/wav";
    const sampleRate = aethexResponse.headers.get("X-Sample-Rate") || "24000";
    const encoding = aethexResponse.headers.get("X-Encoding");

    const responseHeaders = new Headers({
      "Content-Type": contentType,
      "X-Sample-Rate": sampleRate,
    });

    if (encoding) {
      responseHeaders.set("X-Encoding", encoding);
    }

    return new Response(aethexResponse.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
