/* ============================================================
   hdmartinez — PÁGINA DE ARTÍCULO (posts/<slug>.html)
   · Sincroniza la cabecera con el idioma (título, entradilla,
     tags, fecha, tiempo de lectura) usando data.js + data-slug.
   · Construye navegación anterior/siguiente.
   · Barra de progreso de lectura + índice (TOC) desde los <h2>.
   La cabecera se genera estática en ES por build.js (bien para
   SEO / sin-JS); este script solo la actualiza al cambiar idioma.
   ============================================================ */
(function () {
  'use strict';

  var H = window.HDM;
  var ARTICLES = window.HDM_DATA.ARTICLES;
  var TAG_COLORS = window.HDM_DATA.TAG_COLORS;

  var root = document.querySelector('.post[data-slug]');
  if (!root || !H) return;

  var slug = root.dataset.slug;
  var idx = ARTICLES.findIndex(function (a) { return a.slug === slug; });
  if (idx === -1) return;
  var article = ARTICLES[idx];

  // Orden cronológico (desc) para anterior/siguiente
  var ordered = ARTICLES.slice().sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  var pos = ordered.indexOf(article);
  var newer = ordered[pos - 1]; // publicado después
  var older = ordered[pos + 1]; // publicado antes

  function tagsHtml() {
    return article.tags.map(function (tag) {
      var color = TAG_COLORS[tag] || '#94A3B8';
      var label = H.tagLabel(tag);
      return '<a class="tag" href="../index.html#t/' + encodeURIComponent(tag) + '" ' +
             'style="--tc:' + color + '">' + H.escapeHtml(label) + '</a>';
    }).join('');
  }

  function renderHeader() {
    document.title = H.articleTitle(article) + ' — hdmartinez';

    var titleEl = root.querySelector('.post-title');
    var leadEl = root.querySelector('.post-lead');
    var tagsEl = root.querySelector('.post-tags');
    var dateEl = root.querySelector('.post-date');
    var readEl = root.querySelector('.post-readtime');

    if (titleEl) titleEl.textContent = H.articleTitle(article);
    if (leadEl) leadEl.textContent = H.articleExtract(article);
    if (tagsEl) tagsEl.innerHTML = tagsHtml();
    if (dateEl) {
      dateEl.setAttribute('datetime', article.fecha);
      dateEl.textContent = H.t('post.published') + ' ' + H.formatDate(article.fecha);
    }
    if (readEl) readEl.textContent = article.minLectura + ' ' + H.t('post.min');
  }

  function renderNav() {
    var nav = root.querySelector('.post-nav');
    if (!nav) return;
    var prevHtml = older
      ? '<a class="post-nav-link post-nav-prev" href="' + older.slug + '.html">' +
          '<span class="post-nav-dir">' + H.t('post.prev') + '</span>' +
          '<span class="post-nav-title">' + H.escapeHtml(H.articleTitle(older)) + '</span></a>'
      : '<span></span>';
    var nextHtml = newer
      ? '<a class="post-nav-link post-nav-next" href="' + newer.slug + '.html">' +
          '<span class="post-nav-dir">' + H.t('post.next') + '</span>' +
          '<span class="post-nav-title">' + H.escapeHtml(H.articleTitle(newer)) + '</span></a>'
      : '<span></span>';
    nav.innerHTML = prevHtml + nextHtml;
  }

  /* ---------------- índice (TOC) a partir de los h2 ---------------- */
  function slugify(str) {
    return String(str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }
  function buildToc() {
    var toc = document.getElementById('post-toc');
    var body = root.querySelector('.post-body');
    if (!toc || !body) return;
    var heads = body.querySelectorAll('h2');
    if (heads.length < 2) { toc.remove(); return; }
    var used = {};
    var items = [];
    heads.forEach(function (h) {
      var id = h.id || slugify(h.textContent);
      while (used[id]) id = id + '-x';
      used[id] = true;
      h.id = id;
      items.push('<li><a href="#' + id + '">' + H.escapeHtml(h.textContent) + '</a></li>');
    });
    toc.innerHTML = '<p class="post-toc-head" data-i18n="post.toc">' + H.t('post.toc') + '</p><ul>' + items.join('') + '</ul>';
  }

  /* ---------------- barra de progreso de lectura ---------------- */
  function initProgress() {
    var bar = document.getElementById('reading-progress');
    if (!bar || H.prefersReducedMotion) return;
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function renderAll() { renderHeader(); renderNav(); }

  H.onLangChange(renderAll);
  renderAll();
  buildToc();
  initProgress();
})();
