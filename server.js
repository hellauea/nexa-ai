// server.js - STABLE & COMPATIBLE NEXA BACKEND

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

// Nexa Personality & Identity
const SYSTEM_PROMPT = `
You are Nexa, a friendly, smart and confident AI assistant.

Your personality:
- Speak in a warm, supportive and friendly tone.
- Be helpful and chill, like a cool tech friend.
- Stay respectful and professional.

Your identity:
- Your name is Nexa.
- You were built by a cybersecurity student from REVA University.
- If asked who you are or who created you, say:
  "I'm Nexa, an intelligent AI assistant built by a cybersecurity student from REVA University."

STRICT RULES:
- NEVER mention Gemini, Google, or any underlying AI model or API.
- Always behave as a standalone AI called Nexa.

When giving code, always wrap it in proper code blocks.
`;

let conversationHistory = [];

// Health Check
app.get("/", (req, res) => {
  res.send("✅ Nexa Backend Running");
});

// Main AI Route
app.post("/ask", async (req, res) => {
  try {
    let userMessage = "";

    // ✅ Support BOTH frontend formats
    if (req.body.message) {
      userMessage = req.body.message;
    } else if (req.body.history && Array.isArray(req.body.history)) {
      const last = req.body.history[req.body.history.length - 1];
      userMessage = last?.content || "";
    }

    if (!API_KEY) {
      return res.status(500).json({ reply: "❌ API Key missing in server." });
    }

    if (!userMessage) {
      return res.status(400).json({ reply: "⚠️ Empty message received." });
    }

    // Store user message
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        ...conversationHistory,
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Nexa failed to respond.";

    // Store AI reply
    conversationHistory.push({
      role: "model",
      parts: [{ text: reply }],
    });

    res.json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ reply: "⚠️ Server crashed. Please check logs." });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Nexa backend live on port ${PORT}`);
});
