document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Chatbot HTML con pulsanti rapidi nel benvenuto
    const chatHTML = `
      <div id="chat-widget">
        <div id="chat-button" onclick="toggleChat()">
          <i class="fas fa-comment-dots"></i>
        </div>
        
        <div id="chat-window">
          <div class="chat-header">
            <span>BianchiBot 💬</span>
            <i class="fas fa-times" style="cursor:pointer" onclick="toggleChat()"></i>
          </div>
          <div class="chat-body" id="chat-content">
            <div class="msg bot">
              Ciao! Sono l'assistente delle sorelle Bianchi. Clicca un servizio o scrivimi!
              <div class="chat-buttons" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
                <button onclick="sendQuickMsg('SPID')" style="background:white; border:1px solid #3498db; color:#3498db; padding:5px 10px; border-radius:15px; font-size:12px; cursor:pointer;">🆔 SPID</button>
                <button onclick="sendQuickMsg('Dove siete?')" style="background:white; border:1px solid #3498db; color:#3498db; padding:5px 10px; border-radius:15px; font-size:12px; cursor:pointer;">📍 Dove</button>
                <button onclick="sendQuickMsg('Orari')" style="background:white; border:1px solid #3498db; color:#3498db; padding:5px 10px; border-radius:15px; font-size:12px; cursor:pointer;">🕒 Orari</button>
                <button onclick="sendQuickMsg('Sigarette')" style="background:white; border:1px solid #3498db; color:#3498db; padding:5px 10px; border-radius:15px; font-size:12px; cursor:pointer;">🚬 Sigarette</button>
              </div>
            </div>
          </div>
          <div class="chat-footer">
            <input type="text" id="user-input" placeholder="Scrivi un messaggio..." onkeypress="handleChatKey(event)">
            <i class="fas fa-paper-plane" onclick="sendMessage()"></i>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    setupScrollAndMenu();
    setupReveal();
});

// --- LOGICA CHATBOT (IBRIDA: FISSA + API) ---

// Funzione per i pulsanti rapidi
window.sendQuickMsg = function(text) {
    const input = document.getElementById('user-input');
    input.value = text;
    sendMessage();
}

window.toggleChat = function() {
    const chatWindow = document.getElementById('chat-window');
    const input = document.getElementById('user-input');
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
    } else {
        chatWindow.style.display = 'flex';
        if(input) input.focus();
    }
}

window.handleChatKey = function(e) {
    if (e.key === 'Enter') sendMessage();
}

window.sendMessage = async function() {
    const userInput = document.getElementById('user-input');
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';

    // 1. CONTROLLO RISPOSTE RAPIDE
    const lowerText = text.toLowerCase();
    let staticReply = "";

    if (lowerText.includes("spid")) {
        staticReply = "Servizio SPID attivo! Porta documenti, tessera sanitaria e cellulare. Ti aspettiamo in negozio per l'attivazione.";
    } else if (lowerText.includes("orari") || lowerText.includes("aperto") || lowerText.includes("chiuso")) {
        staticReply = "Siamo aperti Lun-Sab 07:30-19:30. Mercoledì e Domenica solo mattina 07:30-12:30.";
    } else if (lowerText.includes("ciao") || lowerText.includes("buongiorno") || lowerText.includes("buonasera")) {
        staticReply = "Ciao! Benvenuto alla Tabaccheria Bianchi. Come posso aiutarti oggi?";
    } else if (lowerText.includes("come va") || lowerText.includes("come stai") || lowerText.includes("tutto bene")) {
        staticReply = "Tutto bene, grazie! Qui in Piazza Orologio siamo sempre pronti a servirti. Tu come posso aiutarti?";
    } else if (lowerText.includes("pazzo") || lowerText.includes("scemo") || lowerText.includes("stronzo") || lowerText.includes("vaffanculo")) {
        staticReply = "Siamo un'attività commerciale. Ti preghiamo di mantenere un linguaggio decoroso. Come posso aiutarti?";
    } else if (lowerText.includes("amazon") || lowerText.includes("hub") || lowerText.includes("pacco") || lowerText.includes("ritiro")) {
        staticReply = "Siamo punto Amazon Hub! Puoi ritirare o rendere i tuoi pacchi durante gli orari di apertura.";
    } else if (lowerText.includes("bollette") || lowerText.includes("pagamenti") || lowerText.includes("pagopa") || lowerText.includes("bollo")) {
        staticReply = "Qui puoi pagare bollettini postali, PagoPA, Mav/Rav e bollo auto in pochi istanti.";
    } else if (lowerText.includes("lotto") || lowerText.includes("gratta") || lowerText.includes("10elotto")) {
        staticReply = "Abbiamo Lotto, 10eLotto e una vasta scelta di Gratta e Vinci sempre aggiornati.";
    } else if (lowerText.includes("sigarette") || lowerText.includes("svapo") || lowerText.includes("iqos") || lowerText.includes("glo")) {
        staticReply = "Siamo rivenditori autorizzati di tabacchi e dispositivi elettronici.";
    } else if (lowerText.includes("edicola") || lowerText.includes("giornali") || lowerText.includes("riviste")) {
        staticReply = "La nostra edicola offre quotidiani, riviste, fumetti e figurine.";
    } else if (lowerText.includes("dove") || lowerText.includes("indirizzo") || lowerText.includes("posizione") || lowerText.includes("siete")) {
        staticReply = "Ci trovi in Piazza Orologio 2, a Clusone (BG), proprio di fronte all'orologio planetario.";
    } else if (lowerText.includes("grazie") || lowerText.includes("perfetto")) {
        staticReply = "Prego! È un piacere. Ti aspettiamo in negozio!";
    }

    if (staticReply !== "") {
        setTimeout(() => appendMessage(staticReply, 'bot'), 500);
        return;
    }

    // 2. SE NON È UNA RISPOSTA FISSA, USA L'IA (API)
    const loadingId = appendMessage("Sto pensando...", 'bot');
    const loadingElem = document.getElementById(loadingId);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        const reply = data.reply || "Scusa, riprova più tardi.";
        if(loadingElem) loadingElem.innerText = reply;
    } catch(err) {
        if(loadingElem) loadingElem.innerText = "Errore di connessione. Chiamaci allo 0346 21194.";
    }
}

function appendMessage(text, side) {
    const chatContent = document.getElementById('chat-content');
    if (!chatContent) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${side}`;
    msgDiv.innerText = text;
    const id = "msg-" + Date.now();
    msgDiv.id = id;
    chatContent.appendChild(msgDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
    return id;
}

// --- NAVIGAZIONE, SCROLL E SLIDER ---

let lastScrollTop = 0;
function setupScrollAndMenu() {
    const menu = document.getElementById("menu");
    const heroLogo = document.querySelector(".hero-logo-container");
    const heroSection = document.querySelector(".hero");

    window.addEventListener("scroll", function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (window.innerWidth <= 768 && heroLogo && heroSection) {
            heroLogo.style.opacity = (scrollTop > (heroSection.offsetHeight - 80)) ? "0" : "1";
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
}

window.toggleMenu = function() {
    const menu = document.getElementById("menu");
    const icon = document.querySelector(".menu-icon");
    if(menu) menu.classList.toggle("open");
    if(icon) icon.classList.toggle("open");
}

function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

window.moveSlider = function(direction) {
    const slider = document.getElementById('slider');
    if(slider) {
        const cardWidth = slider.querySelector('.service-card').offsetWidth + 25;
        slider.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
    }
}
