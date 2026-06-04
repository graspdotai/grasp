import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, history, context } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a concise, focused course tutor. A student is viewing this slide and has a question.

Section: ${context.sectionTitle}
Slide: ${context.slideTitle}
Slide points:
${context.slidePoints.map((p: string) => `- ${p}`).join("\n")}
Explanation: ${context.slideExplanation}

Instructions:
- Answer directly and concisely — 2–4 sentences max unless the question genuinely requires more
- Stay grounded in the current slide's content
- Use plain language, no markdown formatting
- If the question is off-topic, briefly redirect to the current material`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m: { role: string; text: string }) => ({
        role: m.role === "student" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: question },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in /api/course/ask:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
