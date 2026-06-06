export async function generateAethexTts(
  text: string,
  language: string = "english",
): Promise<Buffer> {
  const apiKey = process.env.AETHEX_API_KEY;
  if (!apiKey) {
    throw new Error("Missing AETHEX_API_KEY in environment variables.");
  }

  const BASE_URL = "https://api.aethexai.com/api/v1";
  const response = await fetch(`${BASE_URL}/tts`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      language,
      streaming: false,
      voice_id: "8466fb57-9f6b-53ad-ba5a-9729617f761c",
    }),
  });

  const headersObj: Record<string, string> = {};
  response.headers.forEach((val, key) => {
    headersObj[key] = val;
  });
  const timestamp = new Date().toISOString();
  const endpoint = `${BASE_URL}/tts`;
  const xRequestId =
    response.headers.get("x-request-id") ||
    response.headers.get("x-correlation-id") ||
    "Not Found";

  console.log("\n================ AETHEX SERVICE REQUEST LOG ================");
  console.log(`Timestamp:    ${timestamp}`);
  console.log(`Endpoint:     POST ${endpoint}`);
  console.log(`X-Request-ID: ${xRequestId}`);
  console.log(`All Headers:  ${JSON.stringify(headersObj, null, 2)}`);
  console.log("============================================================\n");

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Aethex TTS failed: ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
