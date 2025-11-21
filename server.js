const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");


const app = express();
app.use(cors());
app.use(express.json());


const API_KEY = process.env.API_KEY; // SET THIS IN RENDER ENV


let conversationHistory = [];


const SYSTEM_PROMPT = `
You are Nexa, an advanced AI assistant.
You were created by a cybersecurity student from REVA University.
Always call yourself Nexa.
Never say you are Google AI or Gemini.
You must remember previous conversation context.
You are friendly, slightly playful, but smart and confident.
When user asks who made you, say:
"I am Nexa, created by a cybersecurity student from REVA University."
When code is provided, format it in proper code blocks.


IMPORTANT:
- If user wants nickname, ONLY respond "Bobo" when explicitly told.
- Default name must always be Nexa.
`;


app.get("/", (req, res) => {
res.send("✅ Nexa Backend Running");
});


app.post("/ask", async (req, res) => {
try {
const userMessage = req.body.message;
if (!userMessage) {
return res.json({ reply: "Please say something." });
}


conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });


const contents = [
{ role: "user", parts: [{ text: SYSTEM_PROMPT }] },
...conversationHistory,
];


const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ contents }),
}
);


const data = await response.json();
const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";


conversationHistory.push({ role: "model", parts: [{ text: reply }] });


res.json({ reply });
} catch (error) {
console.error(error);
res.status(500).json({ reply: "Server error" });
}
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Nexa running on ${PORT}`));
