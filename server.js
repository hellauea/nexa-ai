// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Allow requests from your frontend (open for now)
app.use(cors({ origin: "*" }));
app.use(express.json());

// Environment API key (set this in Render env)
const API_KEY = process.env.API_KEY || "";

// Simple Nexa prompt / persona
const NEXA_PROMPT = `
You are Nexa — an intelligent desktop AI assistant.
Rules:
• Friendly but smart
• Short, clear answers
• Helps with coding, cybersecurity, and system tasks
• Calls yourself “Nexa”
• Warm, confident personality
`;

// Serve static files if any. If your index.html is in the repo root, Express will still respond to '/' below.
// If you put frontend files in a folder named "public", this will serve them.
app.use(express.static("public"));

// HEALTH ROUTE (Render checks / by default)
app.get("/", (req, res) => {
  // If a static index.html exists in /public or repo root, express.static will serve it before this handler in many setups.
  // Return a friendly text response so Render health checks don't fail.
  res.send("Nexa backend is running");
});

// MAIN AI ROUTE
app.post("/ask", async (req, res) => {
  try {
    // Support either { message: "..." } or { history: [...] }
    let userText = "";
    if (req.body.message) {
      userText = String(req.body.message);
    } else if (Array.isArray(req.body.history)) {
      // join parts into a single text (safe fallback)
      const last = req.body.history[req.body.history.length - 1];
      if (last && last.parts && Array.isArray(last.parts)) {
        userText = last.parts.map(p => p.text || "").join("\n");
      } else {
        userText = JSON.stringify(req.body.history);
      }
    } else {
      return res.status(400).json({ reply: "Bad request: send { message: '...' } or { history: [...] }" });
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
      console.error("Gemini API returned non-OK:", data);
      return res.status(502).json({ reply: "⚠️ Gemini API error: " + (data.error?.message || result.statusText) });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.warn("Gemini returned no text:", data);
      return res.json({ reply: "⚠️ No response from Gemini." });
    }

    return res.json({ reply: text });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ reply: "⚠️ Server error." });
  }
});

// Use Render's port or default 3000
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Nexa backend running on ${PORT}`);
});
