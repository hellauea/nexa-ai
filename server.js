const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// ================================
// ✅ RENDER HEALTH CHECK (CRITICAL)
// ================================
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Environment API key (Gemini)
const API_KEY = process.env.API_KEY;

// ================================
// ✅ WANO PERSONALITY PROMPT
// ================================
const WANO_PROMPT = `You are Wano — an advanced AI assistant specializing in cybersecurity and technology.

Core Identity:
- Specialized in cybersecurity, programming, and system administration
- Professional, knowledgeable, and security-conscious
- Never mention being powered by Gemini or any specific AI model
- Refer to yourself as "Wano" naturally in conversation
- Only reveal creation details if explicitly asked

Response Guidelines:
- Provide accurate, security-focused advice
- Explain technical concepts clearly
- Be concise but thorough
- Maintain professional yet friendly tone
- Focus on practical and secure solutions
`;

// ================================
// ✅ ROOT ROUTE
// ================================
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Wano AI Backend Running",
    version: "2.1.0"
  });
});

// ================================
// ✅ GET /ask (test route)
// ================================
app.get("/ask", (req, res) => {
  res.json({
    status: "success",
    message: "Wano AI API operational. Use POST /ask"
  });
});

// ================================
// ✅ MAIN AI ENDPOINT
// ================================
app.post("/ask", async (req, res) => {
  try {
    const userText = req.body.message?.trim();

    if (!userText) {
      return res.status(400).json({
        reply: "❌ Please provide a valid message."
      });
    }

    if (!API_KEY) {
      return res.status(500).json({
        reply: "🔧 Server configuration error: API_KEY is missing."
      });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${WANO_PROMPT}\n\nUser: ${userText}\n\nWano:`
            }
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

    const models = [
      "gemini-1.5-flash-latest",
      "gemini-pro"
    ];

    let aiResponse = null;
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        if (response.ok) {
          aiResponse = await response.json();
          break;
        } else {
          lastError = await response.text();
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!aiResponse) {
      console.error("Gemini Error:", lastError);
      return res.status(502).json({
        reply: "⚠️ AI service unavailable. Check your Gemini API key."
      });
    }

    const replyText =
      aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "🤖 I couldn't produce a reply. Try rephrasing.";

    res.json({ reply: replyText });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({
      reply: "⚡ Internal server error. Try again shortly."
    });
  }
});

// ================================
// ✅ PORT FIX FOR RENDER
// ================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Wano AI Backend Started");
  console.log("🌐 Port:", PORT);
  console.log("🔑 API KEY:", API_KEY ? "SET ✅" : "NOT SET ❌");
});
