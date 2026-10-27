try {
  require("dotenv").config();
} catch (_) {
  // dotenv est optionnel sur Vercel : les variables viennent des réglages du projet
}

const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "1mb" }));

// Modèle par défaut pour OpenRouter (modifiable via la variable OPENROUTER_MODEL sur Vercel)
const DEFAULT_OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free";

// Paj dakèy MR SOLARYS IA
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Foto pwofil
app.get("/profile.png", (req, res) => {
  res.sendFile(path.join(__dirname, "profile.png"));
});

// Tcheke si sèvè a fonksyone
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    app: "MR SOLARYS IA — DEV",
    status: "online",
    openrouterKey: Boolean(process.env.OPENROUTER_API_KEY)
  });
});

// API prensipal chat la
app.post("/api/chat", async (req, res) => {
  try {
    const {
      provider = "openrouter",
      model,
      system,
      messages
    } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Voye omwen yon mesaj."
      });
    }

    const safeMessages = messages
      .filter(
        (m) =>
          m &&
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
      )
      .slice(-30);

    if (safeMessages.length === 0) {
      return res.status(400).json({
        error: "Pa gen mesaj ki valab."
      });
    }

    const systemPrompt =
      typeof system === "string" && system.trim()
        ? system.trim()
        : "Tu es MR SOLARYS IA, un assistant compétent en programmation et en résolution de problèmes. Réponds dans la langue de l'utilisateur (français, créole haïtien ou anglais), avec la réponse d'abord, puis les détails utiles.";

    let url;
    let key;
    let headers;
    let body;
    let providerName;

    if (provider === "openrouter") {
      key = process.env.OPENROUTER_API_KEY;
      url = "https://openrouter.ai/api/v1/chat/completions";
      providerName = "OpenRouter";

      // Le modèle est imposé par le serveur : celui envoyé par le site/APK est ignoré
      body = {
        model: DEFAULT_OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...safeMessages
        ],
        max_tokens: 2000
      };
    } else if (provider === "openai") {
      key = process.env.OPENAI_API_KEY;
      url = "https://api.openai.com/v1/chat/completions";
      providerName = "OpenAI";

      body = {
        model: model || process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...safeMessages
        ],
        max_tokens: 2000
      };
    } else if (provider === "deepseek") {
      key = process.env.DEEPSEEK_API_KEY;
      url = "https://api.deepseek.com/chat/completions";
      providerName = "DeepSeek";

      body = {
        model: model || "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...safeMessages
        ],
        max_tokens: 2000
      };
    } else if (provider === "anthropic") {
      key = process.env.ANTHROPIC_API_KEY;
      url = "https://api.anthropic.com/v1/messages";
      providerName = "Anthropic";

      body = {
        model: model || "claude-3-5-haiku-latest",
        max_tokens: 2000,
        system: systemPrompt,
        messages: safeMessages
      };
    } else {
      return res.status(400).json({
        error: "Founisè sa a pa sipòte."
      });
    }

    if (!key) {
      return res.status(503).json({
        error:
          "Kle API pou " +
          providerName +
          " pa konfigire sou sèvè a."
      });
    }

    headers = {
      "Content-Type": "application/json"
    };

    if (provider === "anthropic") {
      headers["x-api-key"] = key;
      headers["anthropic-version"] = "2023-06-01";
    } else {
      headers["Authorization"] = `Bearer ${key}`;
    }

    if (provider === "openrouter") {
      headers["HTTP-Referer"] = process.env.SITE_URL || "https://mr-solarys.vercel.app";
      headers["X-Title"] = "MR SOLARYS IA";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        `${providerName} API error:`,
        response.status
      );

      return res.status(502).json({
        error:
          data.error?.message ||
          data.message ||
          `${providerName} pa kapab reponn kounye a.`,
        provider: providerName,
        status: response.status
      });
    }

    let reply = "";

    if (provider === "anthropic") {
      reply = (data.content || [])
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n");
    } else {
      reply = data.choices?.[0]?.message?.content || "";
    }

    if (!reply) {
      return res.status(502).json({
        error: "IA a pa retounen okenn repons."
      });
    }

    return res.json({
      success: true,
      provider: providerName,
      reply
    });
  } catch (error) {
    console.error("Chat error:", error.message);

    return res.status(500).json({
      error:
        "Yon pwoblèm rive pandan demann lan. Eseye ankò."
    });
  }
});

// Ekspòte aplikasyon an pou Vercel
module.exports = app;

// Pèmèt sèvè a mache lokalman tou
if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(
      `MR SOLARYS IA ap mache sou pò ${port}`
    );
  });
}
