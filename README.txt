MR SOLARYS IA — DEV
===================

Pwojè sa a se yon entèfas entènèt ak sèvè relè API. Li pa yon APK Android konpile.

ENPÒTAN SEKIRITE
- Pa mete kle API nan HTML, JavaScript kliyan, oswa APK.
- Kle ki te pataje nan chat la dwe revoke. Kreye nouvo kle.
- Pa janm pataje fichye .env ou.
- Anvan piblikasyon, ajoute otantifikasyon, limit demann (rate limiting), ak HTTPS.

Pou lanse sou òdinatè/serveur ki gen Node.js 18+:
1. Dekonprese ZIP la.
2. Nan katab la, kouri: npm install
3. Kopi .env.example pou fè yon fichye .env
4. Ranplase valè egzanp yo ak NOUVO kle API yo.
5. Kouri: npm start
6. Ouvri http://localhost:3000

OpenRouter se founisè ki chwazi pa default. Ou ka chwazi OpenAI oswa Anthropic nan ⚙️.
Pou telefòn oswa APK, mete sèvè a sou hosting HTTPS epi ajiste chemen /api/chat nan entèfas la si nesesè.
Foto pwofil la se profile.png.
