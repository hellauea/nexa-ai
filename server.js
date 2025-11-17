import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// Your API key
const API_KEY = process.env.API_KEY;

// Nexa Personality Prompt
const NEXA_PROMPT = `
You are Nexa — an intelligent desktop AI assistant created by a cybersecurity student from REVA University.
...
`;

app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: NEXA_PROMPT }] },
            { role: "user", parts: [{ text: userMessage }] },
          ],
        }),
      }
    );

    const data = await result.json();

    if (data.error) {
      return res.json({ reply: "⚠️ Gemini API Error: " + data.error.message });
    }

    res.json({
      reply:
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No response from Gemini.",
    });
  } catch (err) {
    res.json({ reply: "⚠️ Server Error." });
  }
});

// ✅ HEALTH CHECK (required for Render)
// Health check route
app.get("/", (req, res) => {
  res.send("Nexa backend is running");
});

// Start server
app.listen(port, () => {
  console.log(`🔥 Nexa backend running at http://localhost:${port}`);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Nexa (Gemini AI) running on port ${PORT}`);
});
