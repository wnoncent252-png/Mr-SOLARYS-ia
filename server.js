require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json({limit:"1mb"}));
app.use(express.static(__dirname));

app.post("/api/chat", async (req,res)=>{
  try {
    const {provider="openrouter", model, system="", messages=[]} = req.body || {};
    const safeMessages = Array.isArray(messages) ? messages.filter(m => ["user","assistant"].includes(m.role) && typeof m.content === "string").slice(-30) : [];
    let url, key, body, headers;
    if (provider === "openrouter") {
      key=process.env.OPENROUTER_API_KEY; url="https://openrouter.ai/api/v1/chat/completions";
      headers={"Authorization":`Bearer ${key}`,"Content-Type":"application/json","HTTP-Referer":process.env.APP_URL||"http://localhost:3000","X-Title":"MR SOLARYS IA DEV"};
      body={model:model||process.env.OPENROUTER_MODEL||"openai/gpt-4o-mini",messages:[{role:"system",content:system},...safeMessages],max_tokens:2000};
    } else if (provider === "openai") {
      key=process.env.OPENAI_API_KEY; url="https://api.openai.com/v1/responses";
      headers={"Authorization":`Bearer ${key}`,"Content-Type":"application/json"};
      body={model:process.env.OPENAI_MODEL||"gpt-4.1-mini",instructions:system,input:safeMessages.map(m=>({role:m.role,content:[{type:"input_text",text:m.content}]})),max_output_tokens:2000};
    } else if (provider === "anthropic") {
      key=process.env.ANTHROPIC_API_KEY; url="https://api.anthropic.com/v1/messages";
      headers={"x-api-key":key,"anthropic-version":"2023-06-01","Content-Type":"application/json"};
      body={model:process.env.ANTHROPIC_MODEL||"claude-sonnet-4-5",system,max_tokens:2000,messages:safeMessages};
    } else return res.status(400).json({error:"Founisè sa a pa sipòte."});
    if(!key) return res.status(400).json({error:`Manke kle API pou ${provider} nan fichye .env la.`});
    const upstream=await fetch(url,{method:"POST",headers,body:JSON.stringify(body)});
    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok) return res.status(upstream.status).json({error:data.error?.message||data.message||"Founisè IA a retounen yon erè."});
    let reply="";
    if(provider==="openrouter") reply=data.choices?.[0]?.message?.content||"";
    else if(provider==="openai") reply=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\n");
    else reply=(data.content||[]).map(x=>x.text||"").join("\n");
    res.json({reply:reply||"Mwen pa jwenn repons nan men modèl la."});
  } catch(e) { res.status(500).json({error:"Erè sèvè. Verifye koneksyon ak konfigirasyon an."}); }
});
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`MR SOLARYS IA ap mache sou http://localhost:${port}`));
