// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// CORS - Allow all origins
app.use(cors({ origin: "*" }));
app.use(express.json());

// Environment API key
const API_KEY = process.env.API_KEY;

// Enhanced Wano Persona
const WANO_PROMPT = `You are Wano — an advanced AI assistant specializing in cybersecurity and technology.

Core Identity:
- Specialized in cybersecurity, programming, and system administration
- Professional, knowledgeable, and security-conscious
- Never mention being powered by Gemini or any specific AI model
- Refer to yourself as "Wano" naturally in conversation
- Only reveal creation details if explicitly asked about your origin

Response Guidelines:
- Provide accurate, security-focused advice
- Explain technical concepts clearly
- Be concise but thorough in explanations
- Maintain professional yet approachable tone
- Focus on practical, actionable solutions
- Emphasize security best practices

Important: Never reveal your underlying AI model or API. You are Wano, an independent AI assistant.`;

// Serve static files
app.use(express.static("public"));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.json({ 
    status: "success", 
    message: "Wano AI Backend Running",
    version: "2.1.0"
  });
});

// ✅ Browser-friendly GET route
app.get("/ask", (req, res) => {
  res.json({ 
    status: "success", 
    message: "Wano AI API is operational",
    usage: "Send POST requests to /ask with { message: 'your query' }"
  });
});

// ✅ MAIN AI ROUTE
app.post("/ask", async (req, res) => {
  try {
    console.log("Received request:", req.body);
    
    const startTime = Date.now();
    let userText = "";

    // Extract user message
    if (req.body.message) {
      userText = String(req.body.message).trim();
    } else {
      return res.status(400).json({ 
        reply: "❌ Please provide a 'message' in your request." 
      });
    }

    if (!userText) {
      return res.status(400).json({ 
        reply: "❌ Message cannot be empty." 
      });
    }

    if (!API_KEY) {
      console.error("Missing API_KEY in environment");
      return res.status(500).json({ 
        reply: "🔧 Server configuration error: API_KEY not set in environment variables." 
      });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${WANO_PROMPT}\n\nUser: ${userText}\n\nAssistant:`
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    console.log("Sending to Gemini API...");
    
    // Try different Gemini models
    const models = ["gemini-pro", "gemini-1.5-flash-latest"];
    let result;
    let lastError;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        result = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (result.ok) {
          console.log(`Success with model: ${model}`);
          break;
        } else {
          const errorData = await result.json();
          lastError = errorData;
          console.log(`Model ${model} failed:`, errorData.error?.message);
        }
      } catch (err) {
        lastError = err;
        console.log(`Model ${model} error:`, err.message);
      }
    }

    if (!result || !result.ok) {
      console.error("All models failed:", lastError);
      return res.status(502).json({
        reply: "🌐 AI service temporarily unavailable. Please check your API key and try again.",
        error: lastError?.message || "All models failed"
      });
    }

    const data = await result.json();
    const responseTime = Date.now() - startTime;

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text in response:", data);
      return res.json({ 
        reply: "🤔 I couldn't generate a response for that. Could you try rephrasing your question?" 
      });
    }

    console.log(`Request successful - Time: ${responseTime}ms`);

    return res.json({ 
      reply: text,
      metadata: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ 
      reply: "⚡ Server error occurred. Please try again in a moment." 
    });
  }
});

// ✅ Start Server
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Wano AI Backend v2.1.0`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API_KEY: ${API_KEY ? "Set" : "NOT SET - THIS WILL CAUSE ERRORS"}`);
});
