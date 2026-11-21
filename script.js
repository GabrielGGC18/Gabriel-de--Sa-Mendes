/* =======================================================
   Portfólio Gabriel de Sá Mendes — interações
   Vanilla JS, sem build step.
   ======================================================= */
(() => {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano no rodapé ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Tema (persistido) ---------- */
  const themeBtn = $('#themeBtn');
  const themeIcon = themeBtn && themeBtn.querySelector('i');
  const readTheme = () => {
    try { return localStorage.getItem('gsm-theme'); } catch { return null; }
  };
  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    if (themeIcon) themeIcon.className = t === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(t === 'light'));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f5eee2' : '#0d0b0a');
  };
  // o script inline no <head> já escolheu o tema (salvo ou do sistema)
  applyTheme(readTheme() || document.documentElement.getAttribute('data-theme') || 'dark');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('gsm-theme', next); } catch {}
  });

  /* ---------- Menu mobile ---------- */
  const navToggle = $('#navToggle'), navList = $('#navList');
  const mobileNav = matchMedia('(max-width: 940px)');
  const setNav = (open) => {
    if (!navToggle || !navList) return;
    navList.classList.toggle('is-open', open);
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    // menu fechado no mobile não deve receber foco por Tab
    navList.inert = mobileNav.matches && !open;
  };
  if (navToggle && navList) {
    setNav(false);
    mobileNav.addEventListener('change', () => setNav(false));
    navToggle.addEventListener('click', () => setNav(!navList.classList.contains('is-open')));
    navList.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('click', (e) => {
      if (navList.classList.contains('is-open') && !e.target.closest('#siteNav')) setNav(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      revealObs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  $$('.reveal').forEach((el) => revealObs.observe(el));

  /* ---------- Barras de skill ---------- */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      barObs.unobserve(en.target);
    });
  }, { threshold: 0.4 });
  $$('.bar').forEach((el) => barObs.observe(el));

  /* ---------- Typewriter ---------- */
  const typed = $('#typed');
  if (typed) {
    const roles = [
      'Desenvolvedor Full Stack',
      'Python · Django · FastAPI',
      'React · TypeScript',
      'Automação & Integrações',
      'Idealizador da Mídia Startup',
      'Portal do SEI · Django'
    ];
    if (reduced) {
      typed.textContent = roles[0];
    } else {
      let i = 0, c = 0, deleting = false;
      const loop = () => {
        const word = roles[i];
        c += deleting ? -1 : 1;
        typed.textContent = word.slice(0, c);
        let delay = deleting ? 40 : 75;
        if (!deleting && c === word.length) { delay = 1600; deleting = true; }
        else if (deleting && c === 0) { deleting = false; i = (i + 1) % roles.length; delay = 320; }
        setTimeout(loop, delay);
      };
      loop();
    }
  }

  /* ---------- Progresso de scroll + nav sticky + active link ---------- */
  const progress = $('#scrollProgress'), siteNav = $('#siteNav'), backToTop = $('#backToTop');
  const navLinks = $$('.nav-list a[href^="#"]');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (siteNav) siteNav.classList.toggle('is-stuck', y > 8);
    if (backToTop) backToTop.classList.toggle('show', y > 420);

    let current = null;
    sections.forEach((sec) => { if (sec.getBoundingClientRect().top <= 130) current = sec.id; });
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  if (backToTop) backToTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));


  /* ---------- Cartão de identidade: tilt + virada automática ----------
     Gira sozinho entre a foto e o crachá dev a cada FLIP_MS. Pausa com o mouse
     ou o foco em cima e fora da tela; o botão vira na hora. */
  const idcard = $('#idcard');
  if (idcard) {
    const front = $('.idcard-front', idcard), back = $('.idcard-back', idcard);
    const flipBtn = $('#idcardFlip');
    const FLIP_MS = 5600;
    let flipped = false, flipTimer = null, hoveringCard = false, cardOnScreen = true;
    const paintFlip = () => {
      idcard.classList.toggle('is-flipped', flipped);
      front.inert = flipped; back.inert = !flipped;
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
      if (flipBtn) flipBtn.setAttribute('aria-label', flipped ? 'Mostrar a foto' : 'Mostrar o crachá');
    };
    const syncFlip = () => {
      clearTimeout(flipTimer); flipTimer = null;
      const running = !reduced && !hoveringCard && cardOnScreen && !document.hidden;
      idcard.classList.remove('is-timing');
      if (!running) return;
      void idcard.offsetWidth; // reinicia o anel
      idcard.style.setProperty('--flip-ms', FLIP_MS + 'ms');
      idcard.classList.add('is-timing');
      flipTimer = setTimeout(() => { flipped = !flipped; paintFlip(); syncFlip(); }, FLIP_MS);
    };
    if (flipBtn) flipBtn.addEventListener('click', () => { flipped = !flipped; paintFlip(); syncFlip(); });
    idcard.addEventListener('pointerenter', () => { hoveringCard = true; syncFlip(); });
    idcard.addEventListener('pointerleave', () => { hoveringCard = false; syncFlip(); });
    idcard.addEventListener('focusin', () => { hoveringCard = true; syncFlip(); });
    idcard.addEventListener('focusout', () => { hoveringCard = false; syncFlip(); });
    document.addEventListener('visibilitychange', syncFlip);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { cardOnScreen = en.isIntersecting; syncFlip(); }, { threshold: 0.3 }).observe(idcard);
    }
    paintFlip();
    syncFlip();

    if (!reduced && matchMedia('(hover: hover)').matches) {
      idcard.addEventListener('pointermove', (e) => {
        const r = idcard.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        idcard.style.transform = `perspective(1100px) rotateY(${px * 16}deg) rotateX(${-py * 12}deg)`;
        idcard.style.setProperty('--gx', (px + 0.5) * 100 + '%');
        idcard.style.setProperty('--gy', (py + 0.5) * 100 + '%');
      });
      idcard.addEventListener('pointerleave', () => { idcard.style.transform = ''; });
    }
  }

  /* Cores da paleta lidas do CSS (mudam com o tema) */
  const palette = { accent: [242, 179, 61], accent2: [255, 106, 61], accent3: [63, 214, 184], bg: [13, 11, 10] };
  const hexToRgb = (h) => {
    h = h.trim().replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return Number.isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const readPalette = () => {
    const cs = getComputedStyle(document.documentElement);
    [['accent', '--accent'], ['accent2', '--accent-2'], ['accent3', '--accent-3'], ['bg', '--bg']].forEach(([k, v]) => {
      const rgb = hexToRgb(cs.getPropertyValue(v));
      if (rgb) palette[k] = rgb;
    });
  };
  readPalette();
  new MutationObserver(readPalette).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* ---------- Palco 3D abaixo da foto ----------
     Projeção em perspectiva de verdade: piso infinito andando em direção à
     câmera, sol nascendo no horizonte e sólidos em wireframe girando. */
  const stage = $('#stage3d');
  if (stage) {
    const sctx = stage.getContext('2d');
    let sw = 0, sh = 0, sOnScreen = true, last = performance.now(), t = 0, camX = 0, camXTarget = 0;

    const solid = (verts, edges) => ({ verts, edges });
    const cube = solid(
      [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z]))),
      [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]]
    );
    const octa = solid(
      [[1.4,0,0],[-1.4,0,0],[0,1.4,0],[0,-1.4,0],[0,0,1.4],[0,0,-1.4]],
      [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]]
    );
    const PHI = (1 + Math.sqrt(5)) / 2;
    const icoV = [[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]]
      .map((v) => v.map((c) => c * 0.75));
    const icoE = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
      const d = Math.hypot(icoV[i][0] - icoV[j][0], icoV[i][1] - icoV[j][1], icoV[i][2] - icoV[j][2]);
      if (d < 1.6) icoE.push([i, j]);
    }
    const ico = solid(icoV, icoE);
    // posição no mundo (x, altura, profundidade), escala, cor e velocidade de giro
    const actors = [
      { s: cube, x: -2.5, y: 0.95, z: 5.2, k: 0.5,  c: 'accent', sp: 0.55, ph: 0 },
      { s: ico,  x: 2.5,  y: 1.0,  z: 5.4, k: 0.62, c: 'accent2', sp: -0.42, ph: 2 },
      { s: octa, x: 0.1,  y: 0.75, z: 3.6, k: 0.28, c: 'accent3', sp: 0.8, ph: 4 }
    ];

    const resizeStage = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = stage.getBoundingClientRect();
      sw = r.width; sh = r.height;
      stage.width = Math.round(sw * dpr); stage.height = Math.round(sh * dpr);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawStage = () => {
      if (!sw || !sh) return;
      const f = sw * 0.42, hy = sh * 0.46, cx = sw / 2 + camX * sw * 0.04, CAM_H = 1;
      const P = (x, y, z) => [cx + (x - camX * 0.4) * f / z, hy + (CAM_H - y) * f / z];
      const { accent, accent2, accent3, bg } = palette;
      sctx.clearRect(0, 0, sw, sh);

      // sol nascendo, com faixas recortadas
      const R = sw * 0.2, sx = cx, sy = hy;
      sctx.save();
      sctx.beginPath(); sctx.rect(0, 0, sw, hy); sctx.clip();
      const glow = sctx.createRadialGradient(sx, sy, R * 0.2, sx, sy, R * 2.4);
      glow.addColorStop(0, rgba(accent2, 0.35)); glow.addColorStop(1, rgba(accent2, 0));
      sctx.fillStyle = glow; sctx.fillRect(0, 0, sw, hy);
      const sun = sctx.createLinearGradient(0, sy - R, 0, sy);
      sun.addColorStop(0, rgba(accent, 1)); sun.addColorStop(1, rgba(accent2, 1));
      sctx.fillStyle = sun;
      sctx.beginPath(); sctx.arc(sx, sy, R, Math.PI, 0); sctx.fill();
      sctx.globalCompositeOperation = 'destination-out';
      // faixas descendo pelo sol, mais grossas perto do horizonte
      const gap = R * 0.13, drift = (t * R * 0.05) % gap;
      for (let i = 0; i < 5; i++) {
        const yy = sy - R * 0.04 - i * gap + drift;
        sctx.fillRect(sx - R, yy, R * 2, Math.max(1, R * 0.065 * (1 - i / 5)));
      }
      sctx.restore();

      // piso: linhas convergindo + linhas andando para a câmera
      sctx.save();
      sctx.beginPath(); sctx.rect(0, hy, sw, sh - hy); sctx.clip();
      const floorFill = sctx.createLinearGradient(0, hy, 0, sh);
      floorFill.addColorStop(0, rgba(accent2, 0.16)); floorFill.addColorStop(1, rgba(bg, 0));
      sctx.fillStyle = floorFill; sctx.fillRect(0, hy, sw, sh - hy);
      sctx.lineWidth = 1;
      const ZN = 1.2, ZF = 40;
      for (let i = -14; i <= 14; i++) {
        const a = P(i * 0.9, 0, ZN), b = P(i * 0.9, 0, ZF);
        const g = sctx.createLinearGradient(0, a[1], 0, b[1]);
        g.addColorStop(0, rgba(accent, 0.55)); g.addColorStop(1, rgba(accent, 0));
        sctx.strokeStyle = g;
        sctx.beginPath(); sctx.moveTo(a[0], a[1]); sctx.lineTo(b[0], b[1]); sctx.stroke();
      }
      const DZ = 1.4, off = (t * 1.6) % DZ;
      for (let z = ZN + DZ - off; z < ZF; z += DZ) {
        const y = P(0, 0, z)[1];
        sctx.strokeStyle = rgba(accent, Math.min(0.55, 2.2 / z));
        sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(sw, y); sctx.stroke();
      }
      sctx.restore();
      sctx.strokeStyle = rgba(accent, 0.7);
      sctx.beginPath(); sctx.moveTo(0, hy); sctx.lineTo(sw, hy); sctx.stroke();

      // brilho no piso sob o cartão
      const under = sctx.createRadialGradient(cx, hy + sh * 0.08, 0, cx, hy + sh * 0.08, sw * 0.32);
      under.addColorStop(0, rgba(accent, 0.22)); under.addColorStop(1, rgba(accent, 0));
      sctx.fillStyle = under; sctx.fillRect(0, hy, sw, sh - hy);

      // sólidos (do mais longe para o mais perto)
      actors.slice().sort((p, q) => q.z - p.z).forEach((o) => {
        const col = palette[o.c];
        const bob = Math.sin(t * 1.3 + o.ph) * 0.12;
        const y = o.y + bob;
        // sombra no chão
        const [shx, shy] = P(o.x, 0, o.z);
        const shr = (o.k * 1.6 * f) / o.z * (1 - bob);
        sctx.fillStyle = rgba(col, 0.22);
        sctx.beginPath(); sctx.ellipse(shx, shy, shr, shr * 0.22, 0, 0, Math.PI * 2); sctx.fill();

        const ay = t * o.sp + o.ph, ax = 0.5 + Math.sin(t * 0.3 + o.ph) * 0.3;
        const cy = Math.cos(ay), sy2 = Math.sin(ay), cxr = Math.cos(ax), sxr = Math.sin(ax);
        const pts = o.s.verts.map(([vx, vy, vz]) => {
          let x = vx * cy + vz * sy2, z = -vx * sy2 + vz * cy, yy = vy;
          const y2 = yy * cxr - z * sxr; z = yy * sxr + z * cxr; yy = y2;
          const p = P(o.x + x * o.k, y + yy * o.k, o.z + z * o.k);
          return [p[0], p[1], z];
        });
        sctx.lineCap = 'round';
        o.s.edges.forEach(([i, j]) => {
          const depth = ((pts[i][2] + pts[j][2]) / 2 + 1.6) / 3.2; // 0 perto, 1 longe
          sctx.strokeStyle = rgba(col, 1 - depth * 0.75);
          sctx.lineWidth = 1.8 - depth * 0.9;
          sctx.beginPath(); sctx.moveTo(pts[i][0], pts[i][1]); sctx.lineTo(pts[j][0], pts[j][1]); sctx.stroke();
        });
        sctx.fillStyle = rgba(col, 0.95);
        pts.forEach((p) => { sctx.beginPath(); sctx.arc(p[0], p[1], 1.6, 0, Math.PI * 2); sctx.fill(); });
      });
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      t += dt;
      camX += (camXTarget - camX) * 0.06;
      drawStage();
      if (sOnScreen && !document.hidden) requestAnimationFrame(loop);
      else running = false;
    };
    let running = false;
    const start = () => {
      if (reduced) { drawStage(); return; }
      if (running || !sOnScreen || document.hidden) return;
      running = true; last = performance.now(); requestAnimationFrame(loop);
    };
    resizeStage();
    t = 1.2; drawStage();
    if ('ResizeObserver' in window) new ResizeObserver(() => { resizeStage(); drawStage(); }).observe(stage);
    new MutationObserver(() => requestAnimationFrame(drawStage)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { sOnScreen = en.isIntersecting; start(); }).observe(stage);
    }
    document.addEventListener('visibilitychange', start);
    if (!reduced) addEventListener('pointermove', (e) => { camXTarget = (e.clientX / innerWidth - 0.5) * 2; }, { passive: true });
    start();
  }

  /* ---------- Botões magnéticos ---------- */
  if (!reduced && matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Cursor glow ---------- */
  const glow = $('#cursorGlow');
  if (glow && !reduced) {
    addEventListener('pointermove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }, { passive: true });
  }

  /* ---------- Vaga-lumes do cerrado (fundo) ----------
     Pontos dourados e cor de brasa subindo devagar e piscando. */
  const canvas = $('#bgCanvas');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, flies = [];
    const resize = () => {
      // no mobile a barra de endereço muda só a altura ao rolar: não recria os pontos
      const widthChanged = innerWidth !== w;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!widthChanged && flies.length) return;
      const count = Math.min(w < 700 ? 26 : 55, Math.floor((w * h) / 22000));
      flies = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.8 + Math.random() * 1.6,
        vy: 0.08 + Math.random() * 0.22, sway: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 1.4, ph: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.3
      }));
    };
    let tt = 0, bgRunning = false;
    const frame = () => {
      if (document.hidden) { bgRunning = false; return; }
      bgRunning = true;
      tt += 0.016;
      ctx.clearRect(0, 0, w, h);
      // no tema claro os vaga-lumes ficam bem mais discretos
      const dim = document.documentElement.getAttribute('data-theme') === 'light' ? 0.35 : 1;
      flies.forEach((p) => {
        p.y -= p.vy; p.x += Math.sin(tt * 0.6 + p.sway) * 0.18;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        const a = (0.25 + 0.75 * Math.max(0, Math.sin(tt * p.tw + p.ph))) * dim;
        const col = p.warm ? palette.accent2 : palette.accent;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
        g.addColorStop(0, rgba(col, a * 0.35)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(col, a * 0.9);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(frame);
    };
    resize();
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !bgRunning) requestAnimationFrame(frame); });
    frame();
  }

  /* ---------- Modais ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
  let lastFocus = null;
  const openModal = (m) => {
    if (!m) return;
    if (!m.classList.contains('open')) lastFocus = document.activeElement;
    $$('.modal.open').forEach((o) => { if (o !== m) { o.classList.remove('open'); o.setAttribute('aria-hidden', 'true'); } });
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = $$(FOCUSABLE, m).find((el) => !el.classList.contains('modal-close')) || $(FOCUSABLE, m);
    if (first) setTimeout(() => first.focus(), 40);
  };
  const closeModal = (m) => {
    if (!m || !m.classList.contains('open')) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  // mantém o Tab dentro do modal aberto
  addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const m = $('.modal.open');
    if (!m) return;
    const els = $$(FOCUSABLE, m).filter((el) => el.offsetParent !== null);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  const contactModal = $('#contactModal'), fotoModal = $('#modalFoto'), paletteModal = $('#paletteModal');

  [['#openContact', contactModal], ['#expandFoto', fotoModal]]
    .forEach(([sel, modal]) => {
      const el = $(sel);
      if (el) el.addEventListener('click', (e) => { e.preventDefault(); openModal(modal); });
    });
  [['#modalClose', contactModal], ['#closeFoto', fotoModal]].forEach(([sel, modal]) => {
    const el = $(sel);
    if (el) el.addEventListener('click', () => closeModal(modal));
  });
  $$('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); }));

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  };


  /* ---------- Sistemas "funcionando": as animações só rodam quando visíveis ---------- */
  const lives = $$('.browser-live');
  const playObs = 'IntersectionObserver' in window && !reduced
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => en.target.classList.toggle('in-view', en.isIntersecting));
        syncPlaying();
      }, { threshold: 0.2 })
    : null;
  function syncPlaying() {
    lives.forEach((b) => {
      const pane = b.closest('.eco-pane');
      const visible = !pane || !pane.hidden;
      b.classList.toggle('is-playing', !reduced && visible && b.classList.contains('in-view'));
    });
  }
  lives.forEach((b) => { if (playObs) playObs.observe(b); });

  /* ---------- Ecossistema: abas com autoplay ----------
     Troca sozinha de produto a cada ECO_MS (a barrinha da aba marca o tempo).
     Pausa com mouse/foco em cima, fora da tela ou depois que a pessoa escolhe. */
  const eco = $('#eco');
  if (eco) {
    const tabs = $$('.eco-tab', eco);
    const panes = tabs.map((t) => $('#' + t.getAttribute('aria-controls')));
    const ECO_MS = 9000;
    let idx = 0, timer = null, hovering = false, onScreen = false, userPicked = false;
    eco.style.setProperty('--eco-ms', ECO_MS + 'ms');

    const show = (i, focus) => {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => {
        const on = k === idx;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panes[k].hidden = !on;
      });
      if (focus) tabs[idx].focus();
      // reinicia a barrinha da aba ativa
      const bar = $('.eco-tab-bar i', tabs[idx]);
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      syncPlaying();
      schedule();
    };
    const schedule = () => {
      clearTimeout(timer);
      const auto = !reduced && !userPicked && onScreen && !document.hidden;
      eco.classList.toggle('is-auto', auto);
      eco.classList.toggle('is-paused', auto && hovering);
      if (auto && !hovering) timer = setTimeout(() => show(idx + 1), ECO_MS);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { userPicked = true; show(i); });
      t.addEventListener('keydown', (e) => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); userPicked = true; show(idx + k, true); }
        else if (e.key === 'Home') { e.preventDefault(); userPicked = true; show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); userPicked = true; show(tabs.length - 1, true); }
      });
    });
    eco.addEventListener('pointerenter', () => { hovering = true; schedule(); });
    eco.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    eco.addEventListener('focusin', () => { hovering = true; schedule(); });
    eco.addEventListener('focusout', () => { hovering = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; schedule(); }, { threshold: 0.25 }).observe(eco);
    }
    show(0);
  }

  /* ---------- Projetos: filtros ---------- */
  const grid = $('#projectsGrid'), emptyState = $('#emptyState'), showMore = $('#showMore');
  const projects = grid ? $$('.project', grid) : [];
  const LIMIT = 9;
  let filter = 'all', expanded = false;
  const tagsOf = (el) => (el.dataset.tags || '').split(' ');
  $$('#filters .filter').forEach((btn) => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? projects.length : projects.filter((p) => tagsOf(p).includes(f)).length;
    const span = $('.count', btn);
    if (span) span.textContent = n;
    if (!n) btn.hidden = true;
  });
  const renderProjects = (animate) => {
    let matched = 0;
    projects.forEach((card) => {
      const ok = filter === 'all' || tagsOf(card).includes(filter);
      if (ok) matched++;
      const hide = !ok || (filter === 'all' && !expanded && matched > LIMIT);
      card.classList.toggle('is-hidden', hide);
      if (animate && !hide && !reduced) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
    });
    if (emptyState) emptyState.hidden = matched > 0;
    if (showMore) {
      const extra = matched - LIMIT;
      showMore.hidden = !(filter === 'all' && extra > 0);
      showMore.setAttribute('aria-expanded', String(expanded));
      $('span', showMore).textContent = expanded ? 'Mostrar menos' : `Ver todos os projetos (+${extra})`;
      $('i', showMore).className = expanded ? 'fa-solid fa-minus' : 'fa-solid fa-plus';
    }
  };
  const setFilter = (f) => {
    filter = f;
    $$('#filters .filter').forEach((b) => {
      const on = b.dataset.filter === f;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderProjects(true);
  };
  $$('#filters .filter').forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter)));
  if (showMore) showMore.addEventListener('click', () => { expanded = !expanded; renderProjects(true); });
  renderProjects(false);

  /* ---------- Contato ---------- */
  const EMAIL = 'gabrieldesamendes@gmail.com';
  const form = $('#contactForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = $('#nome').value.trim();
    const assunto = $('#assunto').value;
    const msg = $('#mensagem').value.trim();
    if (!nome || !msg) { toast('Preencha nome e mensagem.'); return; }
    const subject = encodeURIComponent(`${assunto} · ${nome}`);
    const body = encodeURIComponent(`${msg}\r\n\r\n${nome}`);
    location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    closeModal(contactModal);
    form.reset();
    toast('Abrindo seu cliente de e-mail…');
  });
  const copyBtn = $('#copyEmail');
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); toast('E-mail copiado: ' + EMAIL); }
    catch { location.href = 'mailto:' + EMAIL; }
  };
  if (copyBtn) copyBtn.addEventListener('click', copyEmail);

  /* ---------- Command palette (Ctrl/Cmd + K) ---------- */
  const paletteInput = $('#paletteInput'), paletteResults = $('#paletteResults');
  const go = (hash) => { const t = $(hash); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  const items = [
    { icon: 'fa-solid fa-rocket',        label: 'Ecossistema Mídia Startup', hint: 'seção', action: () => go('#ecossistema') },
    { icon: 'fa-solid fa-robot',         label: 'IA e automação',            hint: 'seção', action: () => go('#ia') },
    { icon: 'fa-solid fa-briefcase',     label: 'Experiência e formação',    hint: 'seção', action: () => go('#experiencia') },
    { icon: 'fa-solid fa-user',          label: 'Sobre e stack',             hint: 'seção', action: () => go('#sobre') },
    { icon: 'fa-solid fa-folder-open',   label: 'Mais projetos',             hint: 'seção', action: () => go('#projetos') },
    { icon: 'fa-solid fa-at',            label: 'Contato',                   hint: 'seção', action: () => go('#contato') },
    { icon: 'fa-solid fa-door-open',     label: 'Portal do SEI',             hint: 'experiência', action: () => go('#experiencia') },
    { icon: 'fa-solid fa-envelope',      label: 'Escrever mensagem',         hint: 'ação',  action: () => openModal(contactModal) },
    { icon: 'fa-regular fa-copy',        label: 'Copiar e-mail',             hint: 'ação',  action: copyEmail },
    { icon: 'fa-solid fa-circle-half-stroke', label: 'Alternar tema',        hint: 'ação',  action: () => themeBtn && themeBtn.click() },
    { icon: 'fa-brands fa-github',       label: 'GitHub',                    hint: 'link',  action: () => open('https://github.com/GabrielGGC18', '_blank', 'noopener') },
    { icon: 'fa-brands fa-linkedin',     label: 'LinkedIn',                  hint: 'link',  action: () => open('https://www.linkedin.com/in/gabriel-de-s%C3%A1-640314211/', '_blank', 'noopener') },
  ];
  // produtos do ecossistema abrem a aba certa
  $$('.eco-pane').forEach((pane) => {
    const tab = $('#' + pane.getAttribute('aria-labelledby'));
    items.push({ icon: 'fa-solid fa-star', label: pane.dataset.title, hint: 'produto', action: () => { go('#ecossistema'); if (tab) tab.click(); } });
  });
  $$('.lab-card, .project').forEach((card) => {
    items.push({
      icon: card.classList.contains('lab-card') ? 'fa-solid fa-microchip' : 'fa-solid fa-code-branch',
      label: card.dataset.title, hint: 'projeto',
      action: () => {
        if (card.classList.contains('is-hidden')) { expanded = true; setFilter('all'); }
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }
    });
  });
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let sel = 0, filtered = items;
  const renderPalette = () => {
    paletteResults.innerHTML = '';
    filtered.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = i === sel ? 'is-sel' : '';
      li.id = 'pal-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === sel));
      li.innerHTML = `<i class="${it.icon}" aria-hidden="true"></i><span></span><small>${it.hint}</small>`;
      li.querySelector('span').textContent = it.label;
      li.addEventListener('click', () => { closeModal(paletteModal); it.action(); });
      paletteResults.appendChild(li);
    });
    if (!filtered.length) {
      const li = document.createElement('li');
      li.textContent = 'Nada encontrado.';
      paletteResults.appendChild(li);
      paletteInput.removeAttribute('aria-activedescendant');
      return;
    }
    paletteInput.setAttribute('aria-activedescendant', 'pal-' + sel);
    const cur = $('#pal-' + sel);
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  };
  const openPalette = () => {
    sel = 0; filtered = items;
    paletteInput.value = '';
    renderPalette();
    openModal(paletteModal);
    setTimeout(() => paletteInput.focus(), 40);
  };
  const paletteBtn = $('#paletteBtn'), paletteKbd = $('#paletteKbd');
  if (paletteKbd && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) paletteKbd.textContent = '⌘K';
  if (paletteBtn) paletteBtn.addEventListener('click', openPalette);
  if (paletteInput) {
    paletteInput.addEventListener('input', () => {
      const q = norm(paletteInput.value.trim());
      filtered = items.filter((it) => norm(it.label).includes(q) || it.hint.includes(q));
      sel = 0;
      renderPalette();
    });
    paletteInput.addEventListener('keydown', (e) => {
      if (!filtered.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % filtered.length; renderPalette(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % filtered.length; renderPalette(); }
      else if (e.key === 'Enter') { e.preventDefault(); closeModal(paletteModal); filtered[sel].action(); }
    });
  }
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape') {
      $$('.modal.open').forEach(closeModal);
      if (navList && navList.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
    }
  });

  /* ---------- Assinatura no console ---------- */
  console.log('%cGabriel de Sá Mendes', 'font:700 18px sans-serif;color:#f2b33d');
  console.log('%cCurioso? Dá uma olhada no código: https://github.com/GabrielGGC18', 'color:#a69a8b');
})();
