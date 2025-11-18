// Pequeno script para interações: menu móvel, modal, back-to-top, animações simples
document.addEventListener('DOMContentLoaded', ()=>{
  // ano no rodapé
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // nav toggle
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  if(navToggle && navList){
    navToggle.addEventListener('click', ()=>{
      navList.classList.toggle('show');
    });
  }

  // modal contato
  const contactModal = document.getElementById('contactModal');
  const openContact = document.getElementById('openContact');
  const contactBtn = document.getElementById('contactBtn');
  const modalClose = document.getElementById('modalClose');
  function openModal(){ if(contactModal){ contactModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }}
  function closeModal(){ if(contactModal){ contactModal.setAttribute('aria-hidden','true'); document.body.style.overflow='auto'; }}
  if(openContact){ openContact.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); }); }
  if(contactBtn){ contactBtn.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); }); }
  if(modalClose){ modalClose.addEventListener('click', closeModal); }
  if(contactModal){ contactModal.addEventListener('click', (e)=>{ if(e.target === contactModal) closeModal(); }); }

  // back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 300){ backToTop.style.display = 'block'; }
    else { backToTop.style.display = 'none'; }
  });
  if(backToTop){ backToTop.addEventListener('click', ()=>{ window.scrollTo({top:0, behavior:'smooth'}); }); }

  // reveal skills/progress - simple animation
  const skills = document.querySelectorAll('.skill');
  function animateSkills(){
    skills.forEach(s=>{
      const v = parseInt(s.getAttribute('data-skill')||'0',10);
      s.style.background = `linear-gradient(90deg,var(--accent) ${v}%, rgba(14,165,164,0.06) ${v}%)`;
    });
  }
  animateSkills();

  // smooth scrolling for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href && href.startsWith('#')){
        const el = document.querySelector(href);
        if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); navList.classList.remove('show'); }
      }
    });
  });
});