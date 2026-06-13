/* ============================================================
   hdmartinez — CHROME compartido (nav + idioma + tema)
   Se carga en TODAS las páginas (index y posts).
   Expone window.HDM con estado + utilidades, y emite eventos:
     · document → 'hdm:langchange'  (detail: { lang })
     · document → 'hdm:themechange' (detail: { theme })
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.HDM_DATA;
  if (!DATA) { console.error('[hdm] data.js no se cargó antes que chrome.js'); return; }

  var I18N = DATA.I18N;
  var TAG_LABELS_EN = DATA.TAG_LABELS_EN;

  /* ---------------- ESTADO ---------------- */
  var lang = 'es';
  var LANG_KEY = 'hdm-lang';
  var THEME_KEY = 'hdm-theme';

  /* ---------------- ALMACENAMIENTO SEGURO ----------------
     localStorage puede estar bloqueado (sandbox/preview):
     fallback en memoria para degradar sin errores. */
  var memStore = {};
  function storageGet(key) {
    try { return window.localStorage.getItem(key); }
    catch (e) { return Object.prototype.hasOwnProperty.call(memStore, key) ? memStore[key] : null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch (e) { memStore[key] = value; }
  }

  /* ---------------- I18N + UTILIDADES ---------------- */
  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.es[key] || key;
  }
  function fmt(str, vars) {
    return str.replace(/\{(\w+)\}/g, function (m, k) {
      return (vars && vars[k] !== undefined) ? vars[k] : m;
    });
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function formatDate(iso) {
    var d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX',
      { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function tagLabel(tag) {
    return lang === 'en' ? (TAG_LABELS_EN[tag] || tag) : tag;
  }
  function articleTitle(a) { return (lang === 'en' && a.en && a.en.titulo) ? a.en.titulo : a.titulo; }
  function articleExtract(a) { return (lang === 'en' && a.en && a.en.extracto) ? a.en.extracto : a.extracto; }
  function debounce(fn, ms) {
    var timer = null;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- IDIOMA ---------------- */
  function applyLanguage() {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    // Búsqueda (solo existe en index)
    var search = document.getElementById('search-input');
    if (search) {
      search.placeholder = t('posts.search.placeholder');
      search.setAttribute('aria-label', t('posts.search.aria'));
    }

    // Toggle de idioma
    var toggle = document.getElementById('lang-toggle');
    if (toggle) {
      toggle.setAttribute('aria-label', t('lang.switch'));
      toggle.querySelectorAll('[data-lang-opt]').forEach(function (opt) {
        opt.classList.toggle('active', opt.dataset.langOpt === lang);
      });
    }

    refreshThemeAria();
    document.dispatchEvent(new CustomEvent('hdm:langchange', { detail: { lang: lang } }));
  }

  function toggleLanguage() {
    lang = lang === 'es' ? 'en' : 'es';
    storageSet(LANG_KEY, lang);
    applyLanguage();
  }

  function initLanguage() {
    var stored = storageGet(LANG_KEY);
    if (stored === 'es' || stored === 'en') {
      lang = stored;
    } else {
      lang = /^es/i.test(navigator.language || 'es') ? 'es' : 'en';
    }
    var toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.addEventListener('click', toggleLanguage);
    applyLanguage();
  }

  /* ---------------- TEMA ---------------- */
  var themeToggle = null;

  function getPreferredTheme() {
    var stored = storageGet(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function refreshThemeAria() {
    if (!themeToggle) return;
    var theme = document.documentElement.dataset.theme;
    themeToggle.setAttribute('aria-label', theme === 'dark' ? t('theme.toLight') : t('theme.toDark'));
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    refreshThemeAria();
    document.dispatchEvent(new CustomEvent('hdm:themechange', { detail: { theme: theme } }));
  }
  function toggleTheme() {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storageSet(THEME_KEY, next);
  }
  function initTheme() {
    themeToggle = document.getElementById('theme-toggle');
    applyTheme(getPreferredTheme());
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  }

  /* ---------------- API PÚBLICA ---------------- */
  window.HDM = {
    data: DATA,
    get lang() { return lang; },
    get theme() { return document.documentElement.dataset.theme; },
    t: t, fmt: fmt,
    escapeHtml: escapeHtml, formatDate: formatDate,
    tagLabel: tagLabel, articleTitle: articleTitle, articleExtract: articleExtract,
    debounce: debounce,
    prefersReducedMotion: prefersReducedMotion,
    onLangChange: function (cb) { document.addEventListener('hdm:langchange', function (e) { cb(e.detail.lang); }); },
    onThemeChange: function (cb) { document.addEventListener('hdm:themechange', function (e) { cb(e.detail.theme); }); }
  };

  /* ---------------- ARRANQUE ---------------- */
  function boot() {
    initTheme();      // tema primero (evita flash)
    initLanguage();   // dispara el primer hdm:langchange → los módulos renderizan
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
