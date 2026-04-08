document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Chatbot HTML
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
            <div class="msg bot">Ciao! Sono l'assistente della Tabaccheria Bianchi. Come posso aiutarti?</div>
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

// --- LOGICA CHATBOT (RISPOSTE PREDEFINITE) ---
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

window.sendMessage = function() {
    const userInput = document.getElementById('user-input');
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';

    // Risposta immediata senza API
    const reply = getStaticResponse(text);
    setTimeout(() => {
        appendMessage(reply, 'bot');
    }, 500); // Mezzo secondo di ritardo per farlo sembrare reale
}

function getStaticResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    if (msg.includes("ciao") || msg.includes("buongiorno")) {
        return "Ciao! Come posso aiutarti oggi?";
    }
    if (msg.includes("spid")) {
        return "Servizio SPID attivo! Porta documenti, tessera sanitaria e cellulare. Ti aspettiamo in negozio.";
    }
    if (msg.includes("prodotti") || msg.includes("servizi")) {
        return "Offriamo tabacchi, edicola, lotto, ricariche, SPID, bollette e Amazon Hub.";
    }
    if (msg.includes("orari")) {
        return "Siamo aperti Lun-Sab 07:30-19:30. Mercoledì e Domenica solo mattina 07:30-12:30.";
    }
    if (msg.includes("dove") || msg.includes("posizione")) {
        return "Siamo in Piazza Orologio 2 a Clusone (BG).";
    }

    return "Scusa, non ho capito. Puoi chiedermi di SPID, orari, prodotti o chiamarci allo 0346 21194.";
}

function appendMessage(text, side) {
    const chatContent = document.getElementById('chat-content');
    if (!chatContent) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${side}`;
    msgDiv.innerText = text;
    chatContent.appendChild(msgDiv);
    chatContent.scrollTop = chatContent.scrollHeight;
}

// --- ALTRE FUNZIONI (MENU, SCROLL, REVEAL) ---
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
    document
