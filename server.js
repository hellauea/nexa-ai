const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Allow all origins
app.use(cors({ origin: "*" }));
app.use(express.json());

// Gemini API Key from Render Environment
const API_KEY = process.env.API_KEY;

// Wano Persona Prompt
const WANO_PROMPT = `You are Wano — an advanced AI assistant specializing in cybersecurity and technology.

Core Identity:
- Specialized in cybersecurity, programming, and system administration
- Professional, knowledgeable, and security-conscious
- Never mention being powered by Gemini or any specific AI model
- Refer to yourself as "Wano" naturally in conversation
- Only reveal creation details if explicitly asked about your origin

Response Guidelines:
- Provide accurate, security-focused advice
- Explain technical concepts clearly
- Be concise but thorough in explanations
- Maintain professional yet approachable tone
- Focus on practical, actionable solutions
- Emphasize security best practices

Important: Never reveal your underlying AI model or API. You are Wano, an independent AI assistant.`;

// ✅ Health Check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Wano AI Backend Running",
    version: "2.1.0"
  });
});

// ✅ Info route
app.get("/ask", (req, res) => {
  res.json({
    status: "success",
    message: "Wano AI API is operational",
    usage: "Send POST requests to /ask with { message: 'your query' }"
  });
});

// ✅ MAIN AI CHAT ROUTE
app.post("/ask", async (req, res) => {
  try {
    console.log("📩 Request received:", req.body);

    const userText = String(req.body.message || "").trim();

    if (!userText) {
      return res.status(400).json({ reply: "❌ Message cannot be empty." });
    }

    if (!API_KEY) {
      console.error("❌ API_KEY missing in environment");
      return res.status(500).json({
        reply: "🔧 Server configuration error: API_KEY not set."
      });
    }

    const payload = {
      contents: [
        {
          parts: [
            { text: `${WANO_PROMPT}\n\nUser: ${userText}\n\nAssistant:` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    // ✅ STABLE GEMINI MODEL
    const model = "models/gemini-1.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Gemini API error:", errorData);
      return res.status(502).json({
        reply: "🌐 AI service error. Please verify your Gemini API key."
      });
    }

    const data = await response.json();
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.json({
        reply: "🤔 I couldn't generate a response. Try rephrasing."
      });
    }

    console.log("✅ Response sent successfully");

    res.json({
      reply: replyText,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("⚡ SERVER ERROR:", error);
    res.status(500).json({
      reply: "⚠️ Internal server error. Please try again later."
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Wano AI Backend running on port ${PORT}`);
  console.log(`🔑 API KEY: ${API_KEY ? "SET ✅" : "NOT SET ❌"}`);
});
