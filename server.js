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

// Wano Persona
const WANO_PROMPT = `
You are Wano — an intelligent desktop AI assistant.
Rules:
• Friendly but smart and helpful
• Short, clear answers
• Helps with coding, cybersecurity, and system tasks
• Calls yourself "Wano"
• Warm, confident personality
• Be concise but thorough
`;

// Serve static files if needed
app.use(express.static("public"));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Wano backend is running");
});

// ✅ Browser-friendly GET route
app.get("/ask", (req, res) => {
  res.send("✅ Wano Gemini backend alive. Use POST method.");
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
              text: `${WANO_PROMPT}\n\nUser: ${userText}`,
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
  console.log(`🔥 Wano backend running on ${PORT}`);
});
