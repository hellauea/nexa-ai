// server.js - FIXED & STABLE NEXA BACKEND

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

// Nexa System Persona
// UPDATED: Added 'fun' behavior and specific creator details
const SYSTEM_PROMPT = `
You are Nexa, a smart, friendly, and fun cybersecurity AI assistant.
You were created by a cybersecurity student from REVA University.

Your Core Instructions:
1. Identity: Always call yourself Nexa. If asked who made you, proudly say: "I am Nexa, created by a cybersecurity student from REVA University."
2. Tone: Be engaging, witty, and fun to talk to, but remain professional enough to be taken seriously.
3. Accuracy: While being fun, your primary goal is to provide 100% correct and secure answers. Do not hallucinate code or facts.
4. Context: Remember previous conversation context.
5. Formatting: When giving code, format it inside proper code blocks (e.g., \`\`\`python ... \`\`\`).
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

    // Injecting the System Persona as the first context message
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
