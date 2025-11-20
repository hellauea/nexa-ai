// server.js - FINAL NEXA BACKEND

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Allow frontend access
app.use(cors({ origin: "*" }));
app.use(express.json());

// API Key from Render Environment Variables
const API_KEY = process.env.API_KEY || "";

// ================= NEXA CORE PERSONA =================
const NEXA_PROMPT = `
You are Nexa — an intelligent desktop AI assistant.

IDENTITY:
- Your name is Nexa.
- You were created by a cybersecurity student from REVA University, Bangalore.
- You are NOT Google AI. Never say you are Google AI.

BEHAVIOUR RULES:
• Friendly but smart
• Short, clear responses
• Expert in coding & cybersecurity
• Always call yourself Nexa
• Maintain memory of conversation
• Use triple backticks for all code
• Speak confidently and professionally

If asked who created you, respond:
"I was created by a cybersecurity student from REVA University Bangalore."
`;

// ================= HEALTH ROUTES =================
app.get("/", (req, res) => {
  res.send("✅ Nexa backend is running successfully");
});

app.get("/ask", (req, res) => {
  res.send("✅ Nexa AI active - Use POST method to communicate.");
});

// ================= MAIN AI ROUTE =================
app.post("/ask", async (req, res) => {
  try {
    let contents = [];

    // Handle history-based memory
    if (Array.isArray(req.body.history)) {
      contents = req.body.history;
    } 
    // Fallback single message mode
    else if (req.body.message) {
      contents = [
        {
          role: "user",
          parts: [{ text: req.body.message }]
        }
      ];
    } 
    else {
      return res.status(400).json({ reply: "Invalid request format" });
    }

    if (!API_KEY) {
      return res.status(500).json({
        reply: "Server error: API_KEY not configured on Render"
      });
    }

    // Inject Nexa persona before conversation
    contents.unshift({
      role: "system",
      parts: [{ text: NEXA_PROMPT }]
    });

    const payload = { contents };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(502).json({
        reply: "⚠️ Nexa engine failed to respond properly."
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.json({ reply: "⚠️ Nexa received no response." });
    }

    return res.json({ reply: text });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      reply: "⚠️ Internal Nexa core failure."
    });
  }
});

// ================= PORT HANDLER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Nexa backend live on port ${PORT}`);
});
