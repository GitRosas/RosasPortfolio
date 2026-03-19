// path: assets/js/main.js
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initTheme();
  initNavbar();
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

/* ============================================
   Page Loader
   ============================================ */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('loaded'), 300);
  });
  // Fallback: hide after 3 seconds regardless
  setTimeout(() => loader.classList.add('loaded'), 3000);
}

/* ============================================
   Theme: Dark / Light toggle
   ============================================ */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('theme-dark');
  }

  toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('theme-dark');
    const isDark = document.documentElement.classList.contains('theme-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggle.setAttribute('aria-label', isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro');
  });
}

/* ============================================
   Navbar: active state, scroll shrink, mobile
   ============================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Scroll shrink effect
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Close mobile menu on link click
  const navbarCollapse = document.getElementById('navbarNav');
  if (navbarCollapse) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      });
    });
  }
}

/* ============================================
   Scroll Reveal (IntersectionObserver)
   ============================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el, i) => {
    el.style.transitionDelay = `${i % 4 * 0.1}s`;
    observer.observe(el);
  });
}

/* ============================================
   Footer: dynamic year
   ============================================ */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================
   Back to Top Button
   ============================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggleBtn = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================
   Particle Background (Canvas)
   ============================================ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles, animId;
  const PARTICLE_COUNT = 50;
  const MAX_DIST = 120;

  function resize() {
    const section = canvas.closest('.hero-section');
    width = canvas.width = section ? section.offsetWidth : window.innerWidth;
    height = canvas.height = section ? section.offsetHeight : window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.classList.contains('theme-dark');
    const color = isDark ? '96,165,250' : '37,99,235';

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.3)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color}, ${0.12 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animId = requestAnimationFrame(draw);
  }

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    createParticles();
    draw();
  });
}

/* ============================================
   Typing Effect
   ============================================ */
function initTypingEffect() {
  const el = document.getElementById('typed-role');
  if (!el) return;

  const roles = [
    'MBSE Engineer',
    'SysML v2 Specialist',
    'Software Developer',
    'Space Systems Enthusiast'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseMs = 0;

  function type() {
    const current = roles[roleIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        pauseMs = 400;
      } else {
        pauseMs = 30;
      }
    } else {
      charIdx++;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        pauseMs = 1800;
      } else {
        pauseMs = 80;
      }
    }
    setTimeout(type, pauseMs);
  }

  type();
}

/* ============================================
   Counter Animation (Stats)
   ============================================ */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ============================================
   Card Tilt Effect
   ============================================ */
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return; // skip on touch devices

  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.project-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  document.addEventListener('mouseleave', (e) => {
    const card = e.target.closest('.project-card');
    if (card) card.style.transform = '';
  }, true);
}

/* ============================================
   Projects Page: fetch, render, filter, search
   ============================================ */
function initProjectsPage() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const searchInput = document.getElementById('project-search');
  const filtersContainer = document.getElementById('project-filters');
  const resultsCount = document.getElementById('results-count');

  let allProjects = [];
  let activeTag = 'Todos';

  fetch('assets/data/projects.json')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao carregar projetos');
      return res.json();
    })
    .then(data => {
      allProjects = data;
      renderFilters(data, filtersContainer);
      renderProjects(data, grid);
      updateCount(data.length, resultsCount);
    })
    .catch(() => {
      grid.innerHTML = '<div class="col-12 no-results" role="status"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><p>Erro ao carregar projetos. Certifique-se de que está a usar um servidor local.</p></div>';
    });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters(allProjects, activeTag, searchInput.value, grid, resultsCount);
    });
  }

  if (filtersContainer) {
    filtersContainer.addEventListener('click', e => {
      const btn = e.target.closest('.filter-tag');
      if (!btn) return;
      activeTag = btn.dataset.tag;
      filtersContainer.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters(allProjects, activeTag, searchInput ? searchInput.value : '', grid, resultsCount);
    });
  }
}

/* ============================================
   Home Page: featured projects
   ============================================ */
function initFeaturedProjects() {
  const grid = document.getElementById('featured-projects');
  if (!grid) return;

  fetch('assets/data/projects.json')
    .then(res => {
      if (!res.ok) throw new Error('Erro');
      return res.json();
    })
    .then(data => {
      renderProjects(data.slice(0, 3), grid);
    })
    .catch(() => {
      grid.innerHTML = '<div class="col-12"><p class="text-center text-muted">Não foi possível carregar os projetos.</p></div>';
    });
}

/* ============================================
   Project Rendering Helpers
   ============================================ */
function renderFilters(projects, container) {
  if (!container) return;
  const tags = new Set();
  projects.forEach(p => p.tags.forEach(t => tags.add(t)));
  const sorted = Array.from(tags).sort();

  let html = '<button class="filter-tag active" data-tag="Todos">Todos</button>';
  sorted.forEach(tag => {
    html += `<button class="filter-tag" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`;
  });
  container.innerHTML = html;
}

function applyFilters(projects, tag, query, grid, countEl) {
  const q = query.toLowerCase().trim();
  const filtered = projects.filter(p => {
    const matchTag = tag === 'Todos' || p.tags.includes(tag);
    const matchQuery = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchTag && matchQuery;
  });
  renderProjects(filtered, grid);
  updateCount(filtered.length, countEl);
}

function renderProjects(projects, grid) {
  if (!projects.length) {
    grid.innerHTML = '<div class="col-12 no-results" role="status"><i class="fa-solid fa-folder-open" aria-hidden="true"></i><p>Sem resultados encontrados.</p></div>';
    return;
  }

  grid.innerHTML = projects.map(p => `
    <div class="col-md-6 col-lg-4">
      <article class="project-card">
        <div class="project-card-img-wrapper">
          <img
            src="${escapeHTML(p.image)}"
            alt="Projeto: ${escapeHTML(p.title)}"
            class="project-card-img"
            loading="lazy"
          >
          <div class="project-card-overlay">
            ${p.year ? `<span class="project-card-year">${escapeHTML(String(p.year))}</span>` : ''}
          </div>
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">${escapeHTML(p.title)}</h3>
          <p class="project-card-desc">${escapeHTML(p.description)}</p>
          <div class="project-card-tags">
            ${p.tags.map(t => `<span class="project-card-tag">${escapeHTML(t)}</span>`).join('')}
          </div>
          <div class="project-card-links">
            ${p.links.github && p.links.github !== '#' ? `<a href="${escapeHTML(p.links.github)}" class="project-card-link" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub</a>` : ''}
            ${p.links.demo && p.links.demo !== '#' ? `<a href="${escapeHTML(p.links.demo)}" class="project-card-link" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Demo</a>` : ''}
          </div>
        </div>
      </article>
    </div>
  `).join('');

  // Handle broken images gracefully
  grid.querySelectorAll('.project-card-img').forEach(img => {
    img.addEventListener('error', () => img.classList.add('img-error'), { once: true });
  });
}

function updateCount(count, el) {
  if (!el) return;
  el.textContent = `${count} projeto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
}

/* ============================================
   Contact Form: validation
   ============================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const alertSuccess = document.getElementById('form-alert-success');
  const alertError = document.getElementById('form-alert-error');

  form.addEventListener('submit', e => {
    if (alertSuccess) alertSuccess.style.display = 'none';
    if (alertError) alertError.style.display = 'none';

    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add('was-validated');
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const action = form.getAttribute('action');
    if (!action || action.includes('YOUR_FORM_ID') || action === '#') {
      e.preventDefault();
      if (alertError) {
        alertError.textContent = 'O formulário ainda não está configurado. Consulte o README para instruções de configuração.';
        alertError.style.display = 'block';
        alertError.focus();
      }
      return;
    }
  });
}

/* ============================================
   Utility: escape HTML
   ============================================ */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
