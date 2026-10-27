// MR SOLARYS IA — règles multilingues
// Ce fichier charge les instructions depuis system-prompt.txt.

const fs = require("fs");
const path = require("path");

const languageSystemPrompt = fs.readFileSync(
  path.join(__dirname, "system-prompt.txt"),
  "utf8"
).trim();

module.exports = { languageSystemPrompt };
