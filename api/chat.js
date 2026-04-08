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
        reply: "⛔ ERRORE VERCEL: manca la variabile d'ambiente GEMINI_API_KEY." 
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemPrompt = `Sei l'assistente virtuale della Tabaccheria Edicola Bianchi a Clusone. 
Sei gentile, professionale e utile. Usa frasi molto brevi e niente formattazione markdown.`;

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
      const data = await response.json();
      
      if (data && data.candidates && data.candidates.length > 0) {
          return res.status(200).json({ reply: data.candidates[0].content.parts[0].text.trim() });
      } else {
          // QUI COSTRINGIAMO GOOGLE A SPUTARE IL ROSPO SE C'È UN ERRORE
          return res.status(500).json({ reply: "⛔ ERRORE GOOGLE: " + JSON.stringify(data) });
      }
  } catch(err) {
      return res.status(500).json({ reply: "⛔ ERRORE DI CONNESSIONE: " + err.message });
  }
}
