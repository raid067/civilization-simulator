import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite inline scripts and styles in SPA
    crossOriginEmbedderPolicy: false,
  })
);

// Payload size limit to prevent memory exhaustion
app.use(express.json({ limit: "100kb" }));

// General API rate limiter
const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please slow down." },
});
app.use("/api/", generalApiLimiter);

// AI Chronicle rate limiter (protects LLM quotas and prevents DoS)
const chronicleLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Chronicle request limit reached. Please wait a minute before consulting the tribal elders again.",
  },
});

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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Tribal Elder & Historical Chronicle endpoint
app.post("/api/ai/chronicle", chronicleLimiter, async (req, res) => {
  try {
    const { report, promptType, civilizationState } = req.body;

    // Strict input validation
    const validPromptTypes = ["yearly_epic", "crisis"];
    const selectedType = validPromptTypes.includes(promptType) ? promptType : "yearly_epic";

    if (selectedType === "yearly_epic" && (!report || typeof report !== "object")) {
      return res.status(400).json({
        success: false,
        error: "Valid yearly report object is required for yearly_epic chronicle.",
      });
    }

    const ai = getGenAI();

    if (!ai) {
      // Deterministic engine fallback chronicle if no Gemini API key is configured
      const year = typeof report?.year === "number" ? Math.max(0, report.year) : 0;
      const pop = typeof report?.population?.current === "number" ? report.population.current : 100;
      const deaths = typeof report?.population?.deaths === "number" ? report.population.deaths : 0;
      const births = typeof report?.population?.births === "number" ? report.population.births : 0;
      const threats = report?.threatLevel || "Safe";

      const fallbackNarrative = `In Year ${year}, the clan weathered the turning seasons along the riverbank. Numbering ${pop} surviving souls, they recorded ${births} newborn cries and mourned ${deaths} fallen kin. The encampment remains classified under ${threats} conditions, relying on communal fire, foraged roots, and shared stone axes to meet each dawn.`;

      return res.json({
        success: true,
        source: "engine-deterministic",
        chronicle: fallbackNarrative,
        recommendation:
          deaths > births
            ? "Reallocate more healthy hunters and water-carriers before the winter frost returns."
            : "Maintain current labor balance and protect dry grain storage against moisture.",
      });
    }

    let prompt = "";
    if (selectedType === "yearly_epic") {
      // Safe sanitized summary of report for prompt
      const sanitizedReport = {
        year: report.year,
        population: report.population,
        food: report.food,
        water: report.water,
        health: report.health,
        threatLevel: report.threatLevel,
        notableHappenings: report.notableHappenings,
      };

      prompt = `You are the Ancient Tribal Chronicler and AI Civilization Engine.
Analyze the following Year Report of an emerging human civilization starting from Year 0:
${JSON.stringify(sanitizedReport, null, 2)}

Provide:
1. "saga": A vivid, gritty, realistic 2-paragraph historical chronicle capturing the humans' struggle, weather, deaths, triumphs, and discoveries during this year.
2. "councilDeliberation": What the tribal elders and workers argue about around the central fire.
3. "strategicAdvice": 2-3 realistic survival priorities for the next year (e.g. food buffer, shelter repairs, water hygiene).
Format as JSON with keys: "saga", "councilDeliberation", "strategicAdvice".`;
    } else {
      prompt = `You are the AI Civilization Engine. The human settlement is facing an environmental or physiological crisis:
State Summary: ${JSON.stringify(civilizationState || {}, null, 2).slice(0, 2000)}

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
    // Do not leak stack traces or internal errors to client
    return res.status(500).json({
      success: false,
      error: "The Tribal Chronicler could not be reached. Please try again or use engine records.",
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Civilization Engine Server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("Shutting down server gracefully...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();

