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
            <div class="msg bot">Ciao! Sono l'assistente virtuale delle sorelle Bianchi. Come posso aiutarti oggi?</div>
          </div>
          <div class="chat-footer">
            <input type="text" id="user-input" placeholder="Scrivi un messaggio..." onkeypress="handleChatKey(event)">
            <i class="fas fa-paper-plane" onclick="sendMessage()"></i>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 2. Setup behaviors
    setupScrollAndMenu();
    setupReveal();
});

// --- NAVIGATION, SCROLL, AND STICKY LOGIC ---
let lastScrollTop = 0;
function setupScrollAndMenu() {
    const menu = document.getElementById("menu");
    const icon = document.querySelector(".menu-icon");
    const heroLogo = document.querySelector(".hero-logo-container");
    const heroSection = document.querySelector(".hero") || document.querySelector(".page-header");

    window.addEventListener("scroll", function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Hide Hero Logo on Mobile when scrolled
        if (window.innerWidth <= 768 && heroLogo && heroSection) {
            heroLogo.style.opacity = (scrollTop > (heroSection.offsetHeight - 80)) ? "0" : "1";
        }

        // Sticky Menu Logic
        if (menu && menu.classList.contains("open")) return;

        if (menu && window.innerWidth > 768) {
            if (scrollTop < 100) {
                menu.classList.remove("visible", "sticky");
            } else if (scrollTop > lastScrollTop && scrollTop > 300) {
                menu.classList.remove("visible");
            } else {
                menu.classList.add("visible", "sticky");
            }
        } else if (menu) {
            menu.classList.remove("visible", "sticky");
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
}

// --- MENU TOGGLE ---
window.toggleMenu = function() {
    const menu = document.getElementById("menu");
    const icon = document.querySelector(".menu-icon");
    if(menu) menu.classList.toggle("open");
    if(icon) icon.classList.toggle("open");
    document.body.style.overflow = (menu && menu.classList.contains("open")) ? "hidden" : "auto";
}

// --- ELEMENTS REVEAL ON SCROLL ---
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

// --- SLIDER LOGIC ---
window.moveSlider = function(direction) {
    const slider = document.getElementById('slider');
    if(slider) {
        const cardWidth = slider.querySelector('.service-card').offsetWidth + 25;
        slider.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
    }
}

// --- CHATBOT LOGIC ---
window.toggleChat = function() {
    const chatWindow = document.getElementById('chat-window');
    const input = document.getElementById('user-input');
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
        chatWindow.style.animation = '';
    } else {
        chatWindow.style.display = 'flex';
        chatWindow.style.animation = 'scaleUp 0.3s ease forwards';
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

    // Mostriamo uno stato di caricamento temporaneo
    const loadingId = appendMessage("Sto pensando...", 'bot');
    const loadingElem = document.getElementById(loadingId);
    if(loadingElem) loadingElem.style.opacity = '0.6';

    const reply = await getBotResponseAsync(text);
    
    // Aggiorniamo il messaggio di caricamento con la risposta reale
    if(loadingElem) {
        loadingElem.style.opacity = '1';
        loadingElem.innerText = reply;
    } else {
        appendMessage(reply, 'bot');
    }
}

function appendMessage(text, side) {
    const chatContent = document.getElementById('chat-content');
    if (!chatContent) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${side}`;
    msgDiv.innerText = text;
    
    // Generiamo un id univoco per poterlo modificare (utile per l'animazione di caricamento)
    const id = "msg-" + Date.now() + Math.floor(Math.random() * 1000);
    msgDiv.id = id;

    chatContent.appendChild(msgDiv);
    chatContent.scrollTop = chatContent.scrollHeight;

    return id;
}

async function getBotResponseAsync(userMessage) {
    try {
        // Invia la richiesta al backend sicuro (Vercel Serverless Function)
        // Nota: Questo funzionerà solo quando il sito sarà hostato su Vercel (o lanciato con Vercel CLI)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        
        const data = await response.json();
        return data.reply || "Errore sconosciuto dal server.";
    } catch(err) {
        console.error("Errore chiamata API Backend:", err);
        return "⚠️ Attenzione: Il bot non può connettersi. Ricorda che questa nuova versione super-sicura funziona solo se pubblichi il sito su Vercel (o usi un server locale abilitato).";
    }
}

function showToast(messaggio) {
  const toast = document.getElementById('toast-notification');
  const text = document.getElementById('toast-text');
  
  if(messaggio) text.innerText = messaggio;
  
  toast.classList.add('show');

  // Scompare da sola dopo 6 secondi
  setTimeout(() => {
    hideToast();
  }, 6000);
}

function hideToast() {
  const toast = document.getElementById('toast-notification');
  toast.classList.remove('show');
}

// Avvio automatico all'ingresso
window.addEventListener('load', () => {
  setTimeout(() => {
    showToast("Sigarette elettroniche scontate del 10%!");
  }, 1000); 
});

