import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy GoogleGenAI initialization
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Tribal Elder & Historical Chronicle endpoint
app.post("/api/ai/chronicle", async (req, res) => {
  try {
    const { report, promptType, civilizationState } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback deterministic chronicle if no API key is provided
      const year = report?.year ?? 0;
      const pop = report?.population?.current ?? 100;
      const deaths = report?.population?.deaths ?? 0;
      const births = report?.population?.births ?? 0;
      const threats = report?.threatLevel ?? "Safe";
      
      const fallbackNarrative = `In Year ${year}, the tribe endured the turning seasons. Numbering ${pop} souls, they recorded ${births} newborn cries and mourned ${deaths} fallen kin. The camp remains classified under ${threats} conditions, relying on communal fire, foraged roots, and shared stone axes to meet the harsh dawn.`;

      return res.json({
        success: true,
        source: "engine-deterministic",
        chronicle: fallbackNarrative,
        recommendation: deaths > births 
          ? "Reallocate more healthy hunters and water-carriers before the frost returns." 
          : "Maintain current labor balance and preserve dry grain stores."
      });
    }

    let prompt = "";
    if (promptType === "yearly_epic") {
      prompt = `You are the Ancient Tribal Chronicler and AI Civilization Engine.
Analyze the following Year Report of an emerging human civilization starting from Year 0:
${JSON.stringify(report, null, 2)}

Provide:
1. "saga": A vivid, gritty, realistic 2-paragraph historical chronicle capturing the humans' struggle, weather, deaths, triumphs, and discoveries during this year.
2. "councilDeliberation": What the tribal elders and workers argue about around the central fire.
3. "strategicAdvice": 2-3 realistic survival priorities for the next year (e.g. food buffer, shelter repairs, water hygiene).
Format as JSON with keys: "saga", "councilDeliberation", "strategicAdvice".`;
    } else {
      prompt = `You are the AI Civilization Engine. The human settlement is facing the following crisis / condition:
State: ${JSON.stringify(civilizationState, null, 2)}

Generate:
1. "eventTitle": Title of the historical crisis/incident
2. "narrative": Atmospheric realistic description of how the people react
3. "consequences": Practical fallout on morale, health, and resources
4. "suggestedAction": What a prudent leader would order immediately.
Format as JSON with keys: "eventTitle", "narrative", "consequences", "suggestedAction".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini",
      data: parsed,
    });
  } catch (error: any) {
    console.error("AI Chronicle Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate chronicle",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Civilization Engine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
