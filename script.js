document.addEventListener('DOMContentLoaded', () => {
  // Atualiza o ano no rodapé
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Menu de navegação responsivo
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Modal de contato
  const contactModal = document.getElementById('contactModal');
  const openContact = document.getElementById('openContact');
  const contactBtn = document.getElementById('contactBtn');
  const modalClose = document.getElementById('modalClose');

  function openModal() {
    if (contactModal) {
      contactModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const firstInput = contactModal.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal() {
    if (contactModal) {
      contactModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    }
  }

  [openContact, contactBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (contactModal) {
    contactModal.addEventListener('click', e => {
      if (e.target === contactModal) closeModal();
    });
  }

  // Botão "voltar ao topo"
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Animação das skills
  const skills = document.querySelectorAll('.skill');
  function animateSkills() {
    skills.forEach(skill => {
      const value = parseInt(skill.getAttribute('data-skill') || '0', 10);
      let progress = 0;
      const interval = setInterval(() => {
        progress++;
        skill.style.background = `linear-gradient(90deg, var(--accent) ${progress}%, rgba(59,130,246,0.06) ${progress}%)`;
        if (progress >= value) clearInterval(interval);
      }, 10);
    });
  }
  animateSkills();

  // Scroll suave para âncoras
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navList.classList.remove('show');
      }
    });
  });
});
