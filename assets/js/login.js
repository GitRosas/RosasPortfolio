  const AUTH_WORKER_URL = 'https://auth.joaomiguelrosa.com/';
  const AUTH_STORAGE_KEY = 'portfolioAuth';
  const AUTH_SESSION_MS = 20 * 60 * 1000;
  const I18N_CACHE_KEY = 'portfolioI18nCache';

  // Bug 1 fix: apply cache synchronously before awaiting the network fetch
  // Bug 2 fix: cache: 'default' lets the browser reuse cached responses
  let i18nData = {};
  try {
    const raw = localStorage.getItem(I18N_CACHE_KEY);
    i18nData = raw ? JSON.parse(raw) : {};
  } catch {
    i18nData = {};
  }
  // Non-blocking: fire fetch but don't block script execution; form is already
  // usable because i18nData is populated from localStorage above.
  fetch('assets/data/i18n.json', { cache: 'default' })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data) {
        i18nData = data;
        try { localStorage.setItem(I18N_CACHE_KEY, JSON.stringify(data)); } catch {}
        // Re-apply translations now that fresh data is available
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.dataset.i18n;
          const val = tr(key);
          if (val && val !== key) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
          const key = el.dataset.i18nPlaceholder;
          const val = tr(key);
          if (val && val !== key) el.placeholder = val;
        });
      }
    })
    .catch(() => {});
  const getLanguage = () => (localStorage.getItem('portfolioLang') === 'pt' ? 'pt' : 'en');
  
  // Hard-coded fallbacks for critical UI strings
  const FALLBACK_STRINGS = {
    en: {
      'login.loading': 'Loading...',
      'login.wrongEmailOrPassword': 'Wrong email or password.',
      'login.tooManyWait60': 'Too many requests. Wait 60s and try again.',
      'login.tooManyWait': 'Too many requests. Wait {seconds}s and try again.',
      'login.cooldownPopup': 'You can resend in {seconds}s.',
      'login.codeAlreadySent': 'Code already sent. Check your email or click Resend.',
      'login.verificationCodeSent': 'Verification code sent to your email.',
      'login.wrongVerificationCode': 'Wrong verification code.',
      'login.networkRetry': 'Network error. Try again in a few seconds.',
      'login.otpVerifiedRedirecting': 'Code verified. Redirecting...',
      'login.verificationCodeResent': 'Verification code resent to your email.',
      'login.captchaTimeout': 'CAPTCHA timeout. Please try again.',
      'login.requestFailed': 'Request failed.',
      'login.captchaRetry': 'Please complete the CAPTCHA and try again.',
      'login.otpInvalidOrExpired': 'Invalid or expired code. Try again or resend.',
      'labels.loginInvalid': 'Invalid credentials.'
    },
    pt: {
      'login.loading': 'A carregar...',
      'login.wrongEmailOrPassword': 'Email ou password incorretos.',
      'login.tooManyWait60': 'Muitas tentativas. Aguarda 60s e tenta novamente.',
      'login.tooManyWait': 'Muitas tentativas. Aguarda {seconds}s e tenta novamente.',
      'login.cooldownPopup': 'Podes reenviar em {seconds}s.',
      'login.codeAlreadySent': 'Codigo ja enviado. Verifica o email ou clica em Reenviar.',
      'login.verificationCodeSent': 'Codigo de verificacao enviado para o teu email.',
      'login.wrongVerificationCode': 'Codigo de verificacao incorreto.',
      'login.networkRetry': 'Erro de rede. Tenta novamente dentro de alguns segundos.',
      'login.otpVerifiedRedirecting': 'Codigo verificado. A redirecionar...',
      'login.verificationCodeResent': 'Codigo de verificacao reenviado para o teu email.',
      'login.captchaTimeout': 'Tempo limite do CAPTCHA. Tenta novamente.',
      'login.requestFailed': 'Falha no pedido.',
      'login.captchaRetry': 'Conclui o CAPTCHA e tenta novamente.',
      'login.otpInvalidOrExpired': 'Codigo invalido ou expirado. Tenta novamente ou reenvia.',
      'labels.loginInvalid': 'Credenciais invalidas.'
    }
  };
  
  const tr = (path, fallback = path) => {
    const lang = getLanguage();
    const parts = path.split('.');
    let ref = i18nData?.[lang];
    for (const part of parts) {
      if (!ref || typeof ref !== 'object') {
        // Try hard-coded fallback before returning the key itself
        return FALLBACK_STRINGS[lang]?.[path] || fallback;
      }
      ref = ref[part];
    }
    return typeof ref === 'string' ? ref : (FALLBACK_STRINGS[lang]?.[path] || fallback);
  };
  const trFmt = (path, vars, fallback = path) => {
    let text = tr(path, fallback);
    Object.entries(vars || {}).forEach(([k, v]) => {
      text = text.replaceAll(`{${k}}`, String(v));
    });
    return text;
  };

  // Elementos do Passo 1 (password)
  const form      = document.querySelector('#login-form');
  const loginStep = document.querySelector('#login-step');
  const emailEl   = document.querySelector('#login-email');
  const passEl    = document.querySelector('#login-password');
  const submitBtn = form?.querySelector('button[type="submit"]');
  const okMsg     = document.querySelector('#login-alert-success');
  const errMsg    = document.querySelector('#login-alert-error');
  const errText   = errMsg?.querySelector('span');

  // Elementos do Passo 2 (OTP)
  const otpStep   = document.querySelector('#otp-step');
  const otpInput  = document.querySelector('#otp-code');
  const btnVerify = document.querySelector('#otp-verify');
  const btnResend = document.querySelector('#otp-resend');
  const btnCancel = document.querySelector('#otp-cancel');
  const otpErr    = document.querySelector('#otp-alert-error');
  const otpErrText= otpErr?.querySelector('span');
  const otpOk     = document.querySelector('#otp-alert-success');
  const otpOkText = otpOk?.querySelector('span');
  const captchaContainer = document.querySelector('#cf-turnstile-login');
  const captchaGroup = captchaContainer?.closest('.form-group');
  const captchaOriginalParent = captchaGroup?.parentElement || null;
  const captchaOriginalNextSibling = captchaGroup?.nextElementSibling || null;

  // Estado
  let loginEmail = '';
  let nextOtpRequestAt = 0;
  let isSubmitting = false;
  let isVerifying = false;
  let otpPending = false;
  let captchaToken = '';
  let captchaWidgetId = null;
  const TURNSTILE_SITE_KEY = '0x4AAAAAACtzeB8NcAeAY6qg';
  const defaultErrText = tr('labels.loginInvalid', errText ? errText.textContent : 'labels.loginInvalid');
  const defaultOtpErrText = tr('login.otpInvalidOrExpired', otpErrText ? otpErrText.textContent : 'login.otpInvalidOrExpired');

  function getValidStoredSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      const token = typeof parsed.token === 'string' ? parsed.token.trim() : '';
      const loggedInAt = Number(parsed.loggedInAt);
      if (!token || !Number.isFinite(loggedInAt)) return null;
      if (Date.now() >= loggedInAt + AUTH_SESSION_MS) return null;
      return { token, loggedInAt };
    } catch {
      return null;
    }
  }

  if (captchaGroup) captchaGroup.style.display = 'none';

  // Se já existir token persistido, vai logo para a dashboard.
  try {
    const existingSession = getValidStoredSession();
    if (existingSession) window.location.href = 'dashboard.html';
  } catch {
    // ignora erros de storage
  }

  // Helpers UI
  function show(el){ el?.classList.add('show'); el?.setAttribute('aria-hidden','false'); el?.focus(); }
  function hide(el){ el?.classList.remove('show'); el?.setAttribute('aria-hidden','true'); }
  function showCooldownPopup(waitSec) {
    const existing = document.getElementById('resend-cooldown-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'resend-cooldown-popup';
    popup.setAttribute('role', 'status');
    popup.setAttribute('aria-live', 'polite');
    popup.className = 'cooldown-popup';
    
    // Fallback if i18nData not loaded yet
    let message = trFmt('login.cooldownPopup', { seconds: waitSec }, null);
    if (!message) {
      const defaultMsgs = { 
        en: `You can resend in ${waitSec}s.`,
        pt: `Podes reenviar em ${waitSec}s.`
      };
      const lang = getLanguage();
      message = defaultMsgs[lang] || defaultMsgs.en;
    }
    
    popup.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#clock"></use></svg> ${message}`;

    document.body.appendChild(popup);
    window.requestAnimationFrame(() => {
      popup.classList.add('is-visible');
    });

    window.setTimeout(() => {
      popup.classList.remove('is-visible');
      window.setTimeout(() => popup.remove(), 220);
    }, 2200);
  }
  function setButtonLoading(button, label) {
    if (!button) return;
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<svg class="icon icon-spin" aria-hidden="true"><use href="assets/img/icons.svg#spinner"></use></svg> ${label}`;
  }
  function resetButton(button) {
    if (!button) return;
    button.disabled = false;
    if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
  }
  function showLoginError(message) {
    if (errText) errText.textContent = message || defaultErrText;
    hide(okMsg);
    show(errMsg);
  }
  function resetLoginError() {
    if (errText) errText.textContent = defaultErrText;
    hide(errMsg);
  }
  function showOtpError(message) {
    if (otpErrText) otpErrText.textContent = message || defaultOtpErrText;
    hide(otpOk);
    show(otpErr);
  }
  function resetOtpError() {
    if (otpErrText) otpErrText.textContent = defaultOtpErrText;
    hide(otpErr);
  }
  function revealOTPUI(){
    if (loginStep) loginStep.setAttribute('hidden', '');
    otpStep.removeAttribute('hidden');
    otpInput.value = '';
    resetOtpError(); hide(otpOk);
    otpInput.focus();
  }
  function hideOTPUI(){
    otpStep.setAttribute('hidden', '');
    if (loginStep) loginStep.removeAttribute('hidden');
  }
  function renderCaptcha() {
    if (!window.turnstile) {
      window.setTimeout(renderCaptcha, 150);
      return;
    }
    if (captchaWidgetId !== null) return;
    captchaWidgetId = window.turnstile.render('#cf-turnstile-login', {
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
        if (Date.now() - start >= timeoutMs) return reject(new Error(tr('login.captchaTimeout')));
        window.setTimeout(poll, 100);
      })();
    });
  }
  async function getFreshCaptchaToken(timeoutMs = 10000) {
    resetCaptcha();
    return await waitForCaptchaToken(timeoutMs);
  }

  async function requestCaptcha(timeoutMs = 120000) {
    if (!captchaContainer || !captchaGroup) {
      throw new Error('captcha container missing');
    }

    const isOtpVisible = otpStep && !otpStep.hasAttribute('hidden');
    if (isOtpVisible) {
      const otpActions = otpStep.querySelector('.btn-row');
      if (otpActions) {
        otpStep.insertBefore(captchaGroup, otpActions);
      } else {
        otpStep.appendChild(captchaGroup);
      }
    } else if (captchaOriginalParent) {
      if (captchaOriginalNextSibling && captchaOriginalNextSibling.parentElement === captchaOriginalParent) {
        captchaOriginalParent.insertBefore(captchaGroup, captchaOriginalNextSibling);
      } else {
        captchaOriginalParent.appendChild(captchaGroup);
      }
    }

    captchaGroup.style.display = '';
    renderCaptcha();

    try {
      return await getFreshCaptchaToken(timeoutMs);
    } finally {
      captchaGroup.style.display = 'none';
      if (captchaOriginalParent) {
        if (captchaOriginalNextSibling && captchaOriginalNextSibling.parentElement === captchaOriginalParent) {
          captchaOriginalParent.insertBefore(captchaGroup, captchaOriginalNextSibling);
        } else {
          captchaOriginalParent.appendChild(captchaGroup);
        }
      }
    }
  }

  async function callAuthWorker(type, payload) {
    const response = await fetch(AUTH_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload })
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error ?? data?.message ?? tr('login.requestFailed'));
      error.status = data?.status || response.status;
      error.code = data?.code || '';
      error.payload = data;
      throw error;
    }

    return data;
  }

  function saveWorkerAuthPayload(payload) {
    const source = payload?.session ?? payload?.data ?? payload;
    const token = typeof source?.access_token === 'string'
      ? source.access_token.trim()
      : (typeof source?.token === 'string' ? source.token.trim() : '');
    const createdAtMs = source?.created_at ? Date.parse(source.created_at) : NaN;
    const loggedInAt = Number.isFinite(createdAtMs) ? createdAtMs : Date.now();
    const storageValue = { token, loggedInAt };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storageValue));
  }

  function isTooManyRequestsError(error) {
    const message = String(error?.message || '').toLowerCase();
    return error?.status === 429 || error?.code === 'too_many_requests' || message.includes('too many');
  }

  // PASSO 1: validar password -> enviar OTP
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    hide(okMsg);
    resetLoginError();

    if (isSubmitting) return;
    if (otpPending) { showLoginError(tr('login.codeAlreadySent')); return; }

    const email = emailEl.value.trim();
    const password = passEl.value;
    loginEmail = email;

    if (!email || password.length < 4) { showLoginError(defaultErrText); return; }
    if (Date.now() < nextOtpRequestAt) {
      const waitSec = Math.ceil((nextOtpRequestAt - Date.now()) / 1000);
      showLoginError(trFmt('login.tooManyWait', { seconds: waitSec }, tr('login.tooManyWait')));
      return;
    }

    try {
      isSubmitting = true;
      setButtonLoading(submitBtn, tr('login.loading'));

      const tokenA = await requestCaptcha();
      await callAuthWorker('login_password', {
        email,
        password,
        captchaToken: tokenA
      });

      const tokenB = await requestCaptcha();
      await callAuthWorker('otp_request', {
        email,
        captchaToken: tokenB
      });

      nextOtpRequestAt = Date.now() + 60_000;
      otpPending = true;

      const okText = okMsg?.querySelector('span');
      if (okText) okText.textContent = tr('login.verificationCodeSent');
      resetButton(submitBtn);
      show(okMsg);
      revealOTPUI();
    } catch (err) {
      if (isTooManyRequestsError(err)) {
        nextOtpRequestAt = Date.now() + 60_000;
        showLoginError(tr('login.tooManyWait60'));
      } else {
        const msg = String(err?.message ?? err?.payload?.error ?? '').toLowerCase();
        if (msg.includes('wrong') || msg.includes('invalid') || msg.includes('password') || msg.includes('credentials')) {
          showLoginError(tr('login.wrongEmailOrPassword'));
        } else {
          showLoginError(tr('login.networkRetry'));
        }
      }
    } finally {
      isSubmitting = false;
      resetButton(submitBtn);
      resetCaptcha();
    }
  });

  // PASSO 2: verificar código (cria sessão se estiver certo)
  btnVerify.addEventListener('click', async () => {
    resetOtpError(); hide(otpOk);
    const code = otpInput.value.trim();
    let verifySucceeded = false;

    if (isVerifying) return;
    if (!/^\d{8}$/.test(code) || !loginEmail) { showOtpError(tr('login.wrongVerificationCode')); return; }

    try {
      isVerifying = true;
      setButtonLoading(btnVerify, tr('login.loading'));

      const captcha3 = await requestCaptcha();
      const result = await callAuthWorker('otp_verify', {
        email: loginEmail,
        otp: code,
        captchaToken: captcha3
      });

      saveWorkerAuthPayload(result);

      verifySucceeded = true;
      if (otpOkText) otpOkText.textContent = tr('login.otpVerifiedRedirecting');
      show(otpOk);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (err) {
      if (isTooManyRequestsError(err)) {
        nextOtpRequestAt = Date.now() + 60_000;
        showOtpError(tr('login.tooManyWait60'));
      } else {
        const msg = String(err?.message || '').toLowerCase();
        if (msg.includes('code') || msg.includes('otp') || msg.includes('expired') || msg.includes('invalid') || msg.includes('wrong')) {
          showOtpError(tr('login.wrongVerificationCode'));
        } else {
          showOtpError(tr('login.networkRetry'));
        }
      }
    } finally {
      isVerifying = false;
      resetCaptcha();
      if (!verifySucceeded) resetButton(btnVerify);
    }
  });

  btnResend.addEventListener('click', async () => {
    resetOtpError(); hide(otpOk);

    if (!loginEmail) { showOtpError(defaultOtpErrText); return; }
    if (Date.now() < nextOtpRequestAt) {
      const waitSec = Math.ceil((nextOtpRequestAt - Date.now()) / 1000);
      showCooldownPopup(waitSec);
      showLoginError(trFmt('login.tooManyWait', { seconds: waitSec }, tr('login.tooManyWait')));
      return;
    }

    try {
      setButtonLoading(btnResend, tr('login.loading'));

      const tokenD = await requestCaptcha();
      await callAuthWorker('otp_request', {
        email: loginEmail,
        captchaToken: tokenD
      });

      nextOtpRequestAt = Date.now() + 60_000;
      const okText = okMsg?.querySelector('span');
      if (okText) okText.textContent = tr('login.verificationCodeResent');
      show(okMsg);
      revealOTPUI();
    } catch (err) {
      if (isTooManyRequestsError(err)) {
        nextOtpRequestAt = Date.now() + 60_000;
        showLoginError(tr('login.tooManyWait60'));
      } else {
        showLoginError(tr('login.captchaRetry'));
      }
    } finally {
      resetButton(btnResend);
      resetCaptcha();
    }
  });

  // Cancelar passo OTP (não reenvia código)
  btnCancel.addEventListener('click', () => {
    otpPending = false;
    resetButton(submitBtn);
    resetButton(btnVerify);
    resetButton(btnResend);
    hideOTPUI();
  });
