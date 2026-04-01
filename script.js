/* ============================================================
   SHE SAW IN COLOR — Main Script
   ============================================================ */

// ─── NAV SCROLL ───────────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── HAMBURGER ────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
}

// ─── BIRD CANVAS ──────────────────────────────────────────
const canvas = document.getElementById('birdCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Bird {
  constructor(dark = false) {
    this.dark = dark;
    this.reset(true);
  }

  reset(init = false) {
    this.x = init ? Math.random() * canvas.width : -60;
    this.y = Math.random() * canvas.height * 0.7;
    this.speed = 0.4 + Math.random() * 0.8;
    this.wingPhase = Math.random() * Math.PI * 2;
    this.wingSpeed = 0.04 + Math.random() * 0.04;
    this.scale = 0.5 + Math.random() * 0.8;
    this.opacity = 0.2 + Math.random() * 0.5;
    this.drift = (Math.random() - 0.5) * 0.15;
  }

  update() {
    this.x += this.speed;
    this.y += this.drift;
    this.wingPhase += this.wingSpeed;
    if (this.x > canvas.width + 60) this.reset();
  }

  draw() {
    const s = this.scale;
    const wing = Math.sin(this.wingPhase) * 8 * s;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();

    if (this.dark) {
      // Dark bird — grey silhouette
      ctx.moveTo(-18 * s, 2 * s);
      ctx.quadraticCurveTo(-9 * s, -8 * s + wing, 0, 0);
      ctx.quadraticCurveTo(9 * s, -8 * s + wing, 18 * s, 2 * s);
      ctx.strokeStyle = 'rgba(100,100,100,0.8)';
    } else {
      // Light bird — colorful
      ctx.moveTo(-18 * s, 2 * s);
      ctx.quadraticCurveTo(-9 * s, -8 * s + wing, 0, 0);
      ctx.quadraticCurveTo(9 * s, -8 * s + wing, 18 * s, 2 * s);
      // cycling hue
      const hue = (Date.now() * 0.05 + this.x * 0.2) % 360;
      ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.9)`;
    }

    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
}

// Create flock — more dark birds (reflecting the shedim winning ground)
const birds = [];
for (let i = 0; i < 18; i++) birds.push(new Bird(i < 12));
for (let i = 0; i < 8; i++) birds.push(new Bird(false));

function animateBirds() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  birds.forEach(b => { b.update(); b.draw(); });
  requestAnimationFrame(animateBirds);
}
animateBirds();

// ─── CART ─────────────────────────────────────────────────
let cart = [];

const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartFab = document.getElementById('cartFab');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartBadge = document.getElementById('cartBadge');
const cartTotal = document.getElementById('cartTotal');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartFab.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }

    renderCart();
    openCart();

    // Pulse the button
    btn.textContent = 'Added!';
    btn.style.background = 'linear-gradient(135deg, #00d4ff, #8b5cf6)';
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.style.background = '';
    }, 1400);
  });
});

function renderCart() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Badge
  cartBadge.textContent = totalQty;
  cartBadge.classList.toggle('visible', totalQty > 0);

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        <img src="cover.jpg" alt="${item.name}" />
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}">Remove</button>
    </div>
  `).join('');

  // Qty buttons
  cartItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = cart.find(i => i.id === id);
      if (!item) return;
      if (btn.dataset.action === 'plus') {
        item.qty++;
      } else {
        item.qty--;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      }
      renderCart();
    });
  });

  // Remove buttons
  cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart = cart.filter(i => i.id !== btn.dataset.id);
      renderCart();
    });
  });
}

document.getElementById('checkoutBtn').addEventListener('click', () => {
  alert('Checkout integration coming soon! Thank you for your interest in She Saw in Color.');
});

// ─── SCROLL REVEAL ────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '#world .world-grey-content, #world .world-color-content, #world .world-desc-inner, ' +
  '.product-card, .author-inner, #manifesto .manifesto-quote'
);

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  revealObs.observe(el);
});

// Add CSS class triggered animation
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .revealed { opacity: 1 !important; transform: none !important; }
  </style>
`);

// ─── GREY-TO-COLOR SCROLL EFFECT (world section) ──────────
// As user scrolls into the color side, slightly brighten
const worldSection = document.getElementById('world');
if (worldSection) {
  const colorObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      document.body.classList.add('world-visible');
    } else {
      document.body.classList.remove('world-visible');
    }
  }, { threshold: 0.3 });
  colorObs.observe(worldSection);
}

// ─── PARALLAX HERO BOOK ───────────────────────────────────
const bookCover = document.querySelector('.book-cover');
if (bookCover) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      bookCover.style.transform = `perspective(800px) rotateY(-8deg) translateY(${scrollY * 0.08}px)`;
    }
  }, { passive: true });
}

// ─── HERO BOOK MOUSE TILT ─────────────────────────────────
const heroBook = document.querySelector('.hero-book');
if (heroBook) {
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    if (window.scrollY < window.innerHeight * 0.5) {
      heroBook.style.transform = `perspective(800px) rotateY(${-8 + dx * 4}deg) rotateX(${-dy * 3}deg)`;
    }
  });
}

// Initial render
renderCart();

// Email capture
function handleEmailSubmit(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const btn = e.target.querySelector('button');
  btn.textContent = 'Thank you!';
  btn.disabled = true;
  input.disabled = true;
}
