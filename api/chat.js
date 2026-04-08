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
    return res.status(500).json({ reply: "⚠️ Errore critico: manca GEMINI_API_KEY" });
  }

  const systemPrompt = `Sei l'assistente virtuale della Tabaccheria Edicola Bianchi a Clusone...`; // (Il tuo prompt)

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nDomanda: " + message }] }]
      })
    });

    const data = await response.json();

    // --- AGGIUNGI QUESTO CONTROLLO QUI ---
    if (response.status === 429) {
      console.warn("⚠️ Quota esaurita (429)");
      return res.status(429).json({ 
        reply: "Sto ricevendo troppe domande in questo momento! Per favore, riprova tra 20 secondi o chiamaci direttamente." 
      });
    }
    // -------------------------------------

    if (data && data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content.parts[0].text.trim();
      return res.status(200).json({ reply });
    } else {
      return res.status(500).json({ 
        reply: "Scusa, i miei circuiti sono un po' lenti ora. Riprova tra un istante!" 
      });
    }

  } catch (err) {
    console.error("❌ Errore fetch:", err.message);
    return res.status(500).json({ reply: "Errore di connessione." });
  }
}
