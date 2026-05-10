/* =============================================
   DIDIER ACHACH — main.js
   ============================================= */

/* ─── PRELOADER ───────────────────────────── */
(function () {
  const loader = document.getElementById('preloader');
  const bar    = document.querySelector('.pre-bar');
  const count  = document.querySelector('.pre-count');
  let pct = 0;

  const tick = setInterval(() => {
    pct += Math.random() * 12 + 2;
    if (pct >= 100) { pct = 100; clearInterval(tick); done(); }
    bar.style.width = pct + '%';
    count.textContent = Math.floor(pct) + '%';
  }, 80);

  function done() {
    setTimeout(() => {
      loader.classList.add('done');
      document.body.style.overflow = '';
      triggerHeroReveal();
    }, 300);
  }

  document.body.style.overflow = 'hidden';
})();

/* ─── NOISE CANVAS ────────────────────────── */
(function () {
  const c = document.getElementById('noise');
  const ctx = c.getContext('2d');
  let w, h, frame = 0;

  function resize() { c.width = w = window.innerWidth; c.height = h = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function drawNoise() {
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    frame++;
    requestAnimationFrame(drawNoise);
  }
  drawNoise();
})();

/* ─── CUSTOM CURSOR ───────────────────────── */
(function () {
  const cur = document.getElementById('cursor');
  const fol = document.getElementById('cursor-follower');
  if (!cur || !fol) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function loop() {
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    fx += (mx - fx) * .12; fy += (my - fy) * .12;
    fol.style.left = fx + 'px'; fol.style.top = fy + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .magnetic, .service-card, .testimonial-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ─── MAGNETIC BUTTONS ────────────────────── */
(function () {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * .2}px, ${dy * .25}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ─── HEADER SCROLL ───────────────────────── */
(function () {
  const header = document.getElementById('header');
  const hero   = document.getElementById('hero');
  window.addEventListener('scroll', () => {
    const threshold = hero ? hero.offsetHeight - header.offsetHeight : 60;
    header.classList.toggle('scrolled', window.scrollY > threshold);
  }, { passive: true });
})();

/* ─── MOBILE MENU ─────────────────────────── */
(function () {
  const btn   = document.getElementById('menuToggle');
  const menu  = document.getElementById('mobileMenu');
  if (!btn) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
})();

/* ─── HERO PLAY-ONCE ─────────────────────────── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx      = canvas.getContext('2d');
  const TOTAL    = 286;
  const FRAME_MS = 41; // ~24fps
  const SRC_W    = 1280, SRC_H = 720;

  canvas.width  = SRC_W;
  canvas.height = SRC_H;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const images = [];
  let loaded   = 0;

  for (let i = 0; i < TOTAL; i++) {
    const img = new Image();
    img.src   = `img/frames/frame_${String(i).padStart(3,'0')}_delay-0.041s.jpg`;
    img.onload = () => {
      if (++loaded === TOTAL) {
        canvas.classList.add('ready');
        ctx.drawImage(images[0], 0, 0, SRC_W, SRC_H); // muestra primer frame
        requestAnimationFrame(tick);
      }
    };
    images.push(img);
  }

  let frame          = 0;
  let lastTime       = 0;
  let gooeyTriggered = false;

  function tick(ts) {
    if (frame >= TOTAL - 1) return; // congelado en último frame
    if (ts - lastTime >= FRAME_MS) {
      frame++;
      ctx.drawImage(images[frame], 0, 0, SRC_W, SRC_H);
      lastTime = ts;
      if (!gooeyTriggered && frame >= TOTAL - 44) {
        gooeyTriggered = true;
        triggerGooeyWords();
      }
    }
    requestAnimationFrame(tick);
  }
})();

/* ─── HERO REVEAL ─────────────────────────── */
function triggerHeroReveal() {
  const heroEls = document.querySelectorAll('#hero .reveal-up');
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120 + 100);
  });
}

function triggerGooeyWords() {
  const words = document.querySelector('.hero-words');
  const hwl   = document.querySelector('.hw-l');
  const hwr   = document.querySelector('.hw-r');
  if (!words || !hwl || !hwr) return;
  words.style.filter = 'url(#gooey)';
  hwl.classList.add('gooey-animate');
  hwr.classList.add('gooey-animate');
  hwr.addEventListener('animationend', () => { words.style.filter = ''; }, { once: true });
}

/* ─── SCROLL REVEAL ───────────────────────── */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), +delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    if (!el.closest('#hero') && !el.closest('.h-flex')) observer.observe(el);
  });
})();

/* ─── COUNTERS ────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.counter, .h-stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      if (!target) return;
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
      }, 20);
      observer.unobserve(el);
    });
  }, { threshold: .5 });

  counters.forEach(el => observer.observe(el));
})();

/* ─── ÁTOMO 3D HERO ──────────────────────── */
(function () {
  const atomCanvas = document.getElementById('atom-canvas');
  if (!atomCanvas || typeof THREE === 'undefined') return;

  let W = atomCanvas.offsetWidth || 560;
  let H = atomCanvas.offsetHeight || 580;

  const renderer = new THREE.WebGLRenderer({ canvas: atomCanvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.z = 9;

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const lA = new THREE.PointLight(0xe63535, 1.5, 20); lA.position.set(-4, 3, 5); scene.add(lA);
  const lB = new THREE.PointLight(0xf5de00, 1.2, 20); lB.position.set(4, -3, 5); scene.add(lB);

  const atomGroup  = new THREE.Group();
  const logoGroup  = new THREE.Group();
  atomGroup.add(logoGroup);
  scene.add(atomGroup);

  const img = new Image();
  img.onload = () => {
    const tex = new THREE.Texture(img); tex.needsUpdate = true;
    const logoSize = 5.0;
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(logoSize, logoSize * (912 / 1440)),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, depthWrite: false })
    );
    logo.position.z = 0.05; logoGroup.add(logo);
    [[0.12, 1.1], [0.06, 1.22], [0.03, 1.36]].forEach(([op, s]) => {
      const gm = new THREE.Mesh(
        new THREE.PlaneGeometry(logoSize * s, logoSize * (912 / 1440) * s),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.01, opacity: op, side: THREE.DoubleSide, depthWrite: false })
      );
      gm.position.z = -(s - 1) * 1.2; logoGroup.add(gm);
    });
  };
  img.src = 'img/logo-notext.png';

  const orbitsConfig = [
    { r: 2.2, speed:  1.1, rx: 15, ry:  0, rz:  0, eCol: 0xe63535, eSz: 0.16 },
    { r: 2.8, speed: -0.8, rx: 75, ry: 30, rz: 15, eCol: 0xf5de00, eSz: 0.15 },
    { r: 3.4, speed:  1.0, rx: 40, ry: 50, rz: 30, eCol: 0x4a9e2f, eSz: 0.15 },
  ];

  const electrons = [];
  orbitsConfig.forEach(cfg => {
    const og = new THREE.Group();
    og.rotation.x = THREE.MathUtils.degToRad(cfg.rx);
    og.rotation.y = THREE.MathUtils.degToRad(cfg.ry);
    og.rotation.z = THREE.MathUtils.degToRad(cfg.rz);
    atomGroup.add(og);

    const eMesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.eSz, 16, 16),
      new THREE.MeshBasicMaterial({ color: cfg.eCol, depthTest: false }));
    eMesh.renderOrder = 10;

    const hMesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.eSz * 2.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: cfg.eCol, transparent: true, opacity: 0.22, depthTest: false }));
    hMesh.renderOrder = 10;

    og.add(eMesh); og.add(hMesh);

    const trail = [];
    for (let i = 1; i <= 5; i++) {
      const tm = new THREE.Mesh(new THREE.SphereGeometry(cfg.eSz * (1 - 0.15 * i), 8, 8),
        new THREE.MeshBasicMaterial({ color: cfg.eCol, transparent: true, opacity: 0.55 - 0.1 * i, depthTest: false }));
      tm.renderOrder = 10;
      og.add(tm); trail.push(tm);
    }
    electrons.push({ og, eMesh, hMesh, trail, r: cfg.r, speed: cfg.speed, angle: Math.random() * Math.PI * 2 });
  });

  let tx = 0, ty = 0, cx = 0, cy = 0, t = 0;
  document.addEventListener('mousemove', e => {
    tx = (e.clientX / window.innerWidth  - 0.5) * 1.4;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.9;
  });

  const ro = new ResizeObserver(() => {
    W = atomCanvas.offsetWidth; H = atomCanvas.offsetHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });
  ro.observe(atomCanvas);

  (function loop() {
    requestAnimationFrame(loop); t += 0.012;
    cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
    atomGroup.rotation.y = cx; atomGroup.rotation.x = -cy * 0.6;
    logoGroup.position.y = Math.sin(t * 0.7) * 0.08;
    electrons.forEach(e => {
      e.angle += e.speed * 0.012;
      const x = Math.cos(e.angle) * e.r, y = Math.sin(e.angle) * e.r;
      e.eMesh.position.set(x, y, 0); e.hMesh.position.set(x, y, 0);
      e.trail.forEach((tm, i) => {
        const a = e.angle - (i + 1) * 0.12 * Math.sign(e.speed);
        tm.position.set(Math.cos(a) * e.r, Math.sin(a) * e.r, 0);
      });
    });
    lA.position.x = Math.cos(t * 0.3) * 6; lA.position.y = Math.sin(t * 0.25) * 5;
    lB.position.x = Math.cos(t * 0.25 + Math.PI) * 6;
    renderer.render(scene, camera);
  })();
})();

/* ─── CONTACT FORM ────────────────────────── */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '¡Mensaje enviado! ✓';
    btn.style.background = '#25d366';
    btn.style.borderColor = '#25d366';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Enviar mensaje →';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      form.reset();
    }, 3000);
  });
})();

/* ─── BEAMS BACKGROUND — SERVICIOS ──────────── */
(function () {
  const section = document.getElementById('servicios');
  if (!section) return;

  // Canvas
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0',
    width: '100%', height: '100%',
    zIndex: '0', pointerEvents: 'none',
    filter: 'blur(15px)',
  });
  section.insertBefore(canvas, section.firstChild);

  // Pulsing overlay
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'absolute', inset: '0',
    zIndex: '1', pointerEvents: 'none',
    backdropFilter: 'blur(50px)',
    background: 'rgba(10,10,10,0.05)',
    animation: 'beams-pulse 10s ease-in-out infinite',
  });
  canvas.insertAdjacentElement('afterend', overlay);

  if (!document.getElementById('beams-style')) {
    const s = document.createElement('style');
    s.id = 'beams-style';
    s.textContent = `@keyframes beams-pulse { 0%,100%{opacity:.05} 50%{opacity:.15} }`;
    document.head.appendChild(s);
  }

  const container = section.querySelector('.container');
  if (container) { container.style.position = 'relative'; container.style.zIndex = '2'; }

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, beams = [], animId = null;
  const TOTAL = 30;

  // Rojo #e63535 → h:0, Amarillo #f5de00 → h:53, Verde #4a9e2f → h:107, Magenta #C2185B → h:337
  const BRAND_HUES = [0, 53, 107, 337];
  const randHue = () => BRAND_HUES[Math.floor(Math.random() * BRAND_HUES.length)];

  function createBeam() {
    return {
      x: Math.random() * W * 1.5 - W * 0.25,
      y: Math.random() * H * 1.5 - H * 0.25,
      width: 30 + Math.random() * 60,
      length: H * 2.5,
      angle: -35 + Math.random() * 10,
      speed: 3 + Math.random() * 4,
      opacity: 0.12 + Math.random() * 0.16,
      hue: randHue(),
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  function resetBeam(b, i) {
    const col = i % 3, spacing = W / 3;
    b.y = H + 100;
    b.x = col * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
    b.width = 100 + Math.random() * 100;
    b.speed = 3 + Math.random() * 4;
    b.hue = randHue();
    b.opacity = 0.2 + Math.random() * 0.1;
  }

  function drawBeam(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle * Math.PI / 180);
    const op = b.opacity * (0.8 + Math.sin(b.pulse) * 0.2);
    const g = ctx.createLinearGradient(0, 0, 0, b.length);
    g.addColorStop(0,   `hsla(${b.hue},85%,65%,0)`);
    g.addColorStop(0.1, `hsla(${b.hue},85%,65%,${op * 0.5})`);
    g.addColorStop(0.4, `hsla(${b.hue},85%,65%,${op})`);
    g.addColorStop(0.6, `hsla(${b.hue},85%,65%,${op})`);
    g.addColorStop(0.9, `hsla(${b.hue},85%,65%,${op * 0.5})`);
    g.addColorStop(1,   `hsla(${b.hue},85%,65%,0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-b.width / 2, 0, b.width, b.length);
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    ctx.filter = 'blur(35px)';
    beams.forEach((b, i) => {
      b.y -= b.speed;
      b.pulse += b.pulseSpeed;
      if (b.y + b.length < -100) resetBeam(b, i);
      drawBeam(b);
    });
    animId = requestAnimationFrame(animate);
  }

  function resize() {
    W = section.offsetWidth;
    H = section.offsetHeight || window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    beams = Array.from({ length: TOTAL }, createBeam);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
})();

/* ─── HORIZONTAL SCROLL TRACK ───────────── */
(function () {
  const track  = document.querySelector('.h-track');
  const sticky = document.querySelector('.h-sticky');
  const flex   = document.querySelector('.h-flex');
  if (!track || !flex) return;

  const PANELS    = 3;
  const activated = [];
  let   snapTimer = null;

  function activatePanel(idx) {
    if (activated[idx]) return;
    activated[idx] = true;
    const panel = flex.children[idx];
    if (!panel) return;
    panel.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), +delay);
    });
  }

  // Dots
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'h-progress';
  const dots = Array.from({ length: PANELS }, (_, i) => {
    const d = document.createElement('span');
    d.className = 'h-dot' + (i === 0 ? ' active' : '');
    return d;
  });
  dots.forEach(d => dotsWrap.appendChild(d));
  sticky.appendChild(dotsWrap);

  // Scroll hint
  const hint = document.createElement('div');
  hint.className = 'h-scroll-hint';
  hint.innerHTML = '<span>SCROLL</span><div class="h-hint-arrow">→</div>';
  sticky.appendChild(hint);

  function snapToPanel(idx) {
    const maxScroll = track.offsetHeight - window.innerHeight;
    const target    = track.offsetTop + (idx / (PANELS - 1)) * maxScroll;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  function scheduleSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      const ms = track.offsetHeight - window.innerHeight;
      const s  = window.scrollY - track.offsetTop;
      // User has exited the track (forward or backward) — do NOT snap
      if (s <= 0 || s >= ms) return;
      const p       = s / ms;
      const snapIdx = Math.round(p * (PANELS - 1));
      const target  = track.offsetTop + (snapIdx / (PANELS - 1)) * ms;
      if (Math.abs(window.scrollY - target) > 8) {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }, 120);
  }

  function update() {
    if (window.innerWidth <= 900) {
      flex.style.transform = '';
      dotsWrap.style.display = 'none';
      hint.style.display = 'none';
      for (let i = 0; i < PANELS; i++) activatePanel(i);
      return;
    }
    dotsWrap.style.display = '';

    const scrolled  = window.scrollY - track.offsetTop;
    const maxScroll = track.offsetHeight - window.innerHeight;
    // Only run within the track
    if (scrolled < 0 || scrolled > maxScroll + window.innerHeight) return;

    const progress  = Math.max(0, Math.min(1, scrolled / maxScroll));
    const maxX      = flex.scrollWidth - window.innerWidth;
    // Use integer pixels to avoid subpixel blur
    flex.style.transform = `translateX(-${Math.round(progress * maxX)}px)`;

    const activePanel = Math.round(progress * (PANELS - 1));
    dots.forEach((d, i) => d.classList.toggle('active', i === activePanel));
    hint.style.opacity = progress < 0.06 ? '1' : '0';

    // Activate panel reveals
    const thresholds = [0, 0.38, 0.72];
    for (let i = 0; i < PANELS; i++) {
      if (progress >= thresholds[i]) activatePanel(i);
    }

    // Snap to nearest panel when scroll stops (only if still inside track)
    scheduleSnap();
  }

  // Nav link override
  const panelMap = { 'sobre-mi': 0, 'proceso': 1, 'testimonios': 2 };
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href').slice(1);
    if (!(id in panelMap)) return;
    link.addEventListener('click', e => {
      if (window.innerWidth <= 900) return;
      e.preventDefault();
      snapToPanel(panelMap[id]);
    });
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { clearTimeout(snapTimer); update(); });
  update();
})();

/* ─── LOCATION MAP ───────────────────────── */
(function () {
  const card = document.getElementById('lmCard');
  const hint = document.getElementById('lmHint');
  if (!card) return;

  let expanded = false;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const dx = Math.max(-60, Math.min(60, e.clientX - (rect.left + rect.width  / 2)));
    const dy = Math.max(-60, Math.min(60, e.clientY - (rect.top  + rect.height / 2)));
    const ry =  (dx / 60) * 8;
    const rx = -(dy / 60) * 8;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    if (!expanded && hint) {
      hint.style.opacity = '1';
      hint.style.transform = 'translateX(-50%) translateY(0)';
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    if (hint) {
      hint.style.opacity = '0';
      hint.style.transform = 'translateX(-50%) translateY(4px)';
    }
  });

  card.addEventListener('click', (e) => {
    if (e.target.closest('.lm-link')) return;
    expanded = !expanded;
    card.classList.toggle('expanded', expanded);
    if (hint) hint.style.opacity = '0';
  });
})();

/* ─── SPOTLIGHT — contacto ───────────────── */
(function () {
  if (typeof gsap === 'undefined') return;
  gsap.to('.spotlight-left', {
    keyframes: [
      { xPercent: 20, yPercent: -20, rotate: 15, duration: 4 },
      { xPercent: -20, yPercent: 20, rotate: -15, duration: 4 },
      { xPercent: 0, yPercent: 0, rotate: 0, duration: 4 }
    ],
    repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
  gsap.to('.spotlight-mid', {
    keyframes: [
      { xPercent: 20, yPercent: 30, rotate: 0, duration: 5 },
      { xPercent: -20, yPercent: 10, rotate: 20, duration: 5 },
      { xPercent: 0, yPercent: 0, rotate: -20, duration: 5 }
    ],
    delay: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
  gsap.to('.spotlight-right', {
    keyframes: [
      { xPercent: -30, yPercent: -20, rotate: -10, duration: 6 },
      { xPercent: 10, yPercent: 20, rotate: 25, duration: 6 },
      { xPercent: 0, yPercent: 0, rotate: 10, duration: 6 }
    ],
    delay: 5, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
})();

/* ─── SHAPES — sobre-mi & proceso ────────── */
(function () {
  ['sobre-mi', 'proceso'].forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        sec.classList.add('shapes-active');
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(sec);
  });
})();

