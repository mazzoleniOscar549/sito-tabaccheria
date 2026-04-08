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
            <div class="msg bot">Ciao! Sono l'assistente delle sorelle Bianchi. Come posso aiutarti?</div>
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

    // 1. CONTROLLO RISPOSTE RAPIDE (Per risparmiare API)
    const lowerText = text.toLowerCase();
    let staticReply = "";

    if (lowerText.includes("spid")) staticReply = "Servizio SPID attivo! Porta documenti, tessera sanitaria e cellulare. Ti aspettiamo in negozio.";
    if (lowerText.includes("orari")) staticReply = "Siamo aperti Lun-Sab 07:30-19:30. Mercoledì e Domenica solo mattina 07:30-12:30.";
    if (lowerText.includes("ciao") || lowerText.includes("buongiorno")) staticReply = "Ciao! Come posso aiutarti oggi?";

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
