import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
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
      reply: "⚠️ Errore critico: manca la variabile d'ambiente GEMINI_API_KEY nel server."
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
    console.log("📝 Inizializzando GoogleGenerativeAI...");
    const client = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    console.log("🤖 Caricando modello gemini-1.0-pro...");
    // ✅ CAMBIATO: gemini-1.0-pro
    const model = client.getGenerativeModel({ model: "gemini-1.0-pro" });

    console.log("📤 Inviando richiesta a Gemini...");
    const result = await model.generateContent(systemPrompt + "\n\nDomanda utente: " + message);
    
    console.log("⏳ Attendendo risposta...");
    const response = await result.response;
    const text = response.text();

    console.log("✅ Risposta ricevuta:", text);

    return res.status(200).json({ reply

