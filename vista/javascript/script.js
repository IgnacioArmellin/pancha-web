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

  // ARMADOR DE PEDIDO (solo en la carta)
  const menuSection = document.querySelector('.menu-section');
  const pedidoEl = document.getElementById('pedido');
  if (menuSection && pedidoEl) {
    const WA = 'https://wa.me/5491164916021';
    const CATS = { pizzas: 'pizza', empanadas: 'empanada', milanesas: 'milanesa' };
    const parsePrecio = (t) => parseInt((t || '').replace(/[^\d]/g, ''), 10) || 0;
    const fmt = (n) => '$' + n.toLocaleString('es-AR');

    let pedido = []; // { clave, nombre, cat, precio, cant }

    const countEl = document.getElementById('pedido-count');
    const totalEl = document.getElementById('pedido-total');
    const itemsEl = document.getElementById('pedido-items');
    const bodyEl = pedidoEl.querySelector('.pedido-body');
    const headEl = pedidoEl.querySelector('.pedido-head');
    const enviarEl = document.getElementById('pedido-enviar');
    const vaciarEl = document.getElementById('pedido-vaciar');

    // Botón "Agregar" en cada producto
    menuSection.querySelectorAll('.menu-item').forEach((item) => {
      const nombre = item.querySelector('h4')?.textContent.trim();
      if (!nombre) return;
      const precio = parsePrecio(item.querySelector('.price')?.textContent);
      const cat = CATS[item.closest('.menu-grid')?.id] || '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'add-pedido';
      btn.textContent = 'Agregar';
      btn.addEventListener('click', () => agregar(nombre, cat, precio));
      item.appendChild(btn);
    });

    function agregar(nombre, cat, precio) {
      const clave = cat + '|' + nombre;
      const ex = pedido.find((p) => p.clave === clave);
      if (ex) ex.cant++;
      else pedido.push({ clave, nombre, cat, precio, cant: 1 });
      if (bodyEl.hidden) bodyEl.hidden = false;
      render();
    }
    function cambiar(clave, delta) {
      const p = pedido.find((x) => x.clave === clave);
      if (!p) return;
      p.cant += delta;
      if (p.cant <= 0) pedido = pedido.filter((x) => x.clave !== clave);
      render();
    }
    function quitar(clave) {
      pedido = pedido.filter((x) => x.clave !== clave);
      render();
    }
    function vaciar() {
      pedido = [];
      bodyEl.hidden = true;
      render();
    }

    const total = () => pedido.reduce((s, p) => s + p.precio * p.cant, 0);
    const unidades = () => pedido.reduce((s, p) => s + p.cant, 0);

    function render() {
      const n = unidades();
      document.body.classList.toggle('con-pedido', n > 0);
      pedidoEl.hidden = n === 0;
      countEl.textContent = n;
      totalEl.textContent = fmt(total());

      itemsEl.innerHTML = '';
      pedido.forEach((p) => {
        const li = document.createElement('li');
        li.className = 'pedido-item';
        const nombreTxt = p.nombre + (p.cat ? ' (' + p.cat + ')' : '');
        li.innerHTML =
          '<span class="nom"></span>' +
          '<span class="pedido-qty"><button type="button" class="menos" aria-label="Restar uno">-</button>' +
          '<span class="cant"></span>' +
          '<button type="button" class="mas" aria-label="Sumar uno">+</button></span>' +
          '<span class="sub"></span>' +
          '<button type="button" class="quitar">Quitar</button>';
        li.querySelector('.nom').textContent = nombreTxt;
        li.querySelector('.cant').textContent = p.cant;
        li.querySelector('.sub').textContent = fmt(p.precio * p.cant);
        li.querySelector('.menos').addEventListener('click', () => cambiar(p.clave, -1));
        li.querySelector('.mas').addEventListener('click', () => cambiar(p.clave, 1));
        li.querySelector('.quitar').addEventListener('click', () => quitar(p.clave));
        itemsEl.appendChild(li);
      });

      const lineas = pedido
        .map((p) => '- ' + p.cant + 'x ' + p.nombre + (p.cat ? ' (' + p.cat + ')' : '') + ' - ' + fmt(p.precio * p.cant))
        .join('\n');
      const msg = 'Hola! Quiero hacer un pedido:\n' + lineas + '\n\nTotal: ' + fmt(total());
      enviarEl.href = WA + '?text=' + encodeURIComponent(msg);
    }

    headEl.addEventListener('click', () => { bodyEl.hidden = !bodyEl.hidden; });
    vaciarEl.addEventListener('click', vaciar);
    render();
  }

});
