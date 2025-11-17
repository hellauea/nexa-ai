const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const API_KEY = process.env.API_KEY;

const NEXA_PROMPT = `
You are Nexa — an intelligent desktop AI assistant.

Rules:
• Friendly but smart
• Short, clear answers
• Helps with coding, cybersecurity, and system tasks
• Calls yourself “Nexa”
• Warm, confident personality
`;

// HEALTH ROUTE
app.get("/", (req, res) => {
  res.send("Nexa backend is running");
});

// MAIN AI ROUTE
app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${NEXA_PROMPT}\n\nUser: ${userMessage}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await result.json();

    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.json({ reply: "⚠️ Gemini Error: " + data.error.message });
    }

    res.json({
      reply:
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No response from Gemini",
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.json({ reply: "⚠️ Server error occurred" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Nexa backend running on ${PORT}`));
