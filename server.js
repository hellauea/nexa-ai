import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Wano AI Backend Running",
    version: "2.1.0"
  });
});

// Main chat endpoint
app.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ reply: "Gemini API Key not found." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Gemini returned empty response.";

    res.json({ reply });

  } catch (err) {
    console.error("❌ Gemini Crash:", err);
    res.status(500).json({ reply: "Backend crashed. Check logs." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Wano AI running on port ${PORT}`);
});
