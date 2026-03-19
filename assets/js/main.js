'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initTheme();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initFooterYear();
  initBackToTop();
  initParticles();
  initTypingEffect();
  initCounterAnimation();
  initCardTilt();
  initProjectsPage();
  initFeaturedProjects();
  initContactForm();
});

/* ---- Page Loader ---- */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('loaded'), 300));
  setTimeout(() => loader.classList.add('loaded'), 3000);
}

/* ---- Theme Toggle ---- */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.documentElement.classList.remove('theme-dark');
  } else {
    document.documentElement.classList.add('theme-dark');
  }
  toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('theme-dark');
    const isDark = document.documentElement.classList.contains('theme-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggle.setAttribute('aria-label', isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro');
  });
}

/* ---- Navbar scroll effect & active link ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isHome = currentPage === '' || currentPage === 'index.html';

  document.querySelectorAll('.nav-links .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  if (!isHome) navbar.classList.add('scrolled');

  const onScroll = () => {
    if (isHome) navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  const toggle = () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggle);

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) toggle();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) toggle();
  });
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
}

/* ---- Footer Year ---- */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- Back to Top ---- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const toggleBtn = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---- Particles ---- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles, animId;
  const COUNT = 50, MAX_DIST = 120;

  function resize() {
    const section = canvas.closest('.hero');
    width = canvas.width = section ? section.offsetWidth : window.innerWidth;
    height = canvas.height = section ? section.offsetHeight : window.innerHeight;
  }
  function create() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
        r: Math.random() * 2 + 1
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const color = '96,165,250';
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},.3)`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color},${.12 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    });
    animId = requestAnimationFrame(draw);
  }

  resize(); create(); draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); create(); draw(); });
}

/* ---- Typing Effect ---- */
function initTypingEffect() {
  const el = document.getElementById('typed-role');
  if (!el) return;
  const roles = ['MBSE Engineer', 'SysML v2 Specialist', 'Software Developer', 'Space Systems Enthusiast'];
  let roleIdx = 0, charIdx = 0, deleting = false, pause = 0;

  function type() {
    const current = roles[roleIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; pause = 400; }
      else pause = 30;
    } else {
      charIdx++;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === current.length) { deleting = true; pause = 1800; }
      else pause = 80;
    }
    setTimeout(type, pause);
  }
  type();
}

/* ---- Counter Animation ---- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1500, start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- Card Tilt ---- */
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.project-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -4;
    const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4;
    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  document.addEventListener('mouseleave', e => {
    const card = e.target.closest('.project-card');
    if (card) card.style.transform = '';
  }, true);
}

/* ---- Projects Page ---- */
function initProjectsPage() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  const searchInput = document.getElementById('project-search');
  const filtersContainer = document.getElementById('project-filters');
  const resultsCount = document.getElementById('results-count');
  let allProjects = [], activeTag = 'Todos';

  fetch('assets/data/projects.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      allProjects = data;
      renderFilters(data, filtersContainer);
      renderProjects(data, grid);
      updateCount(data.length, resultsCount);
    })
    .catch(() => {
      grid.innerHTML = '<div class="no-results"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><p>Erro ao carregar projetos.</p></div>';
    });

  if (searchInput) searchInput.addEventListener('input', () => applyFilters(allProjects, activeTag, searchInput.value, grid, resultsCount));
  if (filtersContainer) filtersContainer.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;
    activeTag = btn.dataset.tag;
    filtersContainer.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters(allProjects, activeTag, searchInput ? searchInput.value : '', grid, resultsCount);
  });
}

/* ---- Featured Projects ---- */
function initFeaturedProjects() {
  const grid = document.getElementById('featured-projects');
  if (!grid) return;
  fetch('assets/data/projects.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => renderProjects(data.slice(0, 3), grid))
    .catch(() => { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center">Não foi possível carregar os projetos.</p>'; });
}

/* ---- Render Helpers ---- */
function renderFilters(projects, container) {
  if (!container) return;
  const tags = new Set();
  projects.forEach(p => p.tags.forEach(t => tags.add(t)));
  let html = '<button class="filter-tag active" data-tag="Todos">Todos</button>';
  Array.from(tags).sort().forEach(tag => { html += `<button class="filter-tag" data-tag="${esc(tag)}">${esc(tag)}</button>`; });
  container.innerHTML = html;
}

function applyFilters(projects, tag, query, grid, countEl) {
  const q = query.toLowerCase().trim();
  const filtered = projects.filter(p => {
    const matchTag = tag === 'Todos' || p.tags.includes(tag);
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchTag && matchQ;
  });
  renderProjects(filtered, grid);
  updateCount(filtered.length, countEl);
}

function renderProjects(projects, grid) {
  if (!projects.length) {
    grid.innerHTML = '<div class="no-results"><i class="fa-solid fa-folder-open" aria-hidden="true"></i><p>Sem resultados encontrados.</p></div>';
    return;
  }
  grid.innerHTML = projects.map(p => `
    <article class="project-card">
      <div class="project-card-img-wrapper">
        <img src="${esc(p.image)}" alt="Projeto: ${esc(p.title)}" class="project-card-img" loading="lazy">
        <div class="project-card-overlay">
          ${p.year ? `<span class="project-card-year">${esc(String(p.year))}</span>` : ''}
        </div>
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${esc(p.title)}</h3>
        <p class="project-card-desc">${esc(p.description)}</p>
        <div class="project-card-tags">${p.tags.map(t => `<span class="project-card-tag">${esc(t)}</span>`).join('')}</div>
        <div class="project-card-links">
          ${p.links.github && p.links.github !== '#' ? `<a href="${esc(p.links.github)}" class="project-card-link" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub</a>` : ''}
          ${p.links.demo && p.links.demo !== '#' ? `<a href="${esc(p.links.demo)}" class="project-card-link" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Demo</a>` : ''}
        </div>
      </div>
    </article>
  `).join('');
  grid.querySelectorAll('.project-card-img').forEach(img => {
    img.addEventListener('error', () => img.classList.add('img-error'), { once: true });
  });
}

function updateCount(count, el) {
  if (!el) return;
  el.textContent = `${count} projeto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
}

/* ---- Contact Form ---- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const alertSuccess = document.getElementById('form-alert-success');
  const alertError = document.getElementById('form-alert-error');

  form.addEventListener('submit', e => {
    if (alertSuccess) alertSuccess.style.display = 'none';
    if (alertError) alertError.style.display = 'none';

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));

    let valid = true;
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim() || !input.checkValidity()) {
        input.closest('.form-group').classList.add('invalid');
        valid = false;
      }
    });

    if (!valid) {
      e.preventDefault();
      const first = form.querySelector('.form-group.invalid .form-input');
      if (first) first.focus();
      return;
    }

    const action = form.getAttribute('action');
    if (!action || action.includes('YOUR_FORM_ID') || action === '#') {
      e.preventDefault();
      if (alertError) {
        alertError.textContent = 'O formulário ainda não está configurado. Consulte o README para instruções.';
        alertError.style.display = 'block';
        alertError.focus();
      }
    }
  });
}

/* ---- Escape HTML ---- */
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
