'use strict';

let allProjectsData = [];

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initTheme();
  initLanguageToggle();
  initAnalyticsTracking();
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
  initPortfolioLightbox();
  initDashboard();
  initCardGlow();
  initHeroParallax();
  initSmoothStagger();
});

const AUTH_STORAGE_KEY = 'portfolioAuth';
const AUTH_SESSION_MS = 20 * 60 * 1000;
const LANGUAGE_STORAGE_KEY = 'portfolioLang';
const ANALYTICS_STORAGE_KEY = 'portfolioAnalytics';
let clientIpPromise = null;
let analyticsWriteQueue = Promise.resolve();

const I18N = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      about: 'About Me',
      contact: 'Contact',
      login: 'Login',
      logout: 'Logout',
      portfolio: 'Portfolio',
      dashboard: 'Dashboard'
    },
    pages: {
      loginTitle: 'Login',
      loginSubtitle: 'Sign in to continue.',
      accessTitle: 'Access',
      accessSubtitle: 'Use your credentials to sign in.',
      portfolioTitle: 'Portfolio',
      portfolioSubtitle: 'Exclusive gallery visible after login.',
      sliderTitle: 'Image Slider',
      sliderSubtitle: '10 photos and project visuals in a private carousel.',
      dashboardTitle: 'Dashboard',
      dashboardSubtitle: 'Private analytics and session details.',
      quickActions: 'Quick Actions',
      analyticsSummary: 'Analytics Summary',
      recentEvents: 'Recent Events'
    },
    labels: {
      email: 'Email',
      password: 'Password',
      loginSuccess: 'Login successful. Redirecting...',
      loginInvalid: 'Invalid credentials.',
      lastLogin: 'Last Login',
      dashboardVisits: 'Dashboard Visits',
      portfolioVisits: 'Portfolio Visits',
      cvClicks: 'CV Clicks',
      formSubmits: 'Contact Form Sends',
      githubClicks: 'GitHub Clicks',
      linkedinClicks: 'LinkedIn Clicks',
      loginEvents: 'Logins',
      siteEntries: 'Site Entries',
      ip: 'IP',
      noEvents: 'No events registered yet.',
      editProfile: 'Edit Profile',
      managePortfolio: 'Manage Portfolio',
      openContact: 'Open Contact Page'
    },
    common: {
      skipToContent: 'Skip to main content',
      switchToPortuguese: 'Switch to Portuguese',
      switchToEnglish: 'Switch to English',
      footerNavigation: 'Navigation',
      footerTechnologies: 'Technologies',
      footerContact: 'Contact',
      footerDesc: 'Engineer working with MBSE, SysML v2, ECSS/PUS and software for space systems - focused on connecting system models with the code that actually brings them to life.',
      footerMadeWith: 'Made using HTML5, CSS3 & JavaScript',
      location: 'Coimbra, Portugal',
      tech1: 'SysML v2',
      tech2: 'ECSS / PUS',
      tech3: 'Python & C++',
      tech4: 'Docker & DevOps'
    },
    home: {
      heroHi: "Hi, I'm",
      heroBioHtml: 'Software & Systems Engineering student and intern at Critical Software,focused on <strong>MBSE/SysML v2</strong>  and <strong>ECSS/PUS</strong>. For now I build models,  tools and solutions that bridge systems engineering and code.',
      btnViewProjects: 'View Projects',
      btnGetInTouch: 'Get in Touch',
      scroll: 'scroll',
      roles: ['Software Engineer', 'Systems Engineer', 'Football Referee', 'Photographer'],
      statProjects: 'Projects',
      statTechnologies: 'Technologies',
      statYears: 'Years Experience',
      statDedication: 'Dedication',
      tagWhatIDo: 'What I Do',
      expertiseTitle: 'Areas of Expertise',
      expertiseSubtitle: 'Domains where I transform complex requirements into concrete solutions.',
      service1Title: 'Model-Based Systems Engineering',
      service1Desc: 'Systems modeling with SysML v2 - requirements, architecture, behavior and integrated traceability from concept to verification.',
      service2Title: 'Space Systems Software',
      service2Desc: 'Development of tools and parsers in C++ and Python aligned with ECSS standards and the Packet Utilization Standard (PUS).',
      service3Title: 'DevOps & Automation',
      service3Desc: 'Containerized environments with Docker, CI/CD pipelines, and continuous integration for engineering and space software projects.',
      tagTechStack: 'Tech Stack',
      techTitle: 'Technologies & Tools',
      techSubtitle: 'The tools I use daily to build and model.',
      tagPortfolio: 'Portfolio',
      featuredTitle: 'Featured Projects',
      featuredSubtitle: 'Some of my recent work.',
      btnViewAll: 'View All Projects',
      ctaTitle: "Let's Work Together?",
      ctaSubtitle: 'Have an interesting project or want to discuss MBSE and space systems? Get in touch.',
      btnSendMessage: 'Send Message',
      btnCallMe: 'Call Me'
    },
    about: {
      headerTitle: 'About Me',
      headerSubtitle: 'Journey, skills and education.',
      bioRole: 'Software & Systems Engineer',
      btnDownloadCv: 'Download CV',
      bioP1: "I'm a <strong>Software &amp; Systems Engineering</strong> student currently working as a <strong>Software &amp; Systems Engineer Intern</strong> at <strong>Critical Software</strong>, focused on <strong>Model-Based Systems Engineering (MBSE)</strong> for critical and space-related systems.",
      bioP2: 'I work with <strong>SysML v2</strong>, <strong>ECSS</strong> standards and the <strong>Packet Utilization Standard (PUS)</strong>, transforming complex requirements into structured, traceable and verifiable system architectures, while connecting models with implementation in Linux-based environments. Previously, I gained experience as a <strong>Software Developer Intern</strong>, working with <strong>C#</strong>, <strong>ASP.NET MVC</strong>, <strong>SQL Azure</strong> and web technologies, building a solid foundation in software development.',
      bioP3: 'Alongside my technical path, I have been a <strong>football referee</strong> for over three years, developing strong decision-making, communication and leadership skills under pressure. I am particularly interested in bridging systems engineering and software development, where models and code come together to create real impact.',
      experienceTitle: 'Experience',
      educationTitle: 'Education',
      exp1Date: 'Feb 2026 - Present',
      exp1Title: 'Software & Systems Engineer',
      exp1Org: 'Critical Software - Internship',
      exp1Desc: "Curricular internship as part of a Bachelor's degree in Software Engineering - Information Systems. Coimbra, Portugal (Hybrid).",
      exp2Date: 'Feb 2023 - Present',
      exp2Title: 'Football Referee',
      exp2Org: 'Associação de Futebol de Coimbra',
      exp2Desc: 'Coimbra, Portugal.',
      exp3Date: 'Nov 2023 - Nov 2023',
      exp3Title: 'Volunteer Staff',
      exp3Org: 'Web Summit - Temporary',
      exp3Desc: 'Lisbon, Portugal (On-site).',
      exp4Date: 'Jun 2022 - Jul 2022',
      exp4Title: 'Software Developer',
      exp4Org: 'Prologica - Internship',
      exp4Desc: 'São João da Madeira, Aveiro, Portugal.',
      exp5Date: 'Apr 2022 - Apr 2022',
      exp5Title: 'Software Developer',
      exp5Org: 'Arrabal-AID - Internship',
      exp5Desc: 'Málaga, Andalusia, Spain (On-site).',
      exp6Date: 'Jun 2021 - Jun 2021',
      exp6Title: 'Software Developer',
      exp6Org: 'Prologica - Internship',
      exp6Desc: 'São João da Madeira, Aveiro, Portugal.',
      edu1Date: 'Sep 2022 - 2026',
      edu1Title: "Bachelor's degree, Software Engineering",
      edu1Org: 'Instituto Superior de Engenharia de Coimbra',
      edu1Desc: 'Branch: Information Systems. AEISEC: Member of the Sports Section (2025).',
      edu2Date: 'Sep 2019 - Sep 2022',
      edu2Title: '12th grade, Technician in Computer Systems Management and Programming',
      edu2Org: 'Escola Secundária Serafim Leite',
      edu2Desc: 'Final grade: 17.',
      skillsTitle: 'Skills',
      skillsSubtitle: 'Organized by domain and area of knowledge.',
      domains: 'Domains',
      technologies: 'Technologies',
      tools: 'Tools'
    },
    projects: {
      headerTitle: 'Projects',
      headerSubtitle: 'Explore all projects by area or search by keyword.',
      searchPlaceholder: 'Search projects...',
      searchAria: 'Search projects by title or description',
      loading: 'Loading...',
      all: 'All',
      foundSuffix: 'found',
      foundSingular: 'project',
      foundPlural: 'projects',
      noResults: 'No results found.',
      loadError: 'Error loading projects.'
    },
    contact: {
      headerTitle: 'Contact',
      headerSubtitle: 'Have a question or proposal? Send me a message.',
      formTitle: 'Send Message',
      formSubtitle: "Fill out the form below and I'll get back to you shortly.",
      labelName: 'Name',
      labelEmail: 'Email',
      labelSubject: 'Subject',
      labelMessage: 'Message',
      placeholderName: 'Your name',
      placeholderEmail: 'name@example.com',
      placeholderSubject: 'Email subject',
      placeholderMessage: 'Your message...',
      errorName: 'Please enter your name (min. 2 characters).',
      errorEmail: 'Please enter a valid email address.',
      errorSubject: 'Please enter a subject (min. 3 characters).',
      errorMessage: 'Please write a message (min. 10 characters).',
      submit: 'Send Message',
      success: "Message sent successfully! I'll get back to you shortly.",
      error: 'An error occurred sending the message.',
      infoTitle: 'Contact Information',
      infoSubtitle: 'You can also reach me directly.',
      phone: 'Phone',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      locationLabel: 'Location'
    }
  },
  pt: {
    nav: {
      home: 'Inicio',
      projects: 'Projetos',
      about: 'Sobre Mim',
      contact: 'Contacto',
      login: 'Entrar',
      logout: 'Sair',
      portfolio: 'Portfolio',
      dashboard: 'Painel'
    },
    pages: {
      loginTitle: 'Entrar',
      loginSubtitle: 'Inicia sessao para continuar.',
      accessTitle: 'Acesso',
      accessSubtitle: 'Usa as tuas credenciais para entrar.',
      portfolioTitle: 'Portfolio',
      portfolioSubtitle: 'Galeria exclusiva visivel apos login.',
      sliderTitle: 'Slider de Imagens',
      sliderSubtitle: '10 fotos e visuais de projetos num carrossel privado.',
      dashboardTitle: 'Painel',
      dashboardSubtitle: 'Analiticas privadas e detalhes da sessao.',
      quickActions: 'Acoes Rapidas',
      analyticsSummary: 'Resumo de Analiticas',
      recentEvents: 'Eventos Recentes'
    },
    labels: {
      email: 'Email',
      password: 'Password',
      loginSuccess: 'Login com sucesso. A redirecionar...',
      loginInvalid: 'Credenciais invalidas.',
      lastLogin: 'Ultimo Login',
      dashboardVisits: 'Visitas ao Painel',
      portfolioVisits: 'Visitas ao Portfolio',
      cvClicks: 'Cliques no CV',
      formSubmits: 'Envios do Formulario',
      githubClicks: 'Cliques no GitHub',
      linkedinClicks: 'Cliques no LinkedIn',
      loginEvents: 'Logins',
      siteEntries: 'Entradas no Site',
      ip: 'IP',
      noEvents: 'Ainda nao existem eventos.',
      editProfile: 'Editar Perfil',
      managePortfolio: 'Gerir Portfolio',
      openContact: 'Abrir Pagina de Contacto'
    },
    common: {
      skipToContent: 'Saltar para o conteudo principal',
      switchToPortuguese: 'Mudar para Portugues',
      switchToEnglish: 'Mudar para Ingles',
      footerNavigation: 'Navegacao',
      footerTechnologies: 'Tecnologias',
      footerContact: 'Contacto',
      footerDesc: 'Engenheiro a trabalhar com MBSE, SysML v2, ECSS/PUS e software para sistemas espaciais - focado em conectar modelos de sistemas com o codigo que realmente os traz a vida.',
      footerMadeWith: 'Made using HTML5, CSS3 & JavaScript',
      location: 'Coimbra, Portugal',
      tech1: 'SysML v2',
      tech2: 'ECSS / PUS',
      tech3: 'Python e C++',
      tech4: 'Docker e DevOps'
    },
    home: {
      heroHi: 'Ola, eu sou',
      heroBioHtml: 'Engenheiro focado em <strong>MBSE/SysML v2</strong>, <strong>ECSS/PUS</strong> e software para sistemas espaciais. Desenvolvo modelos, ferramentas e solucoes que ligam engenharia de sistemas e codigo.',
      btnViewProjects: 'Ver Projetos',
      btnGetInTouch: 'Entrar em Contacto',
      scroll: 'descer',
      roles: ['Engenheiro MBSE', 'Especialista SysML v2', 'Programador de Software', 'Entusiasta de Sistemas Espaciais'],
      statProjects: 'Projetos',
      statTechnologies: 'Tecnologias',
      statYears: 'Anos de Experiencia',
      statDedication: 'Dedicacao',
      tagWhatIDo: 'O Que Faco',
      expertiseTitle: 'Areas de Especializacao',
      expertiseSubtitle: 'Dominios onde transformo requisitos complexos em solucoes concretas.',
      service1Title: 'Engenharia de Sistemas Baseada em Modelos',
      service1Desc: 'Modelacao de sistemas com SysML v2 - requisitos, arquitetura, comportamento e rastreabilidade integrada do conceito a verificacao.',
      service2Title: 'Software para Sistemas Espaciais',
      service2Desc: 'Desenvolvimento de ferramentas e parsers em C++ e Python alinhados com normas ECSS e o Packet Utilization Standard (PUS).',
      service3Title: 'DevOps e Automacao',
      service3Desc: 'Ambientes contentorizados com Docker, pipelines CI/CD e integracao continua para projetos de engenharia e software espacial.',
      tagTechStack: 'Stack Tecnologica',
      techTitle: 'Tecnologias e Ferramentas',
      techSubtitle: 'Ferramentas que uso diariamente para modelar e desenvolver.',
      tagPortfolio: 'Portfolio',
      featuredTitle: 'Projetos em Destaque',
      featuredSubtitle: 'Alguns dos meus trabalhos recentes.',
      btnViewAll: 'Ver Todos os Projetos',
      ctaTitle: 'Vamos Trabalhar Juntos?',
      ctaSubtitle: 'Tens um projeto interessante ou queres falar sobre MBSE e sistemas espaciais? Fala comigo.',
      btnSendMessage: 'Enviar Mensagem',
      btnCallMe: 'Ligar'
    },
    about: {
      headerTitle: 'Sobre Mim',
      headerSubtitle: 'Percurso, competencias e formacao.',
      bioRole: 'Engenheiro de MBSE e Software',
      btnDownloadCv: 'Descarregar CV',
      bioP1: 'Sou estudante de <strong>Engenharia de Software e Sistemas</strong>, atualmente a realizar um estágio como <strong>Software & Systems Engineer</strong> na <strong>Critical Software</strong>, com foco em <strong>Engenharia de Sistemas Baseada em Modelos (MBSE)</strong> para sistemas críticos e espaciais.',
      bioP2: 'Trabalho com <strong>SysML v2</strong>, normas <strong>ECSS</strong> e o <strong>Packet Utilization Standard (PUS)</strong>, transformando requisitos complexos em arquiteturas de sistema estruturadas, rastreáveis e verificáveis, ligando modelos à implementação em ambientes Linux. Anteriormente, adquiri experiência como estagiário de <strong>Desenvolvimento de Software</strong>, trabalhando com <strong>C#</strong>, <strong>ASP.NET MVC</strong>, <strong>SQL Azure</strong> e tecnologias web, construindo uma base sólida em desenvolvimento de software.',
      bioP3: 'Em paralelo com o meu percurso técnico, sou <strong>árbitro de futebol</strong> há mais de três anos, desenvolvendo competências sólidas de tomada de decisão, comunicação e liderança sob pressão. Tenho especial interesse em criar pontes entre engenharia de sistemas e desenvolvimento de software, onde modelos e código se unem para gerar impacto real.',
      experienceTitle: 'Experiencia',
      educationTitle: 'Formacao',
      exp1Date: 'fev 2026 - o momento',
      exp1Title: 'Software & Systems Engineer',
      exp1Org: 'Critical Software - Estágio',
      exp1Desc: 'Estágio curricular no âmbito da licenciatura em Engenharia de Software - Sistemas de Informação. Coimbra, Portugal (Híbrida).',
      exp2Date: 'fev 2023 - o momento',
      exp2Title: 'Football Referee',
      exp2Org: 'Associação de Futebol de Coimbra',
      exp2Desc: 'Coimbra, Portugal.',
      exp3Date: 'nov 2023 - nov 2023',
      exp3Title: 'Volunteer Staff',
      exp3Org: 'Web Summit - Temporário',
      exp3Desc: 'Lisboa, Portugal (Presencial).',
      exp4Date: 'jun 2022 - jul 2022',
      exp4Title: 'Software Developer',
      exp4Org: 'Prologica - Estágio',
      exp4Desc: 'São João da Madeira, Aveiro, Portugal.',
      exp5Date: 'abr 2022 - abr 2022',
      exp5Title: 'Software Developer',
      exp5Org: 'Arrabal-AID - Estágio',
      exp5Desc: 'Málaga, Andaluzia, Espanha (Presencial).',
      exp6Date: 'jun 2021 - jun 2021',
      exp6Title: 'Software Developer',
      exp6Org: 'Prologica - Estágio',
      exp6Desc: 'São João da Madeira, Aveiro, Portugal.',
      edu1Date: 'set 2022 - 2026',
      edu1Title: 'Licenciatura em Engenharia de Software',
      edu1Org: 'Instituto Superior de Engenharia de Coimbra',
      edu1Desc: 'Ramo: Sistemas de Informação. AEISEC: Membro da Secção de Desporto (2025).',
      edu2Date: 'set 2019 - set 2022',
      edu2Title: '12.º ano, Técnico de Gestão e Programação de Sistemas Informáticos',
      edu2Org: 'Escola Secundária Serafim Leite',
      edu2Desc: 'Nota final: 17.',
      skillsTitle: 'Competencias',
      skillsSubtitle: 'Organizadas por dominio e area de conhecimento.',
      domains: 'Dominios',
      technologies: 'Tecnologias',
      tools: 'Ferramentas'
    },
    projects: {
      headerTitle: 'Projetos',
      headerSubtitle: 'Explora todos os projetos por area ou pesquisa por palavra-chave.',
      searchPlaceholder: 'Pesquisar projetos...',
      searchAria: 'Pesquisar projetos por titulo ou descricao',
      loading: 'A carregar...',
      all: 'Todos',
      foundSuffix: 'encontrados',
      foundSingular: 'projeto',
      foundPlural: 'projetos',
      noResults: 'Sem resultados.',
      loadError: 'Erro ao carregar projetos.'
    },
    contact: {
      headerTitle: 'Contacto',
      headerSubtitle: 'Tens uma questao ou proposta? Envia-me uma mensagem.',
      formTitle: 'Enviar Mensagem',
      formSubtitle: 'Preenche o formulario abaixo e entrarei em contacto contigo em breve.',
      labelName: 'Nome',
      labelEmail: 'Email',
      labelSubject: 'Assunto',
      labelMessage: 'Mensagem',
      placeholderName: 'O teu nome',
      placeholderEmail: 'nome@exemplo.com',
      placeholderSubject: 'Assunto do email',
      placeholderMessage: 'A tua mensagem...',
      errorName: 'Por favor indica o teu nome (min. 2 caracteres).',
      errorEmail: 'Por favor indica um email valido.',
      errorSubject: 'Por favor indica um assunto (min. 3 caracteres).',
      errorMessage: 'Por favor escreve uma mensagem (min. 10 caracteres).',
      submit: 'Enviar Mensagem',
      success: 'Mensagem enviada com sucesso! Responderei em breve.',
      error: 'Ocorreu um erro ao enviar a mensagem.',
      infoTitle: 'Informacao de Contacto',
      infoSubtitle: 'Tambem podes contactar-me diretamente.',
      phone: 'Telefone',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      locationLabel: 'Localizacao'
    }
  }
};

function getCurrentLanguage() {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === 'pt' ? 'pt' : 'en';
}

function i18nValue(path) {
  const lang = getCurrentLanguage();
  const parts = path.split('.');
  let ref = I18N[lang];
  for (const part of parts) {
    if (!ref || typeof ref !== 'object') return undefined;
    ref = ref[part];
  }
  return ref;
}

function t(path) {
  const ref = i18nValue(path);
  return typeof ref === 'string' ? ref : path;
}

function initLanguageToggle() {
  const actions = document.querySelector('.navbar-actions');
  if (!actions) return;

  let langBtn = document.getElementById('lang-toggle');
  if (!langBtn) {
    langBtn = document.createElement('button');
    langBtn.id = 'lang-toggle';
    langBtn.type = 'button';
    langBtn.className = 'btn-lang-toggle';
    actions.insertBefore(langBtn, actions.firstChild);
  }

  const syncLabel = () => {
    const lang = getCurrentLanguage();
    langBtn.textContent = lang === 'en' ? 'PT' : 'EN';
    langBtn.setAttribute('aria-label', lang === 'en' ? t('common.switchToPortuguese') : t('common.switchToEnglish'));
  };

  langBtn.addEventListener('click', () => {
    const next = getCurrentLanguage() === 'en' ? 'pt' : 'en';
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    applyTranslations();
    syncLabel();
  });

  applyTranslations();
  syncLabel();
}

function applyTranslations() {
  const setText = (selector, key) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = t(key);
  };

  const setHtml = (selector, key) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = i18nValue(key) || t(key);
  };

  const setAttr = (selector, attr, key) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, t(key));
  };

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const navMap = [
    ['index.html', 'nav.home'],
    ['projects.html', 'nav.projects'],
    ['about.html', 'nav.about'],
    ['contact.html', 'nav.contact']
  ];

  navMap.forEach(([href, key]) => {
    document.querySelectorAll(`a.nav-link[href="${href}"]`).forEach(link => {
      link.textContent = t(key);
    });
  });

  document.querySelectorAll('a.nav-link[href="login.html"]').forEach(link => {
    link.textContent = t('nav.login');
  });

  document.querySelectorAll('a[data-auth-link="logout"]').forEach(link => {
    link.textContent = t('nav.logout');
  });

  document.querySelectorAll('a[href="portfolio.html"]').forEach(link => {
    if (link.classList.contains('nav-link') || link.closest('.footer-links')) {
      link.textContent = t('nav.portfolio');
    }
  });

  document.querySelectorAll('a[href="dashboard.html"]').forEach(link => {
    if (link.classList.contains('nav-link') || link.closest('.footer-links')) {
      link.textContent = t('nav.dashboard');
    }
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });

  setText('.skip-link', 'common.skipToContent');

  const footerCols = document.querySelectorAll('.footer-top > div');
  if (footerCols.length >= 4) {
        const navLinks = footerCols[1].querySelectorAll('.footer-links a');
        navLinks.forEach(link => {
          const href = (link.getAttribute('href') || '').toLowerCase();
          if (href === 'index.html') link.textContent = t('nav.home');
          if (href === 'projects.html') link.textContent = t('nav.projects');
          if (href === 'about.html') link.textContent = t('nav.about');
          if (href === 'contact.html') link.textContent = t('nav.contact');
          if (href === 'portfolio.html') link.textContent = t('nav.portfolio');
          if (href === 'dashboard.html') link.textContent = t('nav.dashboard');
        });

    const heading1 = footerCols[1].querySelector('.footer-heading');
    const heading2 = footerCols[2].querySelector('.footer-heading');
    const heading3 = footerCols[3].querySelector('.footer-heading');
    if (heading1) heading1.textContent = t('common.footerNavigation');
    if (heading2) heading2.textContent = t('common.footerTechnologies');
    if (heading3) heading3.textContent = t('common.footerContact');

    const techLinks = footerCols[2].querySelectorAll('.footer-links a');
    if (techLinks[0]) techLinks[0].textContent = t('common.tech1');
    if (techLinks[1]) techLinks[1].textContent = t('common.tech2');
    if (techLinks[2]) techLinks[2].textContent = t('common.tech3');
    if (techLinks[3]) techLinks[3].textContent = t('common.tech4');

    const location = footerCols[3].querySelector('.footer-contact-item span');
    if (location) location.textContent = t('common.location');
  }

  setText('.footer-desc', 'common.footerDesc');
  const footerTech = document.querySelector('.footer-tech');
  if (footerTech) {
    if (footerTech.querySelector('.fa-heart')) {
      footerTech.innerHTML = getCurrentLanguage() === 'pt'
        ? 'Feito com <i class="fa-solid fa-heart" aria-hidden="true"></i> HTML5, CSS3 e JavaScript'
        : 'Made with <i class="fa-solid fa-heart" aria-hidden="true"></i> using HTML5, CSS3 &amp; JavaScript';
    } else {
      footerTech.textContent = t('common.footerMadeWith');
    }
  }

  if (currentPage === 'index.html' || currentPage === '') {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
      heroSubtitle.innerHTML = `<span class="wave-emoji">👋</span> ${t('home.heroHi')}`;
    }
    setHtml('.hero-bio', 'home.heroBioHtml');

    const viewProjectsBtn = document.querySelector('.hero-buttons a[href="projects.html"]');
    if (viewProjectsBtn) viewProjectsBtn.innerHTML = `<i class="fa-solid fa-rocket" aria-hidden="true"></i> ${t('home.btnViewProjects')}`;
    const contactBtn = document.querySelector('.hero-buttons a[href="contact.html"]');
    if (contactBtn) contactBtn.innerHTML = `<i class="fa-solid fa-envelope" aria-hidden="true"></i> ${t('home.btnGetInTouch')}`;
    setText('.scroll-indicator span', 'home.scroll');

    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels[0]) statLabels[0].textContent = t('home.statProjects');
    if (statLabels[1]) statLabels[1].textContent = t('home.statTechnologies');
    if (statLabels[2]) statLabels[2].textContent = t('home.statYears');
    if (statLabels[3]) statLabels[3].textContent = t('home.statDedication');

    setText('.section[aria-labelledby="services-heading"] .section-tag', 'home.tagWhatIDo');
    setText('#services-heading', 'home.expertiseTitle');
    setText('.section[aria-labelledby="services-heading"] .section-subtitle', 'home.expertiseSubtitle');

    const serviceCards = document.querySelectorAll('.services-grid .service-card');
    if (serviceCards[0]) {
      const h3 = serviceCards[0].querySelector('h3');
      const p = serviceCards[0].querySelector('p');
      if (h3) h3.textContent = t('home.service1Title');
      if (p) p.textContent = t('home.service1Desc');
    }
    if (serviceCards[1]) {
      const h3 = serviceCards[1].querySelector('h3');
      const p = serviceCards[1].querySelector('p');
      if (h3) h3.textContent = t('home.service2Title');
      if (p) p.textContent = t('home.service2Desc');
    }
    if (serviceCards[2]) {
      const h3 = serviceCards[2].querySelector('h3');
      const p = serviceCards[2].querySelector('p');
      if (h3) h3.textContent = t('home.service3Title');
      if (p) p.textContent = t('home.service3Desc');
    }

    setText('.section[aria-labelledby="tech-heading"] .section-tag', 'home.tagTechStack');
    setText('#tech-heading', 'home.techTitle');
    setText('.section[aria-labelledby="tech-heading"] .section-subtitle', 'home.techSubtitle');

    setText('.section[aria-labelledby="featured-heading"] .section-tag', 'home.tagPortfolio');
    setText('#featured-heading', 'home.featuredTitle');
    setText('.section[aria-labelledby="featured-heading"] .section-subtitle', 'home.featuredSubtitle');
    const viewAllBtn = document.querySelector('.section-cta a[href="projects.html"]');
    if (viewAllBtn) viewAllBtn.innerHTML = `${t('home.btnViewAll')} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>`;

    setText('.cta-banner h2', 'home.ctaTitle');
    setText('.cta-banner p', 'home.ctaSubtitle');
    const sendBtn = document.querySelector('.cta-banner a[href="contact.html"]');
    if (sendBtn) sendBtn.innerHTML = `<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> ${t('home.btnSendMessage')}`;
    const callBtn = document.querySelector('.cta-banner a[href^="tel:"]');
    if (callBtn) callBtn.innerHTML = `<i class="fa-solid fa-phone" aria-hidden="true"></i> ${t('home.btnCallMe')}`;
  }

  if (currentPage === 'about.html') {
    setText('.page-header h1', 'about.headerTitle');
    setText('.page-header p', 'about.headerSubtitle');
    setText('.bio-role', 'about.bioRole');
    const bioLocation = document.querySelector('.bio-location');
    if (bioLocation) bioLocation.innerHTML = `<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${t('common.location')}`;
    const cvBtn = document.querySelector('.bio-sidebar .btn.btn-primary');
    if (cvBtn) cvBtn.innerHTML = `<i class="fa-solid fa-download" aria-hidden="true"></i> ${t('about.btnDownloadCv')}`;

    const bioParagraphs = document.querySelectorAll('.bio-content p');
    if (bioParagraphs[0]) bioParagraphs[0].innerHTML = i18nValue('about.bioP1');
    if (bioParagraphs[1]) bioParagraphs[1].innerHTML = i18nValue('about.bioP2');
    if (bioParagraphs[2]) bioParagraphs[2].innerHTML = i18nValue('about.bioP3');

    const sectionTitles = document.querySelectorAll('.two-col .section-title');
    if (sectionTitles[0]) sectionTitles[0].innerHTML = `<i class="fa-solid fa-briefcase icon-accent" aria-hidden="true"></i> ${t('about.experienceTitle')}`;
    if (sectionTitles[1]) sectionTitles[1].innerHTML = `<i class="fa-solid fa-graduation-cap icon-accent" aria-hidden="true"></i> ${t('about.educationTitle')}`;

    const timelines = document.querySelectorAll('.timeline');
    if (timelines[0]) {
      const items = timelines[0].querySelectorAll('.timeline-item');
      for (let index = 0; index < 6; index += 1) {
        const item = items[index];
        if (!item) continue;
        const key = `about.exp${index + 1}`;
        const date = item.querySelector('.timeline-date');
        const title = item.querySelector('.timeline-title');
        const org = item.querySelector('.timeline-org');
        const desc = item.querySelector('.timeline-desc');
        if (date) date.textContent = t(`${key}Date`);
        if (title) title.textContent = t(`${key}Title`);
        if (org) org.textContent = t(`${key}Org`);
        if (desc) desc.textContent = t(`${key}Desc`);
      }
    }
    if (timelines[1]) {
      const items = timelines[1].querySelectorAll('.timeline-item');
      for (let index = 0; index < 2; index += 1) {
        const item = items[index];
        if (!item) continue;
        const key = `about.edu${index + 1}`;
        const date = item.querySelector('.timeline-date');
        const title = item.querySelector('.timeline-title');
        const org = item.querySelector('.timeline-org');
        const desc = item.querySelector('.timeline-desc');
        if (date) date.textContent = t(`${key}Date`);
        if (title) title.textContent = t(`${key}Title`);
        if (org) org.textContent = t(`${key}Org`);
        if (desc) desc.textContent = t(`${key}Desc`);
      }
    }

    setText('#skills-heading', 'about.skillsTitle');
    setText('#skills-heading + .section-subtitle', 'about.skillsSubtitle');
    const skillTitles = document.querySelectorAll('.skill-group-title');
    if (skillTitles[0]) skillTitles[0].innerHTML = `<i class="fa-solid fa-satellite icon-accent" aria-hidden="true"></i> ${t('about.domains')}`;
    if (skillTitles[1]) skillTitles[1].innerHTML = `<i class="fa-solid fa-code icon-accent" aria-hidden="true"></i> ${t('about.technologies')}`;
    if (skillTitles[2]) skillTitles[2].innerHTML = `<i class="fa-solid fa-wrench icon-accent" aria-hidden="true"></i> ${t('about.tools')}`;
  }

  if (currentPage === 'projects.html') {
    setText('.page-header h1', 'projects.headerTitle');
    setText('.page-header p', 'projects.headerSubtitle');
    setAttr('#project-search', 'placeholder', 'projects.searchPlaceholder');
    setAttr('#project-search', 'aria-label', 'projects.searchAria');
    setText('#results-count', 'projects.loading');
  }

  if (currentPage === 'contact.html') {
    setText('.page-header h1', 'contact.headerTitle');
    setText('.page-header p', 'contact.headerSubtitle');
    setText('.contact-grid .reveal-left .section-title', 'contact.formTitle');
    setText('.contact-grid .reveal-left .section-subtitle', 'contact.formSubtitle');

    const setLabel = (forId, key) => {
      const label = document.querySelector(`label[for="${forId}"]`);
      if (!label) return;
      const star = label.querySelector('span[aria-hidden="true"]');
      label.textContent = `${t(key)} `;
      if (star) label.appendChild(star);
    };

    setLabel('contact-name', 'contact.labelName');
    setLabel('contact-email', 'contact.labelEmail');
    setLabel('contact-subject', 'contact.labelSubject');
    setLabel('contact-message', 'contact.labelMessage');

    setAttr('#contact-name', 'placeholder', 'contact.placeholderName');
    setAttr('#contact-email', 'placeholder', 'contact.placeholderEmail');
    setAttr('#contact-subject', 'placeholder', 'contact.placeholderSubject');
    setAttr('#contact-message', 'placeholder', 'contact.placeholderMessage');

    const formErrors = document.querySelectorAll('.contact-form .form-error');
    if (formErrors[0]) formErrors[0].textContent = t('contact.errorName');
    if (formErrors[1]) formErrors[1].textContent = t('contact.errorEmail');
    if (formErrors[2]) formErrors[2].textContent = t('contact.errorSubject');
    if (formErrors[3]) formErrors[3].textContent = t('contact.errorMessage');

    const submitBtn = document.querySelector('#contact-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> ${t('contact.submit')}`;

    const successAlert = document.getElementById('form-alert-success');
    if (successAlert) successAlert.innerHTML = `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${t('contact.success')}`;
    const errorAlert = document.getElementById('form-alert-error');
    if (errorAlert) errorAlert.innerHTML = `<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> ${t('contact.error')}`;

    setText('.contact-grid .reveal-right .section-title', 'contact.infoTitle');
    setText('.contact-grid .reveal-right .section-subtitle', 'contact.infoSubtitle');

    const infoLabels = document.querySelectorAll('.contact-info-label');
    if (infoLabels[0]) infoLabels[0].textContent = t('contact.phone');
    if (infoLabels[1]) infoLabels[1].textContent = t('contact.labelEmail');
    if (infoLabels[2]) infoLabels[2].textContent = t('contact.linkedin');
    if (infoLabels[3]) infoLabels[3].textContent = t('contact.github');
    if (infoLabels[4]) infoLabels[4].textContent = t('contact.locationLabel');
  }

  document.documentElement.lang = getCurrentLanguage() === 'pt' ? 'pt' : 'en';
}

/* ---- Auth Navigation ---- */
function initAuthNavigation() {
  const pathname = window.location.pathname.toLowerCase();
  const currentPage = pathname.split('/').pop() || 'index.html';
  const loggedIn = isAuthenticated();

  const isPortfolioRoute = currentPage === 'portfolio.html' || currentPage === 'portfolio';
  const isDashboardRoute = currentPage === 'dashboard.html' || currentPage === 'dashboard';
  if ((isPortfolioRoute || isDashboardRoute) && !loggedIn) {
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
    ensureDashboardMenuItem(navLinksContainer, loginListItem);
    scheduleAutoLogout();
    loginLink.textContent = t('nav.logout');
    loginLink.setAttribute('href', '#');
    loginLink.setAttribute('data-auth-link', 'logout');
    loginLink.classList.add('nav-link-auth');
    loginLink.classList.remove('active');
    loginLink.removeAttribute('aria-current');
  } else {
    removePortfolioMenuItem(navLinksContainer);
    removeDashboardMenuItem(navLinksContainer);
    loginLink.textContent = t('nav.login');
    loginLink.setAttribute('href', 'login.html');
    loginLink.removeAttribute('data-auth-link');
    loginLink.classList.add('nav-link-auth');
  }

  navLinksContainer.addEventListener('click', e => {
    const logoutLink = e.target.closest('a[data-auth-link="logout"]');
    if (!logoutLink) return;
    e.preventDefault();
    trackEvent('logout_click');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('sb-rcgwshnxndzaossmbken-auth-token');
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
    link.textContent = t('nav.portfolio');
    portfolioItem.appendChild(link);
    navLinksContainer.insertBefore(portfolioItem, loginListItem);
  }
}

function ensureDashboardMenuItem(navLinksContainer, loginListItem) {
  let dashboardItem = navLinksContainer.querySelector('li[data-auth-item="dashboard"]');
  if (!dashboardItem) {
    dashboardItem = document.createElement('li');
    dashboardItem.setAttribute('data-auth-item', 'dashboard');
    const link = document.createElement('a');
    link.href = 'dashboard.html';
    link.className = 'nav-link';
    link.textContent = t('nav.dashboard');
    dashboardItem.appendChild(link);
    navLinksContainer.insertBefore(dashboardItem, loginListItem);
  }
}

function removePortfolioMenuItem(navLinksContainer) {
  const portfolioItem = navLinksContainer.querySelector('li[data-auth-item="portfolio"]');
  if (portfolioItem) portfolioItem.remove();
}

function removeDashboardMenuItem(navLinksContainer) {
  const dashboardItem = navLinksContainer.querySelector('li[data-auth-item="dashboard"]');
  if (dashboardItem) dashboardItem.remove();
}

function isAuthenticated() {
  try {
    const sbRaw = localStorage.getItem('sb-rcgwshnxndzaossmbken-auth-token');
    if (!sbRaw) return false;
    const sbSession = JSON.parse(sbRaw);
    if (!sbSession || !sbSession.access_token) return false;
    const exp = sbSession.expires_at;
    if (exp && (Date.now() / 1000) >= exp) return false;
    return true;
  } catch (_) {
    return false;
  }
}

function scheduleAutoLogout() {
  try {
    const sbRaw = localStorage.getItem('sb-rcgwshnxndzaossmbken-auth-token');
    if (!sbRaw) return;
    const sbSession = JSON.parse(sbRaw);
    const exp = sbSession && sbSession.expires_at;
    if (!exp) return;

    // Force 20-minute limit from login time, regardless of Supabase token expiry
    const loginAt = sbSession.created_at ? Date.parse(sbSession.created_at) : NaN;
    const twentyMin = 20 * 60 * 1000;
    const logoutAt = Number.isFinite(loginAt)
      ? Math.min(loginAt + twentyMin, exp * 1000)
      : exp * 1000;

    const remaining = logoutAt - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem('sb-rcgwshnxndzaossmbken-auth-token');
      window.location.href = 'login.html';
      return;
    }

    window.setTimeout(() => {
      localStorage.removeItem('sb-rcgwshnxndzaossmbken-auth-token');
      window.location.href = 'login.html';
    }, remaining);
  } catch (_) {
    localStorage.removeItem('sb-rcgwshnxndzaossmbken-auth-token');
  }
}

function getAnalyticsData() {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      return {
        counts: {
          site_entry: 0,
          cv_click: 0,
          form_submit: 0,
          github_click: 0,
          linkedin_click: 0,
          login_success: 0,
          dashboard_visit: 0,
          portfolio_visit: 0
        },
        events: []
      };
    }
    const parsed = JSON.parse(raw);
    if (!parsed.counts || !parsed.events) throw new Error('Invalid analytics data');
    return parsed;
  } catch (_) {
    return {
      counts: {
        site_entry: 0,
        cv_click: 0,
        form_submit: 0,
        github_click: 0,
        linkedin_click: 0,
        login_success: 0,
        dashboard_visit: 0,
        portfolio_visit: 0
      },
      events: []
    };
  }
}

function saveAnalyticsData(data) {
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
}

async function getClientIp() {
  if (clientIpPromise) return clientIpPromise;

  clientIpPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const response = await fetch('https://api64.ipify.org?format=json', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) return 'unknown';
      const payload = await response.json();
      return (payload && typeof payload.ip === 'string' && payload.ip.trim()) ? payload.ip.trim() : 'unknown';
    } catch (_) {
      return 'unknown';
    }
  })();

  return clientIpPromise;
}

function trackEvent(name, details) {
  analyticsWriteQueue = analyticsWriteQueue.then(async () => {
    const data = getAnalyticsData();
    if (!Object.prototype.hasOwnProperty.call(data.counts, name)) {
      data.counts[name] = 0;
    }
    data.counts[name] += 1;
    const ip = await getClientIp();
    data.events.unshift({
      name,
      details: details || '',
      ip,
      at: new Date().toISOString()
    });
    data.events = data.events.slice(0, 40);
    saveAnalyticsData(data);
  }).catch(() => {
    // ignore analytics queue failures
  });

  return analyticsWriteQueue;
}

function initAnalyticsTracking() {
  trackEvent('site_entry');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'dashboard.html' || currentPage === 'dashboard') {
    trackEvent('dashboard_visit');
  }
  if (currentPage === 'portfolio.html' || currentPage === 'portfolio') {
    trackEvent('portfolio_visit');
  }

  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    const href = (anchor.getAttribute('href') || '').toLowerCase();
    if (href.includes('lastcven.pdf')) trackEvent('cv_click');
    if (href.includes('github.com')) trackEvent('github_click');
    if (href.includes('linkedin.com')) trackEvent('linkedin_click');
  });
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
  const roles = i18nValue('home.roles') || ['Software Engineer', 'Systems Engineer', 'Football Referee', 'Photographer'];
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
      grid.innerHTML = `<div class="no-results"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><p>${esc(t('projects.loadError'))}</p></div>`;
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
  let html = `<button class="filter-tag active" data-tag="All">${esc(t('projects.all'))}</button>`;
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
    grid.innerHTML = `<div class="no-results"><i class="fa-solid fa-folder-open" aria-hidden="true"></i><p>${esc(t('projects.noResults'))}</p></div>`;
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
  const unit = count === 1 ? t('projects.foundSingular') : t('projects.foundPlural');
  el.textContent = `${count} ${unit} ${t('projects.foundSuffix')}`;
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

    trackEvent('form_submit');

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
  if (form.dataset.auth === 'supabase-otp') return;

  const alertSuccess = document.getElementById('login-alert-success');
  const alertError   = document.getElementById('login-alert-error');
  const emailInput   = document.getElementById('login-email');
  const passInput    = document.getElementById('login-password');

  function showAlert(el) { if (!el) return; el.classList.add('show'); el.setAttribute('aria-hidden', 'false'); el.focus(); }
  function hideAlert(el) { if (!el) return; el.classList.remove('show'); el.setAttribute('aria-hidden', 'true'); }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert(alertSuccess);
    hideAlert(alertError);
    form.querySelectorAll('.form-group').forEach(function (g) { g.classList.remove('invalid'); });

    var valid = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      if (!input.value.trim() || !input.checkValidity()) {
        input.closest('.form-group').classList.add('invalid');
        valid = false;
      }
    });
    if (!valid) {
      var first = form.querySelector('.form-group.invalid .form-input');
      if (first) first.focus();
      return;
    }

    var email    = emailInput.value.trim().toLowerCase();
    var password = passInput.value;
    var sb = window.__supabase;
    if (!sb) { showAlert(alertError); return; }

    var result = await sb.auth.signInWithPassword({ email: email, password: password });

    if (!result.error) {
      trackEvent('login_success', email);
      showAlert(alertSuccess);
      setTimeout(function () { window.location.href = 'dashboard.html'; }, 900);
      return;
    }

    showAlert(alertError);
    if (emailInput) emailInput.closest('.form-group').classList.add('invalid');
    if (passInput)  passInput.closest('.form-group').classList.add('invalid');
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
    slider.setAttribute('data-current-index', String(current));
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

  slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const event = new CustomEvent('openPortfolioLightbox', { detail: { index: i } });
      document.dispatchEvent(event);
    });
  });

  render();
}

function initPortfolioLightbox() {
  const lightbox = document.getElementById('portfolio-lightbox');
  if (!lightbox) return;

  const image = document.getElementById('portfolio-lightbox-image');
  const caption = document.getElementById('portfolio-lightbox-caption');
  const closeBtn = document.getElementById('portfolio-lightbox-close');
  const prevBtn = document.getElementById('portfolio-lightbox-prev');
  const nextBtn = document.getElementById('portfolio-lightbox-next');
  const zoomInBtn = document.getElementById('portfolio-lightbox-zoom-in');
  const zoomOutBtn = document.getElementById('portfolio-lightbox-zoom-out');
  const fullscreenBtn = document.getElementById('portfolio-lightbox-fullscreen');
  const backdrop = lightbox.querySelector('.portfolio-lightbox-backdrop');
  const images = Array.from(document.querySelectorAll('#portfolio-slider .portfolio-slide img'));
  if (!image || !closeBtn || !prevBtn || !nextBtn || !zoomInBtn || !zoomOutBtn || !fullscreenBtn || !images.length) return;

  let current = 0;
  let zoom = 1;
  let touchStartX = 0;

  const applyZoom = () => {
    image.style.transform = `scale(${zoom})`;
  };

  const render = () => {
    const source = images[current];
    image.src = source.src;
    image.alt = source.alt || 'Portfolio image';
    if (caption) {
      const slideCaption = source.closest('.portfolio-slide').querySelector('.portfolio-caption');
      caption.textContent = slideCaption ? slideCaption.textContent : '';
    }
    zoom = 1;
    applyZoom();
  };

  const open = index => {
    current = index;
    render();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const next = () => {
    current = (current + 1) % images.length;
    render();
  };

  const prev = () => {
    current = (current - 1 + images.length) % images.length;
    render();
  };

  document.addEventListener('openPortfolioLightbox', e => {
    open(Number(e.detail.index) || 0);
  });

  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  if (backdrop) backdrop.addEventListener('click', close);

  zoomInBtn.addEventListener('click', () => {
    zoom = Math.min(zoom + 0.2, 3);
    applyZoom();
  });

  zoomOutBtn.addEventListener('click', () => {
    zoom = Math.max(zoom - 0.2, 1);
    applyZoom();
  });

  fullscreenBtn.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await lightbox.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      // Ignore unsupported fullscreen API failures
    }
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === '+' || e.key === '=') {
      zoom = Math.min(zoom + 0.2, 3);
      applyZoom();
    }
    if (e.key === '-') {
      zoom = Math.max(zoom - 0.2, 1);
      applyZoom();
    }
    if (e.key.toLowerCase() === 'f') {
      fullscreenBtn.click();
    }
  });

  image.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  image.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  }, { passive: true });
}

function initDashboard() {
  const root = document.getElementById('dashboard-page');
  if (!root) return;

  const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '{}');
  const analytics = getAnalyticsData();

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('dashboard-last-login', auth.loggedInAt ? new Date(auth.loggedInAt).toLocaleString() : '-');
  setText('site-entries', String(analytics.counts.site_entry || 0));
  setText('dashboard-visits', String(analytics.counts.dashboard_visit || 0));
  setText('portfolio-visits', String(analytics.counts.portfolio_visit || 0));
  setText('cv-clicks', String(analytics.counts.cv_click || 0));
  setText('form-submits', String(analytics.counts.form_submit || 0));
  setText('github-clicks', String(analytics.counts.github_click || 0));
  setText('linkedin-clicks', String(analytics.counts.linkedin_click || 0));
  setText('login-events', String(analytics.counts.login_success || 0));

  const eventsList = document.getElementById('dashboard-events');
  if (eventsList) {
    const events = analytics.events.slice(0, 8);
    if (!events.length) {
      eventsList.innerHTML = `<li>${esc(t('labels.noEvents'))}</li>`;
    } else {
      eventsList.innerHTML = events.map(evt => (
        `<li><strong>${esc(evt.name)}</strong> - ${esc(new Date(evt.at).toLocaleString())} - ${esc(t('labels.ip'))}: ${esc(evt.ip || 'unknown')}</li>`
      )).join('');
    }
  }
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
