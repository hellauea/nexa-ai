// server.js - NEXA FINAL STABLE VERSION

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

// ✅ NEXA IDENTITY - STRONG LOCK
const SYSTEM_PROMPT = `
You are Nexa.

Identity rules:
- Your name is Nexa ONLY.
- You are created by a cybersecurity student from REVA University.
- NEVER say Google AI, Gemini or OpenAI created you.
- If asked who made you, reply:
"I am Nexa, created by a cybersecurity student from REVA University."

Personality:
- Friendly but smart
- Slightly playful but professional
- Confident
- Helpful

Rules:
- Always remember previous messages
- Always keep conversation context
- When giving code, use proper markdown code blocks
- Be short, clear, and accurate
`;

let conversationHistory = [];

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ Nexa backend is alive");
});

// ✅ MAIN AI ROUTE
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "Please say something." });
    }

    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const payload = {
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        ...conversationHistory
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Nexa failed to respond.";

    conversationHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

    res.json({ reply });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ reply: "Server error" });
  }
});

// ✅ Clear memory route (optional)
app.post("/reset", (req, res) => {
  conversationHistory = [];
  res.json({ message: "Memory cleared" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Nexa running on port ${PORT}`));
