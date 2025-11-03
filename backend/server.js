// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ⚠️ Replace with your valid Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/api/guess", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    const body = {
      contents: [
        {
          parts: [
            {
              text: "You are playing Draw It AI. Guess what the user has drawn as a single word or phrase (example: 'cat', 'house', 'car').",
            },
            {
              inline_data: {
                mime_type: "image/png",
                data: image,
              },
            },
          ],
        },
      ],
    };

    if (!GEMINI_API_KEY) {
      console.error("❌ Missing GEMINI_API_KEY. Set it in your environment or .env file.");
      return res.status(500).json({ error: "Server misconfiguration: missing API key" });
    }

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log("📥 Gemini Raw:", text);

    if (!response.ok) {
      return res.status(500).json({ error: "Gemini API error", details: text });
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Invalid JSON from Gemini" });
    }

    const guess =
      json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I can't tell what that is.";

    res.json({ guess });
  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, "0.0.0.0", () => {
  console.log("✅ Draw It AI backend running on http://localhost:5000");
  console.log("📡 Also accessible on http://192.168.56.1:5000");
});
