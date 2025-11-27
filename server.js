const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Wano AI Backend Running",
    version: "2.1.0"
  });
});

// --- CHAT ENDPOINT USING GEMINI ---
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "No message received." });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        reply: "Gemini API key missing in environment variables."
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Gemini.";

    res.json({ reply });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      reply: "Server error while contacting Gemini API."
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Wano Gemini backend running on port ${PORT}`);
});
