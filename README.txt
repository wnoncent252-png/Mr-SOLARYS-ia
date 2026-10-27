DOSSIER LANGUAGES — MR SOLARYS IA

Contenu :
- system-prompt.txt : demande à l'IA de répondre dans la langue de l'utilisateur.
- language.js : charge les instructions du fichier texte.

INSTALLATION :
1. Ajoutez le dossier "languages" à la racine du dépôt GitHub, au même niveau que server.js et index.html.
2. En haut de server.js, ajoutez :
   const { languageSystemPrompt } = require("./languages/language");

3. Dans la route /api/chat, remplacez la définition actuelle de systemPrompt par :
   const systemPrompt =
     typeof system === "string" && system.trim()
       ? system.trim()
       : languageSystemPrompt;

IMPORTANT :
- Gardez le nom du dossier exactement "languages".
- Ne mettez aucune clé API dans ce dossier.
- Conservez les clés dans Vercel > Settings > Environment Variables.
- La qualité linguistique dépend aussi du modèle IA utilisé.
