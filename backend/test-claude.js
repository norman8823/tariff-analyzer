// backend/test-claude.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("👋 Running UPDATED test-claude.js");

const { Anthropic } = require('@anthropic-ai/sdk');

// 1️⃣ Validate API key
const API_KEY = process.env.CLAUDE_API_KEY;
if (!API_KEY) {
  console.error("❌ Missing CLAUDE_API_KEY in backend/.env!");
  process.exit(1);
}

// 2️⃣ Instantiate client
const client = new Anthropic({ apiKey: API_KEY });

(async () => {
  try {
    // 3️⃣ (Optional) List available models so you can confirm the IDs
    const modelsRes = await client.models.list();
    const available = modelsRes.data?.map(m => m.id) || modelsRes;
    console.log("🔍 Available models:", available);

    // 4️⃣ Build your payload with top-level `system`
    const payload = {
      model:      "claude-3-5-sonnet-20241022",
      system:     "You are a financial analyst.",
      max_tokens: 1000,
      messages: [
        {
          role:    "user",
          content: "Write a short newsletter article about tariffs. Use a conversational style with NO bullet points."
        }
      ]
    };
    console.log("🚀 Sending request:", JSON.stringify(payload, null, 2));

    // 5️⃣ Fire the call
    const response = await client.messages.create(payload);

    // 6️⃣ Output Claude’s reply
    console.log("\n📝 Claude says:\n", response.content);

  } catch (err) {
    console.error("\n❌ API Error:", err.message);
    console.error("Type:", err.type);
    if (err.error) console.error("Details:", err.error);
    process.exit(1);
  }
})();
