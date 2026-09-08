document.addEventListener('DOMContentLoaded', () => {

  // MENU MOBILE
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const abierto = navLinks.classList.toggle('open');
      navToggle.classList.toggle('is-open', abierto);
      navToggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // TABS CARTA
  const tabs = document.querySelectorAll('.tab');
  const grids = document.querySelectorAll('.menu-grid');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      grids.forEach(g => g.classList.add('hidden'));
      tab.classList.add('active');
      const target = document.getElementById(tab.getAttribute('data-tab'));
      if (target) target.classList.remove('hidden');
    });
  });

  // ANIMACIÓN SCROLL
  const animados = document.querySelectorAll('.menu-item, .promo-card, .valor-item, .info-card, .stat');

  const mostrar = (el) => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        mostrar(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animados.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });

  // Red de seguridad: nada puede quedar invisible si el observer no se dispara
  window.addEventListener('load', () => {
    setTimeout(() => animados.forEach(el => {
      if (getComputedStyle(el).opacity === '0') mostrar(el);
    }), 700);
  });

});
