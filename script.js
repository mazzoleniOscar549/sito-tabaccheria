async function getBotResponseAsync(userMessage) {
    // Trasformiamo tutto in minuscolo per non avere problemi con MAIUSCOLE/minuscole
    const msg = userMessage.toLowerCase();

    // 1. RISPOSTE PREDEFINITE (LOGICA A PAROLE CHIAVE)
    if (msg.includes("ciao") || msg.includes("buongiorno") || msg.includes("buonasera")) {
        return "Ciao! Benvenuto alla Tabaccheria Bianchi. Come posso aiutarti?";
    }

    if (msg.includes("spid")) {
        return "Certamente! Servizio SPID attivo. Porta con te un documento d'identità valido, tessera sanitaria e il tuo smartphone. Ti aspettiamo!";
    }

    if (msg.includes("prodotti") || msg.includes("servizi")) {
        return "Offriamo: Tabacchi, Edicola, Lotto, Ricariche, SPID, Pagamento Bollette, Amazon Hub e Idee Regalo.";
    }

    if (msg.includes("orari") || msg.includes("aperto")) {
        return "Siamo aperti Lun-Sab 07:30-19:30. Mercoledì e Domenica solo mattina: 07:30-12:30.";
    }

    if (msg.includes("dove") || msg.includes("indirizzo") || msg.includes("posizione")) {
        return "Ci trovi in Piazza Orologio 2, a Clusone (BG). Proprio in centro!";
    }

    if (msg.includes("telefono") || msg.includes("contatti") || msg.includes("chiamare")) {
        return "Puoi chiamarci allo 0346 21194.";
    }

    // 2. RISPOSTA DI DEFAULT (Se non capisce le parole sopra)
    return "Scusa, non ho capito bene. Puoi chiedermi dello SPID, degli orari, dei nostri prodotti o chiamarci allo 0346 21194.";
}
