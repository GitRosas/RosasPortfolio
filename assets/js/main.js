'use strict';

let allProjectsData = [];

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initTheme();
  initAuthNavigation();
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
  initProjectModal();
  initContactForm();
  initLoginForm();
  initPortfolioSlider();
  initCardGlow();
  initHeroParallax();
  initSmoothStagger();
});

const AUTH_STORAGE_KEY = 'portfolioAuth';
const AUTH_SESSION_MS = 20 * 60 * 1000;

/* ---- Auth Navigation ---- */
function initAuthNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const loggedIn = isAuthenticated();

  if (currentPage === 'portfolio.html' && !loggedIn) {
    window.location.href = 'login.html';
    return;
  }

  const navLinksContainer = document.getElementById('nav-links');
  if (!navLinksContainer) return;

  let loginLink = navLinksContainer.querySelector('a.nav-link[href="login.html"], a.nav-link[data-auth-link="logout"]');
  if (!loginLink) return;

  const loginListItem = loginLink.closest('li');

  if (loggedIn) {
    ensurePortfolioMenuItem(navLinksContainer, loginListItem);
    scheduleAutoLogout();
    loginLink.textContent = 'Logout';
    loginLink.setAttribute('href', '#');
    loginLink.setAttribute('data-auth-link', 'logout');
    loginLink.classList.add('nav-link-auth');
    loginLink.classList.remove('active');
    loginLink.removeAttribute('aria-current');
  } else {
    removePortfolioMenuItem(navLinksContainer);
    loginLink.textContent = 'Login';
    loginLink.setAttribute('href', 'login.html');
    loginLink.removeAttribute('data-auth-link');
    loginLink.classList.add('nav-link-auth');
  }

  navLinksContainer.addEventListener('click', e => {
    const logoutLink = e.target.closest('a[data-auth-link="logout"]');
    if (!logoutLink) return;
    e.preventDefault();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'login.html';
  });
}

function ensurePortfolioMenuItem(navLinksContainer, loginListItem) {
  let portfolioItem = navLinksContainer.querySelector('li[data-auth-item="portfolio"]');
  if (!portfolioItem) {
    portfolioItem = document.createElement('li');
    portfolioItem.setAttribute('data-auth-item', 'portfolio');
    const link = document.createElement('a');
    link.href = 'portfolio.html';
    link.className = 'nav-link';
    link.textContent = 'Portfolio';
    portfolioItem.appendChild(link);
    navLinksContainer.insertBefore(portfolioItem, loginListItem);
  }
}

function removePortfolioMenuItem(navLinksContainer) {
  const portfolioItem = navLinksContainer.querySelector('li[data-auth-item="portfolio"]');
  if (portfolioItem) portfolioItem.remove();
}

function isAuthenticated() {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return false;
    const parsed = JSON.parse(authData);
    if (!parsed || !parsed.email || !parsed.expiresAt) return false;

    const expiresAt = Date.parse(parsed.expiresAt);
    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

function scheduleAutoLogout() {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return;
    const parsed = JSON.parse(authData);
    const expiresAt = Date.parse(parsed.expiresAt || '');
    if (!Number.isFinite(expiresAt)) return;

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
      }
      return;
    }

    window.setTimeout(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.location.href = 'login.html';
    }, remaining);
  } catch (_) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

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
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
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
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navbar || !navLinks) return;

  const toggle = () => {
    const isOpen = navbar.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggle);

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navbar.classList.contains('nav-open')) toggle();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navbar.classList.contains('nav-open')) toggle();
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
  const COUNT = 70, MAX_DIST = 140;

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
    const isDark = document.documentElement.classList.contains('theme-dark');
    const color = isDark ? '96,165,250' : '59,130,246';
    const dotAlpha = isDark ? .5 : .65;
    const lineAlpha = isDark ? .2 : .3;
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${dotAlpha})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color},${lineAlpha * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = .7; ctx.stroke();
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
  let activeTag = 'All';

  fetch('assets/data/projects.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      allProjectsData = data;
      renderFilters(data, filtersContainer);
      renderProjects(data, grid);
      updateCount(data.length, resultsCount);
    })
    .catch(() => {
      grid.innerHTML = '<div class="no-results"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><p>Error loading projects.</p></div>';
    });

  if (searchInput) searchInput.addEventListener('input', () => applyFilters(allProjectsData, activeTag, searchInput.value, grid, resultsCount));
  if (filtersContainer) filtersContainer.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;
    activeTag = btn.dataset.tag;
    filtersContainer.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters(allProjectsData, activeTag, searchInput ? searchInput.value : '', grid, resultsCount);
  });
}
function initFeaturedProjects() {
  const grid = document.getElementById('featured-projects');
  if (!grid) return;
  fetch('assets/data/projects.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      allProjectsData = data;
      renderProjects(data.slice(0, 3), grid);
    })
    .catch(() => { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center">Could not load projects.</p>'; });
}

/* ---- Render Helpers ---- */
function renderFilters(projects, container) {
  if (!container) return;
  const tags = new Set();
  projects.forEach(p => p.tags.forEach(t => tags.add(t)));
  let html = '<button class="filter-tag active" data-tag="All">All</button>';
  Array.from(tags).sort().forEach(tag => { html += `<button class="filter-tag" data-tag="${esc(tag)}">${esc(tag)}</button>`; });
  container.innerHTML = html;
}

function applyFilters(projects, tag, query, grid, countEl) {
  const q = query.toLowerCase().trim();
  const filtered = projects.filter(p => {
    const matchTag = tag === 'All' || p.tags.includes(tag);
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchTag && matchQ;
  });
  renderProjects(filtered, grid);
  updateCount(filtered.length, countEl);
}

function renderProjects(projects, grid) {
  if (!projects.length) {
    grid.innerHTML = '<div class="no-results"><i class="fa-solid fa-folder-open" aria-hidden="true"></i><p>No results found.</p></div>';
    return;
  }
  grid.innerHTML = projects.map(p => `
    <article class="project-card" data-project-id="${esc(p.id)}" role="button" tabindex="0">
      <div class="project-card-img-wrapper">
        <img src="${esc(p.image)}" alt="Project: ${esc(p.title)}" class="project-card-img" loading="lazy">
        <div class="project-card-overlay">
          ${p.year ? `<span class="project-card-year">${esc(String(p.year))}</span>` : ''}
        </div>
      </div>
      <div class="project-card-body">
        <h3 class="project-card-title">${esc(p.title)}</h3>
        <p class="project-card-desc">${esc(p.description)}</p>
        <div class="project-card-tags">${p.tags.map(t => `<span class="project-card-tag">${esc(t)}</span>`).join('')}</div>
        <div class="project-card-links">
          ${p.links.github && p.links.github !== '#' ? `<a href="${esc(p.links.github)}" class="project-card-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub</a>` : ''}
          ${p.links.demo && p.links.demo !== '#' ? `<a href="${esc(p.links.demo)}" class="project-card-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Demo</a>` : ''}
        </div>
      </div>
    </article>
  `).join('');
  grid.querySelectorAll('.project-card-img').forEach(img => {
    img.addEventListener('error', () => img.classList.add('img-error'), { once: true });
  });
  grid.querySelectorAll('.project-card').forEach(card => {
    const onOpen = e => {
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      openProjectModal(card.dataset.projectId);
    };
    card.addEventListener('click', onOpen);
    card.addEventListener('keydown', onOpen);
  });
}

function updateCount(count, el) {
  if (!el) return;
  el.textContent = `${count} project${count !== 1 ? 's' : ''} found${count !== 1 ? '' : ''}`;
}

/* ---- Project Modal ---- */

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close');
  const overlay = document.getElementById('modal-overlay');
  if (!modal || !closeBtn || !overlay) return;

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}

function openProjectModal(projectId) {
  const project = allProjectsData.find(p => p.id === projectId);
  const modal = document.getElementById('project-modal');
  if (!project || !modal) return;

  const img = document.getElementById('modal-image');
  if (img) { img.src = project.image; img.alt = `Project: ${project.title}`; }
  document.getElementById('modal-title').textContent = project.title;
  document.getElementById('modal-description').textContent = project.description;
  document.getElementById('modal-year').textContent = project.year || '';
  document.getElementById('modal-tags').innerHTML = project.tags.map(t => `<span>${esc(t)}</span>`).join('');
  document.getElementById('modal-links').innerHTML = [
    project.links.github && project.links.github !== '#' && `<a href="${esc(project.links.github)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> GitHub</a>`,
    project.links.demo && project.links.demo !== '#' && `<a href="${esc(project.links.demo)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Demo</a>`
  ].filter(Boolean).join('');

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
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
        alertError.textContent = 'The form is not yet configured. See the README for instructions.';
        alertError.style.display = 'block';
        alertError.focus();
      }
    }
  });
}

/* ---- Login Form ---- */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const alertSuccess = document.getElementById('login-alert-success');
  const alertError = document.getElementById('login-alert-error');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  const validEmail = 'admin@admin.com';
  const validPassword = 'admin1234';

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (alertSuccess) alertSuccess.style.display = 'none';
    if (alertError) alertError.style.display = 'none';
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));

    let valid = true;
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim() || !input.checkValidity()) {
        input.closest('.form-group').classList.add('invalid');
        valid = false;
      }
    });

    if (!valid) {
      const first = form.querySelector('.form-group.invalid .form-input');
      if (first) first.focus();
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (email === validEmail && password === validPassword) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        email,
        loggedInAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + AUTH_SESSION_MS).toISOString()
      }));

      if (alertSuccess) {
        alertSuccess.style.display = 'block';
        alertSuccess.focus();
      }

      setTimeout(() => {
        window.location.href = 'portfolio.html';
      }, 900);
      return;
    }

    if (alertError) {
      alertError.textContent = 'Invalid credentials. Please check your email and password.';
      alertError.style.display = 'block';
      alertError.focus();
    }

    if (emailInput) emailInput.closest('.form-group').classList.add('invalid');
    if (passwordInput) passwordInput.closest('.form-group').classList.add('invalid');
  });
}

/* ---- Portfolio Slider ---- */
function initPortfolioSlider() {
  const slider = document.getElementById('portfolio-slider');
  if (!slider) return;

  const track = slider.querySelector('.portfolio-track');
  const slides = Array.from(slider.querySelectorAll('.portfolio-slide'));
  const prevBtn = document.getElementById('portfolio-prev');
  const nextBtn = document.getElementById('portfolio-next');
  const dots = Array.from(slider.querySelectorAll('.portfolio-dot'));
  if (!track || !slides.length || !prevBtn || !nextBtn) return;

  let current = 0;

  const render = () => {
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => {
      const isActive = i === current;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    render();
  });

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % slides.length;
    render();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      current = i;
      render();
    });
  });

  render();
}

/* ---- Card Glow (cursor-following radial glow) ---- */
function initCardGlow() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.service-card, .project-card, .contact-info-item, .stat-item');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--glow-x', x + 'px');
    card.style.setProperty('--glow-y', y + 'px');
    if (!card.classList.contains('has-glow')) card.classList.add('has-glow');
  });
  document.addEventListener('mouseleave', e => {
    const card = e.target.closest('.service-card, .project-card, .contact-info-item, .stat-item');
    if (card) card.classList.remove('has-glow');
  }, true);
}

/* ---- Hero Parallax on Scroll ---- */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const text = hero.querySelector('.hero-text');
  const avatar = hero.querySelector('.hero-avatar-wrapper');
  const grid = hero.querySelector('.hero-grid-pattern');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const heroH = hero.offsetHeight;
      if (y < heroH) {
        const ratio = y / heroH;
        if (text) text.style.transform = `translateY(${ratio * 60}px)`;
        if (avatar) avatar.style.transform = `translateY(${ratio * 40}px) scale(${1 - ratio * 0.1})`;
        if (grid) grid.style.transform = `translateY(${ratio * 25}px)`;
      }
      ticking = false;
    });
  }, { passive: true });
}

/* ---- Smooth Stagger for grids ---- */
function initSmoothStagger() {
  const grids = document.querySelectorAll('.services-grid, .tech-strip, .projects-grid, .skills-grid, .contact-info-list');
  if (!grids.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const children = entry.target.children;
      Array.from(children).forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(25px)';
        setTimeout(() => {
          child.style.transition = 'opacity .6s cubic-bezier(.23,1,.32,1), transform .6s cubic-bezier(.23,1,.32,1)';
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, i * 100);
      });
    });
  }, { threshold: 0.1 });
  grids.forEach(g => observer.observe(g));
}

/* ---- Escape HTML ---- */
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
