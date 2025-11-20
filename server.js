<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NEXA | Intelligent Assistant</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- FontAwesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- Google Fonts: Inter -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Marked.js -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <!-- Highlight.js (VS Code Dark Theme) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/vs2015.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>

  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #020617; /* Slate 950 */
      overflow: hidden;
    }

    /* Subtle Aurora Background Animation */
    .aurora-bg {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.15), transparent 50%),
                  radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.15), transparent 50%),
                  radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.15), transparent 50%);
      animation: aurora 20s ease-in-out infinite alternate;
      z-index: -1;
    }

    @keyframes aurora {
      0% { transform: translate(0, 0) rotate(0deg); }
      100% { transform: translate(-5%, -5%) rotate(5deg); }
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }

    /* Typing Animation */
    .typing-dot {
      animation: wave 1.5s infinite ease-in-out;
    }
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes wave {
      0%, 100% { transform: translateY(0); opacity: 0.5; }
      50% { transform: translateY(-5px); opacity: 1; }
    }

    /* Markdown Styles Refined */
    .prose p { margin-bottom: 0.75em; line-height: 1.7; }
    /* Updated pre style to accommodate relative positioning for button */
    .prose pre { background: #1e1e1e !important; border-radius: 0.75rem; border: 1px solid #333; margin: 0; overflow: auto; }
    .prose code { color: #e0e7ff; font-family: monospace; background: rgba(255,255,255,0.1); padding: 0.2em 0.4em; border-radius: 4px; }
    .prose pre code { background: transparent; padding: 0; color: inherit; }
    .prose strong { color: #a5b4fc; font-weight: 600; }
    .prose ul { list-style-type: disc; padding-left: 1.5em; color: #cbd5e1; }
    .prose ol { list-style-type: decimal; padding-left: 1.5em; color: #cbd5e1; }
    
    /* Fade In Animation */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .message-enter {
      animation: fadeIn 0.4s ease-out forwards;
    }
  </style>
</head>
<body class="text-slate-200 h-screen flex items-center justify-center selection:bg-indigo-500/30 selection:text-indigo-200">

  <!-- Ambient Background -->
  <div class="aurora-bg"></div>

  <!-- Main Interface -->
  <div class="w-full max-w-5xl h-[95vh] md:h-[90vh] flex flex-col bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
    
    <!-- Header -->
    <header class="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-slate-900/40 z-20">
      <div class="flex items-center gap-4">
        <div>
          <div class="relative inline-block">
             <h1 class="text-2xl font-bold tracking-tight text-white">NEXA</h1>
          </div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button onclick="location.reload()" class="w-9 h-9 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 transition-all" title="New Chat">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </header>

    <!-- Chat Area -->
    <div id="chat" class="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
      <!-- Welcome Screen -->
      <div id="welcome-screen" class="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-2xl shadow-indigo-500/20">
          <div class="w-full h-full bg-slate-900/90 rounded-3xl flex items-center justify-center backdrop-blur-sm">
             <i class="fa-solid fa-bolt text-3xl text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-purple-400"></i>
          </div>
        </div>
        <div>
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-2">Hello, Human.</h2>
          <p class="text-slate-400 text-lg max-w-md mx-auto">I am Nexa. How can I help you accelerate your work today?</p>
        </div>
        
        <!-- Suggestion Chips -->
        <div class="flex flex-wrap justify-center gap-3 mt-8">
          <button onclick="fillInput('Analyze this code for vulnerabilities')" class="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-slate-300 transition-colors">🛡️ Security Audit</button>
          <button onclick="fillInput('Explain Quantum Cryptography')" class="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-slate-300 transition-colors">⚛️ Quantum Crypto</button>
          <button onclick="fillInput('Write a Python script for network scanning')" class="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-slate-300 transition-colors">🐍 Python Script</button>
        </div>
      </div>
    </div>

    <!-- Loading Indicator (Explicitly Hidden by Default) -->
    <div id="typing-indicator" class="hidden px-10 py-4 items-center gap-2 text-slate-400">
      <div class="w-2 h-2 bg-indigo-500 rounded-full typing-dot"></div>
      <div class="w-2 h-2 bg-violet-500 rounded-full typing-dot"></div>
      <div class="w-2 h-2 bg-fuchsia-500 rounded-full typing-dot"></div>
    </div>

    <!-- Input Area -->
    <div class="p-6 md:p-8 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent z-20">
      <form id="chat-form" class="relative max-w-3xl mx-auto">
        <div class="relative group">
          <!-- Glowing Border Effect -->
          <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-60 group-focus-within:opacity-100 transition duration-500 blur-[2px]"></div>
          
          <div class="relative flex items-center bg-slate-950 rounded-2xl border border-white/10 shadow-xl">
            <input 
              id="user-input" 
              type="text" 
              placeholder="Ask anything..." 
              class="w-full bg-transparent text-white p-4 pl-6 pr-14 rounded-2xl focus:outline-none placeholder-slate-500 text-lg font-light"
              autocomplete="off"
            />
            <button type="submit" class="absolute right-2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
          </div>
        </div>
        <p class="text-center text-xs text-slate-600 mt-3">NEXA can make mistakes. Please verify critical information.</p>
      </form>
    </div>

  </div>

<script>
const API_URL = "https://nexa-ai-nd5x.onrender.com/ask";
let conversation = [];

const chatContainer = document.getElementById('chat');
const welcomeScreen = document.getElementById('welcome-screen');
const typingIndicator = document.getElementById('typing-indicator');

// Helper for suggestion chips
function fillInput(text) {
  const input = document.getElementById('user-input');
  input.value = text;
  input.focus();
}

// --- CUSTOM MARKDOWN RENDERER FOR CODE BLOCKS (Smart Copy Button) ---
const renderer = new marked.Renderer();

renderer.code = function(code, language) {
  const validLang = !!(language && highlight.getLanguage(language));
  const highlighted = validLang 
    ? highlight.highlight(code, { language }).value 
    : highlight.highlightAuto(code).value;

  return `
  <div class="relative group my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e]">
    <!-- Code Copy Button (Top Right) -->
    <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onclick="copyCodeSnippet(this)" class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs backdrop-blur-md transition-all border border-white/10 flex items-center justify-center w-8 h-8 shadow-lg" title="Copy Code">
         <i class="fa-regular fa-copy"></i>
      </button>
    </div>
    <div class="p-4 overflow-x-auto">
       <pre><code class="hljs language-${language || 'plaintext'}">${highlighted}</code></pre>
    </div>
  </div>`;
};

marked.setOptions({
  renderer: renderer,
  langPrefix: 'hljs language-'
});

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Typing Indicator Logic
function showTyping() {
    typingIndicator.classList.remove('hidden');
    typingIndicator.classList.add('flex'); 
    scrollToBottom();
}

function hideTyping() {
    typingIndicator.classList.add('hidden');
    typingIndicator.classList.remove('flex');
}

// Code Snippet Copy Logic
function copyCodeSnippet(btn) {
  const wrapper = btn.closest('.relative');
  const codeElement = wrapper.querySelector('code');
  
  if (codeElement) {
    const codeText = codeElement.innerText;
    navigator.clipboard.writeText(codeText).then(() => {
      const icon = btn.querySelector('i');
      icon.className = 'fa-solid fa-check text-emerald-400';
      setTimeout(() => {
        icon.className = 'fa-regular fa-copy';
      }, 2000);
    });
  }
}

function addMessage(text, sender) {
  if (welcomeScreen) welcomeScreen.style.display = 'none';

  const div = document.createElement('div');
  const isBot = sender === 'bot';
  
  div.className = `flex w-full ${isBot ? 'justify-start' : 'justify-end'} message-enter mb-8`;
  
  const content = isBot ? marked.parse(text) : text;

  div.innerHTML = `
    <div class="flex flex-col max-w-[85%] md:max-w-[75%] ${isBot ? 'items-start' : 'items-end'}">
      
      <span class="text-xs font-bold tracking-wide text-slate-500 mb-2 ml-1 uppercase">${isBot ? 'NEXA' : 'YOU'}</span>

      <div class="group relative w-full">
        <!-- Message Bubble -->
        <div class="prose prose-invert text-[15px] p-5 rounded-2xl shadow-sm w-full max-w-none ${
          isBot 
            ? 'bg-slate-800/50 border border-white/5 text-slate-200 backdrop-blur-sm rounded-tl-none' 
            : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/10'
        }">
          <div class="leading-relaxed break-words">${content}</div>
        </div>

        <!-- Message Action Tools (Hover to show) -->
        <div class="absolute top-full ${isBot ? 'left-0' : 'right-0'} mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onclick="copyToClipboard(this)" class="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white text-xs border border-white/5 transition-colors" title="Copy Message">
            <i class="fa-regular fa-copy"></i>
          </button>
          ${isBot ? `
          <button onclick="rethinkMessage(this)" class="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 text-xs border border-white/5 transition-colors" title="Regenerate">
            <i class="fa-solid fa-rotate"></i>
          </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  chatContainer.appendChild(div);
  scrollToBottom();
}

function copyToClipboard(btn) {
  const group = btn.closest('.group');
  const messageBubble = group.querySelector('.prose');
  const messageContent = messageBubble.innerText; 
  
  navigator.clipboard.writeText(messageContent);
  
  const icon = btn.querySelector('i');
  icon.className = 'fa-solid fa-check text-emerald-400';
  
  setTimeout(() => {
    icon.className = 'fa-regular fa-copy';
  }, 2000);
}

async function rethinkMessage(btn) {
  const messageRow = btn.closest('.message-enter');
  messageRow.remove();
  
  conversation.pop();

  showTyping();

  try {
    const res = await fetch(API_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ history: conversation })
    });

    const data = await res.json();
    
    hideTyping();

    addMessage(data.reply, 'bot');
    conversation.push({ role:'assistant', content: data.reply });
    
  } catch(err) {
    hideTyping();
    addMessage('**Connection Error:** Unable to reach Nexa servers.', 'bot');
  }
}

document.getElementById('chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const input = document.getElementById('user-input');
  const msg = input.value.trim();
  if(!msg) return;

  addMessage(msg, 'user');
  input.value = '';
  input.focus();

  conversation.push({ role:'user', content: msg });

  showTyping();

  try {
    const res = await fetch(API_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ history: conversation })
    });

    const data = await res.json();
    
    hideTyping();

    addMessage(data.reply, 'bot');
    conversation.push({ role:'assistant', content: data.reply });
    
  } catch(err) {
    hideTyping();
    addMessage('**Connection Error:** Unable to reach Nexa servers.', 'bot');
  }
});
</script>
</body>
</html>
