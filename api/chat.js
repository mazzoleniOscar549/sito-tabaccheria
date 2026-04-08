export default async function handler(req, res) {
  // Consentire solo richieste POST
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

  // ✅ CORRETTO: usa v1beta con gemini-pro
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const systemPrompt = `Sei l'assistente virtuale della Tabaccheria Edicola Bianchi a Clusone. 
Sei gentile, professionale e utile.
Servizi offerti: tabacchi, edicola, lotto, ricariche, spid, bollette, amazon hub, idee regalo.
Orari: Lun-Sab 07:30-19:30, Dom e mercoledi 7:30-12:30.
Indirizzo: Piazza Orologio 2, Clusone (BG). Telefono: 0346 21194.
Regole per te:
1. Rispondi sempre e solo in italiano.
2. Sii conciso (massimo 2-3 frasi, vai subito al punto e fornisci l'informazione utile).
3. Usa un tono accogliente e amichevole. Non inserire risposte formattate con Markdown (usa solo testo semplice).`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\nDomanda utente: " + message }]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log("Response Status:", response.status);
    
    const data = await response.json();

    console.log("Gemini Response COMPLETO:", JSON.stringify(data, null, 2));

    if (data && data.candidates && data.candidates.length > 0) {
      console.log("Risposta trovata!");
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text.trim() });
    } else {
      console.error("Gemini API Error completo:", JSON.stringify(data, null, 2));
      return res.status(500).json({ reply: "Scusa, in questo momento i miei circuiti sono occupati. Puoi chiamarci allo 0346 21194." });
    }
  } catch (err) {
    console.error("Failed to fetch from Gemini:", err.message);
    console.error("Full error:", err);
    return res.status(500).json({ reply: "Si è verificato un errore di connessione." });
  }
}
