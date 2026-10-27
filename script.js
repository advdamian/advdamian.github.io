/* ==========================================================================
   ADV SHOOTS — Interactive Cinematic Experience Script
   Brand: advshoots.me | Videography & Photography
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTimecode();
  initAmbientCanvas();
  initCinemaScopeToggle();
  initAudioSystem();
  initContactModal();
  initForms();
  init3DTilt();
});

/* ==========================================================================
   1. Live SMPTE Camera Timecode (24 FPS)
   ========================================================================== */
function initTimecode() {
  const display = document.getElementById('timecode-display');
  if (!display) return;

  let frames = 0;
  let seconds = 14;
  let minutes = 2;
  let hours = 1;

  setInterval(() => {
    frames++;
    if (frames >= 24) {
      frames = 0;
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
      }
    }

    const fStr = String(frames).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const hStr = String(hours).padStart(2, '0');

    display.textContent = `${hStr}:${mStr}:${sStr}:${fStr}`;
  }, 1000 / 24);
}

/* ==========================================================================
   2. Ambient Bokeh & Anamorphic Flare Canvas
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Track mouse for subtle parallax
  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  // Generate bokeh spheres
  const particleCount = 28;
  const particles = [];
  const colors = [
    'rgba(255, 94, 58, ',    // Cine Amber
    'rgba(245, 158, 11, ',   // Golden Glow
    'rgba(224, 86, 253, ',   // Neon Magenta
    'rgba(0, 242, 254, '     // Anamorphic Cyan
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 120 + 30,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.18 + 0.04,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2
    });
  }

  let tick = 0;

  function render() {
    tick += 0.01;
    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // Subtle anamorphic horizontal light streak across upper center
    const streakGrad = ctx.createLinearGradient(0, height * 0.35, width, height * 0.35);
    streakGrad.addColorStop(0, 'rgba(0, 242, 254, 0)');
    streakGrad.addColorStop(0.3, 'rgba(0, 242, 254, 0.025)');
    streakGrad.addColorStop(0.5, 'rgba(255, 94, 58, 0.045)');
    streakGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.025)');
    streakGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(0, height * 0.35 - 40, width, 80);

    // Draw bokeh orbs
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -p.radius) p.x = width + p.radius;
      if (p.x > width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = height + p.radius;
      if (p.y > height + p.radius) p.y = -p.radius;

      // Parallax shift based on cursor
      const dx = (mouseX - width / 2) * 0.025;
      const dy = (mouseY - height / 2) * 0.025;

      const currentAlpha = p.alpha + Math.sin(tick * p.pulseSpeed + p.pulseOffset) * 0.03;
      const grad = ctx.createRadialGradient(
        p.x + dx,
        p.y + dy,
        0,
        p.x + dx,
        p.y + dy,
        p.radius
      );
      grad.addColorStop(0, p.color + Math.max(0, currentAlpha) + ')');
      grad.addColorStop(0.6, p.color + Math.max(0, currentAlpha * 0.35) + ')');
      grad.addColorStop(1, p.color + '0)');

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(p.x + dx, p.y + dy, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   3. Web Audio API Synthesized Mechanical Camera Shutter Sound
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioSystem() {
  const btnToggle = document.getElementById('toggle-shutter-sound');
  if (!btnToggle) return;

  btnToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnToggle.classList.toggle('active', soundEnabled);
    triggerShutterFlash();
    playCameraShutter();
    showToast(soundEnabled ? 'Sunet obturator cameră: ACTIVAT' : 'Sunet obturator: DEZACTIVAT');
  });

  // Attach shutter click to logo
  const logo = document.querySelector('.brand');
  if (logo) {
    logo.addEventListener('click', () => {
      triggerShutterFlash();
      playCameraShutter();
    });
  }
}

function playCameraShutter() {
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;

    // First click (mirror up / shutter open)
    createShutterBladeSound(t);
    // Second click (shutter close / mirror down) ~65ms later
    createShutterBladeSound(t + 0.065);
  } catch (err) {
    console.warn('Audio not available:', err);
  }
}

function createShutterBladeSound(startTime) {
  const bufferSize = audioCtx.sampleRate * 0.05; // 50ms pulse
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill with shaped noise for mechanical click
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
  }

  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1800;
  bandpass.Q.value = 3.5;

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.7, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

  noiseNode.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noiseNode.start(startTime);
  noiseNode.stop(startTime + 0.05);
}

function triggerShutterFlash() {
  const flash = document.getElementById('shutter-flash');
  if (!flash) return;
  flash.classList.remove('flash-active');
  void flash.offsetWidth; // Force reflow
  flash.classList.add('flash-active');
}

/* ==========================================================================
   4. Cinema Scope (2.39:1) Letterbox Toggle
   ========================================================================== */
function initCinemaScopeToggle() {
  const toggleBtn = document.getElementById('toggle-cinema');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('cinema-active');
    const isActive = document.body.classList.contains('cinema-active');
    toggleBtn.classList.toggle('active', isActive);
    playCameraShutter();
    showToast(isActive ? 'Format Anamorphic 2.39:1 activat' : 'Format Fullscreen activat');
  });
}

/* ==========================================================================
   5. Contact Modal Logic
   ========================================================================== */
function initContactModal() {
  const modal = document.getElementById('contact-modal');
  const btnOpen = document.getElementById('btn-open-contact');
  const btnQuick = document.getElementById('btn-quick-inquiry');
  const btnClose = document.getElementById('modal-close');

  if (!modal) return;

  const openModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    playCameraShutter();
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  if (btnQuick) btnQuick.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Modal contact form submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const phone = document.getElementById('contact-phone').value;
      const type = document.getElementById('contact-type').value;
      const msg = document.getElementById('contact-message').value;

      // Store in localStorage for demo retention
      const inquiries = JSON.parse(localStorage.getItem('advshoots_inquiries') || '[]');
      inquiries.push({ name, phone, type, msg, date: new Date().toISOString() });
      localStorage.setItem('advshoots_inquiries', JSON.stringify(inquiries));

      playCameraShutter();
      closeModal();
      contactForm.reset();
      showToast(`Mulțumim, ${name}! Cererea ta a fost înregistrată.`);
    });
  }
}

/* ==========================================================================
   6. Notify / Newsletter Form
   ========================================================================== */
function initForms() {
  const notifyForm = document.getElementById('notify-form');
  const notifyEmail = document.getElementById('notify-email');
  const formFeedback = document.getElementById('form-feedback');

  if (!notifyForm) return;

  notifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = notifyEmail.value.trim();

    if (!email || !email.includes('@')) {
      formFeedback.textContent = 'Te rugăm să introduci o adresă de email validă.';
      formFeedback.className = 'form-feedback error';
      return;
    }

    // Save subscriber
    const subs = JSON.parse(localStorage.getItem('advshoots_subscribers') || '[]');
    if (!subs.includes(email)) {
      subs.push(email);
      localStorage.setItem('advshoots_subscribers', JSON.stringify(subs));
    }

    playCameraShutter();
    triggerShutterFlash();

    formFeedback.textContent = '✓ Te-ai abonat cu succes! Vei primi notificare când lansăm.';
    formFeedback.className = 'form-feedback success';
    notifyEmail.value = '';

    showToast('Email salvat! Vei fi primul care vede noul showreel.');

    setTimeout(() => {
      formFeedback.textContent = '';
      formFeedback.className = 'form-feedback';
    }, 6000);
  });
}

/* ==========================================================================
   7. 3D Card Tilt Effect on Hover
   ========================================================================== */
function init3DTilt() {
  const cards = document.querySelectorAll('.teaser-card[data-tilt]');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* ==========================================================================
   8. Toast Notification Utility
   ========================================================================== */
let toastTimeout = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
