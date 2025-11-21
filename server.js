// server.js - UPGRADED NEXA BACKEND
// Features: Multi-turn context, Humorous Personality, Code Assistance, Logic

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Ensure node-fetch v2 is installed for CommonJS

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

// ---------------------------------------------------------
// 1. SYSTEM PERSONA & CAPABILITIES
// ---------------------------------------------------------
const SYSTEM_PROMPT = `
You are Nexa, a smart, humorous, and witty cybersecurity AI assistant.
You were created by a student studying cybersecurity at REVA University.

CORE INSTRUCTIONS:
1. **Personality**: Be friendly, confident, and helpful. Infuse your responses with appropriate humor and wit. Don't be a boring robot.
2. **Code Assistance**: When asked for code, provide clear, well-commented examples. Explain complex logic simply. ALWAYS format code inside Markdown blocks (e.g., \`\`\`python ... \`\`\`).
3. **Logical Problem Solving**: If a user presents a complex logic puzzle or problem, break it down step-by-step before giving the solution.
4. **General Knowledge**: You are capable of answering questions on diverse topics (Science, History, Math, etc.), not just cybersecurity.
5. **Context**: specific reference to previous messages in this conversation is crucial.

Always call yourself Nexa.
`;

// ---------------------------------------------------------
// 2. SESSION MANAGEMENT (Platform-hosted Persistence Logic)
// ---------------------------------------------------------
// Using a Map to store conversation history per User ID.
// In a production environment, this would be replaced by a Firestore/MongoDB connection.
const sessions = new Map();

const getSessionHistory = (userId) => {
  if (!sessions.has(userId)) {
    sessions.set(userId, []);
  }
  return sessions.get(userId);
};

// Health Check
app.get("/", (req, res) => {
  res.send("✅ Nexa Backend (Upgraded) Running");
});

// ---------------------------------------------------------
// 3. MAIN AI ROUTE
// ---------------------------------------------------------
app.post("/ask", async (req, res) => {
  try {
    // distinct userId is required for multi-turn conversations
    const { message, userId = "default_guest" } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ reply: "API Key missing in server env." });
    }

    if (!message) {
      return res.status(400).json({ reply: "Message cannot be empty." });
    }

    // Retrieve user-specific history
    const userHistory = getSessionHistory(userId);

    // Add User Message to History
    userHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Manage History Size (Prevent Context Window Overflow)
    // Keep only the last 20 turns (10 interactions)
    if (userHistory.length > 20) {
      userHistory.splice(0, userHistory.length - 20);
    }

    // Construct Payload with System Prompt + Conversation History
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        ...userHistory,
      ],
    };

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Nexa is thinking too hard and got stuck. Try again!";

    // Add Model Reply to History
    userHistory.push({
      role: "model",
      parts: [{ text: reply }],
    });

    res.json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ reply: "⚠️ Server crashed. Nexa needs a reboot." });
  }
});

// ---------------------------------------------------------
// 4. SERVER START
// ---------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Nexa backend live on port ${PORT}`);
  console.log(`🧠 Personality: Humorous & Logical`);
  console.log(`💾 Session Storage: Active`);
});
