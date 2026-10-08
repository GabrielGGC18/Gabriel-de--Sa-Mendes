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
    if (meta) meta.setAttribute('content', t === 'light' ? '#f6f7fb' : '#0a0e14');
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
      'Desenvolvedor Fullstack',
      'Python · Django · FastAPI',
      'React · TypeScript',
      'Automação & Integrações',
      'CEO da Mídia Startup'
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

  /* ---------- Cards: holofote + inclinação 3D com reflexo ----------
     Mesma ideia do SpotlightCard/TiltedCard da Mídia Startup: o brilho segue
     o mouse e o card inclina em perspectiva. Só com mouse; no toque é card comum. */
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduced) {
    $$('.project').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        if (!finePointer) return;
        card.style.setProperty('--gx', (px + 0.5) * 100 + '%');
        card.style.setProperty('--gy', (py + 0.5) * 100 + '%');
        // cards grandes inclinam menos para não exagerar
        const amp = Math.min(8, 2600 / r.width);
        card.style.transform = `perspective(900px) rotateX(${(-py * amp).toFixed(2)}deg) rotateY(${(px * amp).toFixed(2)}deg) scale(1.02)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Entrada dos cards em cascata ---------- */
  const animateIn = (cards) => {
    if (reduced) return;
    cards.forEach((card, i) => {
      card.classList.remove('card-in');
      card.style.setProperty('--d', Math.min(i, 8) * 60 + 'ms');
      void card.offsetWidth; // reinicia a animação
      card.classList.add('card-in');
    });
  };
  if (!reduced && 'IntersectionObserver' in window) {
    const cardObs = new IntersectionObserver((entries) => {
      const batch = entries.filter((en) => en.isIntersecting).map((en) => en.target);
      batch.forEach((c) => { c.classList.remove('card-wait'); cardObs.unobserve(c); });
      animateIn(batch);
    }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
    $$('.project').forEach((c) => { c.classList.add('card-wait'); cardObs.observe(c); });
  }

  /* ---------- Filtros de projeto ---------- */
  const grid = $('#projectsGrid'), emptyState = $('#emptyState'), showMore = $('#showMore');
  const LIMIT = 8;
  let filter = 'all', expanded = false;
  const renderProjects = () => {
    let matched = 0;
    const appeared = [];
    $$('.project', grid).forEach((card) => {
      const tags = (card.dataset.tags || '').split(' ');
      const ok = filter === 'all' || tags.includes(filter);
      if (ok) matched++;
      // em "Todos" mostramos só os primeiros até o usuário pedir o resto
      const collapsed = filter === 'all' && !expanded && matched > LIMIT;
      const hide = !ok || collapsed;
      if (!hide && card.classList.contains('is-hidden') && !card.classList.contains('card-wait')) appeared.push(card);
      card.classList.toggle('is-hidden', hide);
    });
    animateIn(appeared);
    if (emptyState) emptyState.hidden = matched > 0;
    if (showMore) {
      const extra = matched - LIMIT;
      showMore.hidden = filter !== 'all' || extra <= 0 || expanded;
      showMore.querySelector('span').textContent = `Ver todos os projetos (+${extra})`;
      showMore.setAttribute('aria-expanded', String(expanded));
    }
  };
  $$('#filters .filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('#filters .filter').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      filter = btn.dataset.filter;
      renderProjects();
    });
  });
  if (showMore) showMore.addEventListener('click', () => {
    const firstHidden = $('.project.is-hidden', grid);
    expanded = true;
    renderProjects();
    // leva o foco para o primeiro card revelado
    const focusable = firstHidden && firstHidden.querySelector('a');
    if (focusable) focusable.focus({ preventScroll: true });
  });
  renderProjects();

  /* ---------- Tilt na foto ---------- */
  const tiltEl = $('[data-tilt]');
  if (tiltEl && !reduced && matchMedia('(hover: hover)').matches) {
    tiltEl.addEventListener('pointermove', (e) => {
      const r = tiltEl.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform = `perspective(800px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
      tiltEl.style.setProperty('--gx', (px + 0.5) * 100 + '%');
      tiltEl.style.setProperty('--gy', (py + 0.5) * 100 + '%');
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

  /* ---------- Em produção: pilha de cards que se revezam (CardSwap) ----------
     O card da frente vai para o fundo a cada INTERVAL. Pausa com mouse/foco em
     cima ou fora da tela; clicar num card de trás (ou na lista) traz ele à frente. */
  const swap = $('#swap'), showList = $('#showcaseList');
  if (swap) {
    const cards = $$('.swap-card', swap);
    const buttons = showList ? $$('button', showList) : [];
    const INTERVAL = 4200;
    let order = cards.map((_, i) => i), timer = null, hovering = false, onScreen = false;
    const paint = () => {
      cards.forEach((card, i) => {
        const pos = order.indexOf(i);
        card.style.setProperty('--pos', pos);
        card.style.zIndex = cards.length - pos;
        card.classList.toggle('is-front', pos === 0);
        card.inert = pos !== 0;
        card.setAttribute('aria-hidden', String(pos !== 0));
      });
      buttons.forEach((btn) => {
        const on = Number(btn.dataset.idx) === order[0];
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
        if (on) { btn.classList.remove('is-timing'); void btn.offsetWidth; }
      });
      syncTimer();
    };
    const bringFront = (idx) => { order = [idx, ...order.filter((i) => i !== idx)]; paint(); };
    const next = () => { order = [...order.slice(1), order[0]]; paint(); };
    function syncTimer() {
      clearInterval(timer); timer = null;
      const running = !reduced && !hovering && onScreen;
      buttons.forEach((b) => b.classList.toggle('is-timing', running && b.classList.contains('is-active')));
      showList && showList.style.setProperty('--swap-ms', INTERVAL + 'ms');
      if (running) timer = setInterval(next, INTERVAL);
    }
    // o card inteiro fica 'inert' quando está atrás; o clique é capturado na pilha
    swap.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const rect = (c) => c.getBoundingClientRect();
      const hit = [...cards].sort((a, b) => order.indexOf(a.dataset.idx * 1) - order.indexOf(b.dataset.idx * 1))
        .find((c) => { const r = rect(c); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; });
      if (hit && !hit.classList.contains('is-front')) bringFront(Number(hit.dataset.idx));
    });
    buttons.forEach((btn) => btn.addEventListener('click', () => bringFront(Number(btn.dataset.idx))));
    const pause = (v) => { hovering = v; syncTimer(); };
    [swap, showList].forEach((el) => {
      if (!el) return;
      el.addEventListener('pointerenter', () => pause(true));
      el.addEventListener('pointerleave', () => pause(false));
      el.addEventListener('focusin', () => pause(true));
      el.addEventListener('focusout', () => pause(false));
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; syncTimer(); }, { threshold: 0.3 }).observe(swap);
    }
    paint();
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
    let w = 0, h, dots = [];
    const DENSITY = 14000, MAXD = 130;
    const resize = () => {
      // no mobile a barra de endereço muda só a altura ao rolar: não recria os pontos
      const widthChanged = innerWidth !== w;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!widthChanged && dots.length) return;
      const count = Math.min(w < 700 ? 40 : 90, Math.floor((w * h) / DENSITY));
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

  /* ---------- Formulário de contato (mailto) ---------- */
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = $('#nome').value.trim();
      const email = $('#email').value.trim();
      const msg = $('#mensagem').value.trim();
      if (!nome || !email || !msg) { toast('Preencha todos os campos.'); return; }
      const body = encodeURIComponent(`Nome: ${nome}\r\nE-mail: ${email}\r\n\r\n${msg}`);
      location.href = `mailto:bexcbr@gmail.com?subject=${encodeURIComponent('Contato via portfólio — ' + nome)}&body=${body}`;
      toast('Abrindo seu cliente de e-mail…');
    });
  }

  /* ---------- Copiar e-mail ---------- */
  const copyEmail = $('#copyEmail');
  if (copyEmail) copyEmail.addEventListener('click', async () => {
    const addr = copyEmail.dataset.email;
    try {
      await navigator.clipboard.writeText(addr);
      toast('E-mail copiado!');
    } catch {
      location.href = 'mailto:' + addr;
    }
  });

  /* ---------- Command palette (Ctrl/Cmd + K) ---------- */
  const paletteInput = $('#paletteInput'), paletteResults = $('#paletteResults');
  const items = [
    { icon: 'fa-solid fa-user',        label: 'Sobre Mim',        hint: 'seção', action: () => go('#sobre') },
    { icon: 'fa-solid fa-layer-group', label: 'Stack e Ferramentas', hint: 'seção', action: () => go('#stack') },
    { icon: 'fa-solid fa-graduation-cap', label: 'Formação e Cursos', hint: 'seção', action: () => go('#formacao') },
    { icon: 'fa-solid fa-rocket',      label: 'Em produção',      hint: 'seção', action: () => go('#producao') },
    { icon: 'fa-solid fa-folder-open', label: 'Projetos',         hint: 'seção', action: () => go('#projects') },
    { icon: 'fa-solid fa-at',          label: 'Contato',          hint: 'seção', action: () => go('#contato') },
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
  const go = (hash) => { const t = $(hash); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  const renderPalette = () => {
    paletteResults.innerHTML = '';
    filtered.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = i === sel ? 'is-sel' : '';
      li.id = 'pal-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === sel));
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
    if (filtered.length) {
      paletteInput.setAttribute('aria-activedescendant', 'pal-' + sel);
      const cur = $('#pal-' + sel);
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    } else paletteInput.removeAttribute('aria-activedescendant');
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
    if (e.key === 'Escape') {
      $$('.modal.open').forEach(closeModal);
      if (navList && navList.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
    }
  });

  /* ---------- Assinatura no console ---------- */
  console.log('%cGabriel de Sá Mendes', 'font:700 18px sans-serif;color:#5eead4');
  console.log('%cCurioso? Dá uma olhada no código: https://github.com/GabrielGGC18', 'color:#8b97a8');
})();
