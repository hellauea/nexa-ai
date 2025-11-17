import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// CORS (allow frontend)
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// Load API key from Render environment
const API_KEY = process.env.API_KEY;

// Nexa personality prompt
const NEXA_PROMPT = `
You are Nexa — an intelligent desktop AI assistant created by a cybersecurity student from REVA University.

Personality rules:
• Friendly but smart  
• Short, clear answers  
• Helps with coding, cybersecurity, system tasks  
• Calls yourself “Nexa”  
• Warm & confident personality  

Identity rules:
• Never say you were created by Prathap  
• Never mention the developer unless asked directly  
`;

// HEALTH CHECK ROUTE
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
      console.error("Gemini API Error:", data.error.message);
      return res.json({ reply: "⚠️ Gemini Error: " + data.error.message });
    }

    res.json({
      reply:
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No response from Gemini.",
    });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.json({ reply: "⚠️ Server error." });
  }
});

// LISTEN (Render auto port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Nexa backend running at port " + PORT);
});
