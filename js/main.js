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
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
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

/* ─── HERO CANVAS — PARTICLE NETWORK ─────── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  const ACCENT = '#e63535';
  const ACCENT2 = '#c8a800';
  const COUNT = 72;
  const CONNECT_DIST = 140;
  const REPEL_DIST = 160;

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -10;
      this.vx = (Math.random() - .5) * .45;
      this.vy = (Math.random() - .5) * .45;
      this.r  = Math.random() * 2 + 1;
      this.baseR = this.r;
      this.alpha = Math.random() * .5 + .3;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * .02 + .008;
      this.color = Math.random() > .15 ? ACCENT : ACCENT2;
      this.energy = Math.random() > .8;
    }
    update() {
      this.pulse += this.pulseSpeed;
      if (this.energy) {
        this.r = this.baseR + Math.sin(this.pulse) * 1.2;
      }

      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < REPEL_DIST && dist > 0) {
        const force = (REPEL_DIST - dist) / REPEL_DIST;
        this.x += (dx / dist) * force * 2.5;
        this.y += (dy / dist) * force * 2.5;
      }

      this.x += this.vx; this.y += this.vy;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;

      if (this.energy) {
        ctx.shadowBlur = 14; ctx.shadowColor = this.color;
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * .22;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = ACCENT;
          ctx.lineWidth = .8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  let tick = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);

    // subtle radial glow center
    if (tick % 3 === 0) {
      const grad = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, W*.45);
      grad.addColorStop(0, 'rgba(230,53,53,.025)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    connect();
    particles.forEach(p => { p.update(); p.draw(); });
    tick++;
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  window.addEventListener('resize', init);
  init(); loop();
})();

/* ─── HERO REVEAL ─────────────────────────── */
function triggerHeroReveal() {
  const heroEls = document.querySelectorAll('#hero .reveal-up');
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120 + 100);
  });
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
    if (!el.closest('#hero')) observer.observe(el);
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
