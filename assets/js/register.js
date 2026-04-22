const AUTH_WORKER_URL = 'https://auth.joaomiguelrosa.com/';
const I18N_CACHE_KEY = 'portfolioI18nCache';

let i18nData = {};
try {
  const raw = localStorage.getItem(I18N_CACHE_KEY);
  i18nData = raw ? JSON.parse(raw) : {};
} catch { i18nData = {}; }

try {
  const response = await fetch('assets/data/i18n.json', { cache: 'no-store' });
  if (response.ok) {
    i18nData = await response.json();
    try { localStorage.setItem(I18N_CACHE_KEY, JSON.stringify(i18nData)); } catch {}
  }
} catch {}

const getLanguage = () => (localStorage.getItem('portfolioLang') === 'pt' ? 'pt' : 'en');
const tr = (path, fallback = path) => {
  const lang = getLanguage();
  const parts = path.split('.');
  let ref = i18nData?.[lang];
  for (const part of parts) {
    if (!ref || typeof ref !== 'object') return fallback;
    ref = ref[part];
  }
  return typeof ref === 'string' ? ref : fallback;
};

const form = document.querySelector('#register-form');
const emailEl = document.querySelector('#reg-email');
const passEl = document.querySelector('#reg-pass');
const submitBtn = document.querySelector('#register-submit');
const okEl = document.querySelector('#reg-ok');
const errEl = document.querySelector('#reg-err');
const errText = errEl?.querySelector('span');
const captchaContainer = document.querySelector('#cf-turnstile-register');
const captchaGroup = captchaContainer?.closest('.form-group');
const captchaOriginalParent = captchaGroup?.parentElement || null;
const captchaOriginalNextSibling = captchaGroup?.nextElementSibling || null;

let captchaToken = '';
let captchaWidgetId = null;
const TURNSTILE_SITE_KEY = '0x4AAAAAACtzeB8NcAeAY6qg';
let isSubmitting = false;

if (captchaGroup) captchaGroup.style.display = 'none';

function show(el) { el?.classList.add('show'); el?.setAttribute('aria-hidden', 'false'); el?.focus(); }
function hide(el) { el?.classList.remove('show'); el?.setAttribute('aria-hidden', 'true'); }

function setLoading(button) {
  if (!button) return;
  if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<svg class="icon icon-spin" aria-hidden="true"><use href="assets/img/icons.svg#spinner"></use></svg> ${tr('register.creating')}`;
}
function resetLoading(button) {
  if (!button) return;
  button.disabled = false;
  if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
}

function renderCaptcha() {
  if (!window.turnstile) { window.setTimeout(renderCaptcha, 150); return; }
  if (captchaWidgetId !== null) return;
  captchaWidgetId = window.turnstile.render('#cf-turnstile-register', {
    sitekey: TURNSTILE_SITE_KEY,
    callback: (token) => { captchaToken = token; },
    'expired-callback': () => { captchaToken = ''; },
    'error-callback': () => { captchaToken = ''; }
  });
}
function resetCaptcha() {
  if (window.turnstile && captchaWidgetId !== null) window.turnstile.reset(captchaWidgetId);
  captchaToken = '';
}
async function waitForCaptchaToken(timeoutMs = 10000) {
  const start = Date.now();
  return await new Promise((resolve, reject) => {
    (function poll() {
      if (captchaToken) return resolve(captchaToken);
      if (Date.now() - start >= timeoutMs) return reject(new Error(tr('register.captchaTimeout')));
      window.setTimeout(poll, 100);
    })();
  });
}
async function getFreshCaptchaToken(timeoutMs = 10000) { resetCaptcha(); return await waitForCaptchaToken(timeoutMs); }

async function requestCaptcha(timeoutMs = 120000) {
  if (!captchaContainer || !captchaGroup) throw new Error('captcha container missing');
  captchaGroup.style.display = 'block';
  renderCaptcha();
  try { return await getFreshCaptchaToken(timeoutMs); }
  finally {
    captchaGroup.style.display = 'none';
    if (captchaOriginalParent) {
      if (captchaOriginalNextSibling && captchaOriginalNextSibling.parentElement === captchaOriginalParent) {
        captchaOriginalParent.insertBefore(captchaGroup, captchaOriginalNextSibling);
      } else captchaOriginalParent.appendChild(captchaGroup);
    }
  }
}

async function callAuthWorker(type, payload) {
  const response = await fetch(AUTH_WORKER_URL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...payload })
  });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok || data?.ok === false) {
    const error = new Error(data?.message || data?.error || tr('register.requestFailed'));
    error.status = data?.status || response.status;
    throw error;
  }
  return data;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hide(okEl);
  hide(errEl);
  form.querySelectorAll('.form-group').forEach((group) => group.classList.remove('invalid'));
  if (isSubmitting) return;

  const email = emailEl.value.trim();
  const password = passEl.value;
  let valid = true;
  [emailEl, passEl].forEach((input) => {
    if (!input.value.trim() || !input.checkValidity()) {
      input.closest('.form-group')?.classList.add('invalid');
      valid = false;
    }
  });
  if (password.length < 8) {
    passEl.closest('.form-group')?.classList.add('invalid');
    valid = false;
  }
  if (!valid) {
    form.querySelector('.form-group.invalid .form-input')?.focus();
    return;
  }

  try {
    isSubmitting = true;
    setLoading(submitBtn);
    const captchaTokenValue = await requestCaptcha();
    await callAuthWorker('signup', { email, password, captchaToken: captchaTokenValue });
    show(okEl);
    form.reset();
  } catch (err) {
    const message = String(err?.message || tr('register.error'));
    if (errText) errText.textContent = message;
    show(errEl);
  } finally {
    isSubmitting = false;
    resetLoading(submitBtn);
    resetCaptcha();
  }
});
