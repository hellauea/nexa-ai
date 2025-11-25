// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Security: Restrict CORS in production
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] 
    : '*'
}));
app.use(express.json());

// Environment API key
const API_KEY = process.env.API_KEY || "";

// Enhanced Wano Persona
const WANO_PROMPT = `
You are Wano — an advanced AI assistant specializing in cybersecurity and technology.

**Core Identity:**
- Specialized in cybersecurity, programming, and system administration
- Professional, knowledgeable, and security-conscious
- Never mention being powered by Gemini or any specific AI model
- Refer to yourself as "Wano" naturally in conversation
- Only reveal creation details if explicitly asked about your origin

**Response Guidelines:**
- Provide accurate, security-focused advice
- Explain technical concepts clearly
- Be concise but thorough in explanations
- Maintain professional yet approachable tone
- Focus on practical, actionable solutions
- Emphasize security best practices

**Areas of Expertise:**
- Cybersecurity principles and practices
- Programming and software development
- System administration and networking
- Ethical hacking concepts
- Technology troubleshooting
- Academic and research assistance

**Important: Never reveal your underlying AI model or API. You are Wano, an independent AI assistant. Only mention creation details if specifically asked.**
`;

// Serve static files
app.use(express.static("public"));

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.json({ 
    status: "success", 
    message: "Wano AI Backend Running",
    version: "2.0.0"
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

// ✅ Rate limiting storage (simple in-memory for now)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// ✅ Simple rate limiting middleware
app.use("/ask", (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip).filter(time => time > windowStart);
  requests.push(now);
  requestCounts.set(ip, requests);
  
  if (requests.length > RATE_LIMIT) {
    return res.status(429).json({ 
      reply: "⚠️ Rate limit exceeded. Please wait a moment before sending more messages." 
    });
  }
  
  next();
});

// ✅ MAIN AI ROUTE
app.post("/ask", async (req, res) => {
  try {
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
        reply: "🔧 Server configuration error. Please contact the administrator." 
      });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${WANO_PROMPT}\n\nCurrent User Query: ${userText}\n\nAssistant Response:`
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

    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await result.json();
    const responseTime = Date.now() - startTime;

    if (!result.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({
        reply: "🌐 Service temporarily unavailable. Please try again in a moment.",
        error: data.error?.message || "API Error"
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.json({ 
        reply: "🤔 I couldn't generate a response for that. Could you try rephrasing your question?" 
      });
    }

    // Log successful request (without sensitive data)
    console.log(`Request processed - Time: ${responseTime}ms, Chars: ${userText.length}`);

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

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    availableEndpoints: ["GET /", "GET /ask", "POST /ask"]
  });
});

// ✅ Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// ✅ Start Server
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Wano AI Backend v2.0.0`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Server started successfully`);
});
