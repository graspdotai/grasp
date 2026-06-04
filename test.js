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
