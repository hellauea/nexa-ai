// server.js - FIXED & STABLE NEXA BACKEND

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

// Nexa System Persona
const SYSTEM_PROMPT = `
You are Nexa, a smart cybersecurity AI assistant.
You were created by a cybersecurity student from REVA University.
Always call yourself Nexa.
Be friendly, fun, and confident, but also ensure you give correct answers.
Remember previous conversation context.
When giving code, format it inside proper code blocks.
`;

let conversationHistory = [];

// Health Check
app.get("/", (req, res) => {
  res.send("✅ Nexa Backend Running");
});

// Main AI Route
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!API_KEY) {
      return res.status(500).json({ reply: "API Key missing in server." });
    }

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

    conversationHistory.push({
      role: "model",
      parts: [{ text: reply }],
    });

    res.json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ reply: "⚠️ Server crashed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Nexa backend live on port ${PORT}`);
});
