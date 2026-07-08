// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
});

// Live Crypto Prices (Simulated)
function updateCryptoPrices() {
  const prices = {
    'btc-price': '$' + (45000 + Math.random() * 1000).toFixed(2),
    'eth-price': '$' + (2500 + Math.random() * 500).toFixed(2),
    'sol-price': '$' + (150 + Math.random() * 50).toFixed(2),
    'xrp-price': '$' + (2.5 + Math.random() * 0.5).toFixed(2),
  };
  
  Object.keys(prices).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = prices[id];
  });
}

updateCryptoPrices();
setInterval(updateCryptoPrices, 5000);

// Newsletter Signup
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const messageEl = document.getElementById('newsletterMessage');
  messageEl.textContent = '✅ Welcome to the cosmic community! Check your email.';
  document.getElementById('newsletterForm').reset();
});

// Copy Referral Code
function copyCode() {
  const code = document.getElementById('referralCode');
  code.select();
  document.execCommand('copy');
  const messageEl = document.getElementById('referralMessage');
  messageEl.textContent = '✅ Referral code copied!';
  setTimeout(() => messageEl.textContent = '', 3000);
}

// Live Chat
let chatMessages = [];

function toggleChat() {
  const chatBody = document.getElementById('chatBody');
  chatBody.classList.toggle('hidden');
}

function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  const chatMessages = document.getElementById('chatMessages');
  
  // User message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.textContent = message;
  chatMessages.appendChild(userMsg);
  
  // Bot response
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot';
    botMsg.textContent = '🤖 Our team will help you soon! 🚀';
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 500);
  
  input.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Particle Animation Canvas
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    
    draw() {
      ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Admin Login (Simulated)
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (username === 'admin' && password === 'pluto2024') {
    document.getElementById('auth-panel').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    
    // Populate sample data
    document.getElementById('pending-kyc-count').textContent = Math.floor(Math.random() * 10);
    document.getElementById('pending-withdrawal-count').textContent = Math.floor(Math.random() * 15);
    document.getElementById('verified-count').textContent = Math.floor(Math.random() * 100);
    document.getElementById('approved-count').textContent = Math.floor(Math.random() * 50);
  } else {
    document.getElementById('auth-message').textContent = '❌ Invalid credentials';
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

console.log('🚀 Welcome to Pluto Capital - Journey to Wealth! 🌌');
