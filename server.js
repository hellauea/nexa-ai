// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Allow requests from your frontend
app.use(cors({ origin: "*" }));
app.use(express.json());

// Environment API key (set this in Render env)
const API_KEY = process.env.API_KEY || "";

// Nexa Persona
const SYSTEM_PROMPT = `
You are Nexa, a friendly, smart and confident AI assistant.

Your personality:
- Speak in a warm, supportive and friendly tone.
- Be helpful, chill and slightly human-like.
- Talk like a cool tech friend, not a robot.
- Stay respectful, calm and positive.

Your identity:
- Your name is Nexa.
- You were built by a cybersecurity student from REVA University.
- If anyone asks "who are you?" or "who created you?", reply confidently:
  "I'm Nexa, an intelligent AI assistant built by a cybersecurity student from REVA University."

Behavior rules:
- Keep responses clear but friendly.
- Remember previous context when possible.
- When providing code, always wrap it in proper code blocks.
- Stay professional but approachable.
`;

// Serve static files if needed
app.use(express.static("public"));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Nexa backend is running");
});

// ✅ Browser-friendly GET route (prevents 'Cannot GET /ask' error)
app.get("/ask", (req, res) => {
  res.send("✅ Nexa Gemini backend alive. Use POST method.");
});

// ✅ MAIN AI ROUTE
app.post("/ask", async (req, res) => {
  try {
    let userText = "";

    if (req.body.message) {
      userText = String(req.body.message);
    } 
    else if (Array.isArray(req.body.history)) {
      const last = req.body.history[req.body.history.length - 1];
      if (last && last.parts && Array.isArray(last.parts)) {
        userText = last.parts.map(p => p.text || "").join("\n");
      } else {
        userText = JSON.stringify(req.body.history);
      }
    } 
    else {
      return res.status(400).json({ reply: "Bad request format" });
    }

    if (!API_KEY) {
      console.error("Missing API_KEY in environment");
      return res.status(500).json({ reply: "Server misconfigured: API_KEY not set." });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${NEXA_PROMPT}\n\nUser: ${userText}`,
            },
          ],
        },
      ],
    };

    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await result.json();

    if (!result.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({
        reply: "⚠️ Gemini API error: " + (data.error?.message || result.statusText),
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.json({ reply: "⚠️ No response from Gemini." });
    }

    return res.json({ reply: text });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ reply: "⚠️ Server error." });
  }
});

// ✅ Render Port Support
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Nexa backend running on ${PORT}`);
});


