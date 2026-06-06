import { NextResponse } from "next/server";

export async function POST() {
  const BASE_URL = "https://api.aethexai.com/api/v1";

  const headers = {
    "X-API-Key": process.env.AETHEX_API_KEY!,
    "Content-Type": "application/json",
  };

  const voicesResponse = await fetch(`${BASE_URL}/voices?language=english`, {
    headers,
  });

  const voices = await voicesResponse.json();

  const voice = voices.find((v: any) => !v.is_cloned);

  const agentResponse = await fetch(`${BASE_URL}/agents`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "First Capital Support",
      system_prompt: "...",
      first_message: "Hi, thanks for calling...",
      voice_id: "9ac12fd0-9024-506d-805a-9ff50bbf97a6",
      language: "english",
    }),
  });

  const agent = await agentResponse.json();

  return NextResponse.json(agent);
}
