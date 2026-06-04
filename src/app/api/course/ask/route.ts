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

    const systemPrompt = `You are Professor Aethex, a friendly course tutor. The student is in a live lesson and asked a question.

Current lesson: ${context.sectionTitle}
Topic beat: ${context.slideTitle}
Key ideas:
${context.slidePoints.map((p: string) => `- ${p}`).join("\n")}
What you were teaching: ${context.slideExplanation}

Instructions:
- Answer like a teacher speaking to one student — natural, warm, direct
- 2–5 sentences unless the question needs more depth
- Stay grounded in the current lesson material
- Never say "this slide" or "the slide" — say "this idea", "what we're covering", "this part of the lesson"
- No markdown`;

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
