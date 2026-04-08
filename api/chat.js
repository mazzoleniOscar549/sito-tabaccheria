import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Endpoint per listare i modelli disponibili
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        reply: "Manca GEMINI_API_KEY"
      });
    }

    try {
      const client = new GoogleGenerativeAI(GEMINI_API_KEY);
      const models = await client.listModels();
      
      console.log("📋 Modelli disponibili:");
      const modelList = [];
      for await (const model of models) {
        console.log("- " + model.name);
        modelList.push(model.name);
      }

      return res.status(200).json({ 
        models: modelList,
        reply: "Modelli elencati nei log" 
      });

    } catch (err) {
      console.error("❌ Errore nel listare modelli:", err.message);
      return res.status(500).json({ 
        reply: "Errore: " + err.message 
      });
    }
  }

  // POST - Chat normale
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Metodo non consentito' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: 'Nessun messaggio fornito.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      reply: "⚠️ Errore critico: manca GEMINI_API_KEY"
    });
  }

  const systemPrompt = `Sei l'assistente virtuale della Tabaccheria Edicola Bianchi a Clusone. 
Sei gentile, professionale e utile.
Servizi offerti: tabacchi, edicola, lotto, ricariche, spid, bollette, amazon hub, idee regalo.
Orari: Lun-Sab 07:30-19:30, Dom e mercoledi 7:30-12:30.
Indirizzo: Piazza Orologio 2, Clusone (BG). Telefono: 0346 21194.
Regole per te:
1. Rispondi sempre e solo in italiano.
2. Sii conciso (massimo 2-3 frasi, vai subito al punto e fornisci l'informazione utile).
3. Usa un tono accogliente e amichevole. Non inserire risposte formattate con Markdown (usa solo testo semplice).`;

  try {
    const client = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: "gemini-1.0-pro" });

    const result = await model.generateContent(systemPrompt + "\n\nDomanda utente: " + message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text.trim() });

  } catch (err) {
    console.error("❌ ERRORE:", err.message);
    return res.status(500).json({ 
      reply: "Errore: " + err.message 
    });
  }
}
