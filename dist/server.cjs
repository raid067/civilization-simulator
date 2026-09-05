var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "5mb" }));
var genAiClient = null;
function getGenAI() {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return genAiClient;
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/ai/chronicle", async (req, res) => {
  try {
    const { report, promptType, civilizationState } = req.body;
    const ai = getGenAI();
    if (!ai) {
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
        recommendation: deaths > births ? "Reallocate more healthy hunters and water-carriers before the frost returns." : "Maintain current labor balance and preserve dry grain stores."
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
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      source: "gemini",
      data: parsed
    });
  } catch (error) {
    console.error("AI Chronicle Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate chronicle"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Civilization Engine Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
