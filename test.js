const OPENAI_API_KEY = "";

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
