const OPENAI_API_KEY =
  "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";

async function testOpenAIKey() {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: "Say hello",
      }),
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log(data);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

testOpenAIKey();
