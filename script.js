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
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f6f7fb' : '#0a0e14');
  };
  applyTheme(readTheme() || 'dark');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('gsm-theme', next); } catch {}
  });

  /* ---------- Menu mobile ---------- */
  const navToggle = $('#navToggle'), navList = $('#navList');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navList.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        navList.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
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

  /* ---------- Contadores ---------- */
  const animateCount = (el, target) => {
    const dur = 1200, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const target = Number(en.target.dataset.count) || 0;
      if (target > 0) animateCount(en.target, target);
      countObs.unobserve(en.target);
    });
  }, { threshold: 0.5 });
  $$('.count').forEach((el) => countObs.observe(el));

  /* ---------- Stats ao vivo do GitHub ---------- */
  const statRepos = $('#statRepos');
  if (statRepos) {
    fetch('https://api.github.com/users/GabrielGGC18')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('github ' + r.status))))
      .then((d) => {
        const n = Number(d.public_repos) || 0;
        statRepos.dataset.count = String(n);
        animateCount(statRepos, n);
      })
      .catch(() => { statRepos.textContent = '30+'; });
  }

  /* ---------- Typewriter ---------- */
  const typed = $('#typed');
  if (typed) {
    const roles = [
      'Desenvolvedor Fullstack',
      'Python · Django · FastAPI',
      'React · TypeScript',
      'Automação & Integrações',
      'CEO da GSM Startup'
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

  /* ---------- Filtros de projeto ---------- */
  const grid = $('#projectsGrid'), emptyState = $('#emptyState');
  $$('#filters .filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('#filters .filter').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      const f = btn.dataset.filter;
      let shown = 0;
      $$('.project', grid).forEach((card) => {
        const tags = (card.dataset.tags || '').split(' ');
        const ok = f === 'all' || tags.includes(f);
        card.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (emptyState) emptyState.hidden = shown > 0;
    });
  });

  /* ---------- Spotlight nos cards ---------- */
  if (!reduced) {
    $$('.project').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Tilt na foto ---------- */
  const tiltEl = $('[data-tilt]');
  if (tiltEl && !reduced && matchMedia('(hover: hover)').matches) {
    tiltEl.addEventListener('pointermove', (e) => {
      const r = tiltEl.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform = `perspective(800px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
    });
    tiltEl.addEventListener('pointerleave', () => { tiltEl.style.transform = ''; });
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

  /* ---------- Partículas de fundo ---------- */
  const canvas = $('#bgCanvas');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dots = [];
    const DENSITY = 14000, MAXD = 130;
    const resize = () => {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
      const count = Math.min(90, Math.floor((w * h) / DENSITY));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28
      }));
    };
    const accent = () => (document.documentElement.getAttribute('data-theme') === 'light' ? '13,148,136' : '94,234,212');
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const rgb = accent();
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.fillStyle = `rgba(${rgb},.45)`;
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.3, 0, Math.PI * 2); ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > MAXD) continue;
          ctx.strokeStyle = `rgba(${rgb},${(1 - dist / MAXD) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    };
    resize();
    addEventListener('resize', resize);
    frame();
  }

  /* ---------- Modais ---------- */
  const openModal = (m) => {
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = (m) => {
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const contactModal = $('#contactModal'), fotoModal = $('#modalFoto'), paletteModal = $('#paletteModal');

  [['#contactBtn', contactModal], ['#openContact', contactModal], ['#expandFoto', fotoModal]]
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

  /* ---------- Formulário de contato (mailto) ---------- */
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = $('#nome').value.trim();
      const email = $('#email').value.trim();
      const msg = $('#mensagem').value.trim();
      if (!nome || !email || !msg) { toast('Preencha todos os campos.'); return; }
      const body = `Nome: ${nome}%0D%0AE-mail: ${email}%0D%0A%0D%0A${encodeURIComponent(msg)}`;
      location.href = `mailto:bexcbr@gmail.com?subject=${encodeURIComponent('Contato via portfólio — ' + nome)}&body=${body}`;
      toast('Abrindo seu cliente de e-mail…');
    });
  }

  /* ---------- Command palette (Ctrl/Cmd + K) ---------- */
  const paletteInput = $('#paletteInput'), paletteResults = $('#paletteResults');
  const items = [
    { icon: 'fa-solid fa-user',        label: 'Sobre Mim',        hint: 'seção', action: () => go('#sobre') },
    { icon: 'fa-solid fa-layer-group', label: 'Stack e Ferramentas', hint: 'seção', action: () => go('#stack') },
    { icon: 'fa-solid fa-graduation-cap', label: 'Formação e Cursos', hint: 'seção', action: () => go('#formacao') },
    { icon: 'fa-solid fa-folder-open', label: 'Projetos',         hint: 'seção', action: () => go('#projects') },
    { icon: 'fa-solid fa-envelope',    label: 'Abrir contato',    hint: 'ação',  action: () => openModal(contactModal) },
    { icon: 'fa-solid fa-circle-half-stroke', label: 'Alternar tema', hint: 'ação', action: () => themeBtn && themeBtn.click() },
    { icon: 'fa-brands fa-github',     label: 'GitHub',           hint: 'link',  action: () => open('https://github.com/GabrielGGC18', '_blank') },
    { icon: 'fa-brands fa-linkedin',   label: 'LinkedIn',         hint: 'link',  action: () => open('https://www.linkedin.com/in/gabriel-de-s%C3%A1-640314211/', '_blank') }
  ];
  $$('.project').forEach((card) => {
    const link = card.querySelector('.project-links a');
    if (!link) return;
    items.push({
      icon: 'fa-solid fa-code-branch',
      label: card.dataset.title || card.querySelector('h3').textContent.trim(),
      hint: 'projeto',
      action: () => open(link.href, '_blank')
    });
  });

  let sel = 0, filtered = items;
  const go = (hash) => { const t = $(hash); if (t) t.scrollIntoView({ behavior: 'smooth' }); };
  const renderPalette = () => {
    paletteResults.innerHTML = '';
    filtered.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = i === sel ? 'is-sel' : '';
      li.setAttribute('role', 'option');
      li.innerHTML = `<i class="${it.icon}"></i><span></span><small>${it.hint}</small>`;
      li.querySelector('span').textContent = it.label;
      li.addEventListener('click', () => { closeModal(paletteModal); it.action(); });
      paletteResults.appendChild(li);
    });
    if (!filtered.length) {
      const li = document.createElement('li');
      li.textContent = 'Nada encontrado.';
      paletteResults.appendChild(li);
    }
  };
  const openPalette = () => {
    sel = 0; filtered = items;
    paletteInput.value = '';
    renderPalette();
    openModal(paletteModal);
    setTimeout(() => paletteInput.focus(), 40);
  };
  const paletteBtn = $('#paletteBtn');
  if (paletteBtn) paletteBtn.addEventListener('click', openPalette);

  if (paletteInput) {
    paletteInput.addEventListener('input', () => {
      const q = paletteInput.value.toLowerCase().trim();
      filtered = items.filter((it) => it.label.toLowerCase().includes(q) || it.hint.includes(q));
      sel = 0;
      renderPalette();
    });
    paletteInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(filtered.length, 1); renderPalette(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(filtered.length, 1); renderPalette(); }
      else if (e.key === 'Enter' && filtered[sel]) { e.preventDefault(); closeModal(paletteModal); filtered[sel].action(); }
    });
  }

  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape') $$('.modal.open').forEach(closeModal);
  });

  /* ---------- Konami: modo "matrix" no console ---------- */
  console.log('%cGabriel de Sá Mendes', 'font:700 18px sans-serif;color:#5eead4');
  console.log('%cCurioso? Dá uma olhada no código: https://github.com/GabrielGGC18', 'color:#8b97a8');
})();
