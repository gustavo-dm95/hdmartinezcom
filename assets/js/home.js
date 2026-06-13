/* ============================================================
   hdmartinez — HOME / ARCHIVO (solo index.html)
   Render de cards y listado, búsqueda, filtros por tag y router
   de hash (#home #posts #about #contact).
   Las tarjetas enlazan a posts/<slug>.html (páginas reales).
   ============================================================ */
(function () {
  'use strict';

  var H = window.HDM;
  var ARTICLES = window.HDM_DATA.ARTICLES;
  var TAG_COLORS = window.HDM_DATA.TAG_COLORS;

  function postUrl(article) { return 'posts/' + article.slug + '.html'; }

  function sortByDateDesc(list) {
    return list.slice().sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  }

  /* ---------------- tags ---------------- */
  function renderTagButtons(tags) {
    return tags.map(function (tag) {
      var color = TAG_COLORS[tag] || '#94A3B8';
      var label = H.tagLabel(tag);
      return '<button class="tag" type="button" data-tag="' + H.escapeHtml(tag) + '" style="--tc:' + color + '" ' +
             'aria-label="' + H.escapeHtml(H.fmt(H.t('tag.aria'), { tag: label })) + '">' + H.escapeHtml(label) + '</button>';
    }).join('');
  }

  /* ---------------- cards (home) ---------------- */
  function renderCard(article, featured) {
    var title = H.articleTitle(article);
    var url = postUrl(article);
    return '<article class="card' + (featured ? ' card--featured' : '') + '" data-href="' + url + '">' +
      '<a class="card-media" href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + article.imagen + '" alt="" ' +
        'width="800" height="400" loading="lazy" decoding="async"></a>' +
      '<div class="card-body">' +
        '<div class="tag-row">' + renderTagButtons(article.tags) + '</div>' +
        '<h3 class="card-title"><a href="' + url + '">' + H.escapeHtml(title) + '</a></h3>' +
        '<div class="card-meta"><time datetime="' + article.fecha + '">' + H.formatDate(article.fecha) + '</time>' +
        '<span class="dot">●</span><span>' + article.minLectura + ' ' + H.t('card.minRead') + '</span></div>' +
      '</div></article>';
  }

  function renderHome() {
    var grid = document.getElementById('recent-grid');
    if (!grid) return;
    var recent = sortByDateDesc(ARTICLES).slice(0, 5);
    grid.innerHTML = recent.map(function (a, i) { return renderCard(a, i === 0); }).join('');
  }

  /* ---------------- búsqueda + filtros (#posts) ---------------- */
  var filters = { q: '', tag: null };

  function articleMatches(article) {
    if (filters.tag && article.tags.indexOf(filters.tag) === -1) return false;
    if (filters.q) {
      var q = filters.q.toLowerCase();
      var inTitle = article.titulo.toLowerCase().indexOf(q) !== -1 ||
        (article.en && article.en.titulo && article.en.titulo.toLowerCase().indexOf(q) !== -1);
      var inTags = article.tags.some(function (tg) {
        return tg.toLowerCase().indexOf(q) !== -1 || H.tagLabel(tg).toLowerCase().indexOf(q) !== -1;
      });
      if (!inTitle && !inTags) return false;
    }
    return true;
  }

  function renderFilterRow() {
    var row = document.getElementById('filter-row');
    if (!row) return;
    if (filters.tag) {
      var label = H.tagLabel(filters.tag);
      row.innerHTML = '<span>' + H.t('posts.filteringBy') + '</span>' +
        '<span class="filter-pill">' + H.escapeHtml(label) +
        '<button id="clear-tag" type="button" aria-label="' + H.escapeHtml(H.fmt(H.t('posts.clearTag'), { tag: label })) + '">✕</button></span>';
    } else {
      row.innerHTML = '<span>' + H.t('posts.tip') + '</span>';
    }
  }

  function renderPostItem(article, index) {
    var delay = H.prefersReducedMotion ? 0 : Math.min(index * 45, 600);
    var title = H.articleTitle(article);
    var url = postUrl(article);
    return '<article class="post-item" data-href="' + url + '" style="animation-delay:' + delay + 'ms">' +
      '<a class="post-thumb-link" href="' + url + '" tabindex="-1" aria-hidden="true">' +
        '<img class="post-thumb" src="' + article.imagen.replace('/800/400', '/400/280') + '" ' +
        'alt="" width="400" height="280" loading="lazy" decoding="async"></a>' +
      '<div class="post-content">' +
        '<h3 class="post-title"><a href="' + url + '">' + H.escapeHtml(title) + '</a></h3>' +
        '<p class="post-extract">' + H.escapeHtml(H.articleExtract(article)) + '</p>' +
        '<div class="post-meta">' + renderTagButtons(article.tags) +
          '<time datetime="' + article.fecha + '">' + H.formatDate(article.fecha) + '</time>' +
          '<span>· ' + article.minLectura + ' min</span>' +
        '</div>' +
      '</div></article>';
  }

  function renderPosts() {
    var list = document.getElementById('posts-list');
    var countEl = document.getElementById('posts-count');
    if (!list) return;
    var filtered = sortByDateDesc(ARTICLES.filter(articleMatches));

    if (countEl) {
      countEl.textContent = filtered.length === ARTICLES.length
        ? H.fmt(H.t('posts.countAll'), { n: ARTICLES.length })
        : H.fmt(H.t('posts.countFiltered'), { n: filtered.length, total: ARTICLES.length });
    }

    renderFilterRow();

    if (filtered.length === 0) {
      var forTxt = filters.q ? H.fmt(H.t('posts.emptyFor'), { q: H.escapeHtml(filters.q) }) : '';
      list.innerHTML = '<div class="empty-state">' +
        '<p>' + H.t('posts.empty1') + forTxt + '.</p>' +
        '<p>' + H.t('posts.empty2') + '</p>' +
        '<button class="btn btn-ghost" type="button" id="reset-filters">' + H.t('posts.reset') + '</button></div>';
      return;
    }

    var byYear = {};
    filtered.forEach(function (a) {
      var year = a.fecha.slice(0, 4);
      (byYear[year] = byYear[year] || []).push(a);
    });
    var years = Object.keys(byYear).sort().reverse();

    var html = '';
    var globalIndex = 0;
    years.forEach(function (year) {
      var items = byYear[year];
      html += '<section class="year-group" aria-label="' + H.fmt(H.t('posts.yearAria'), { year: year }) + '">' +
        '<div class="year-sep"><span class="year-num" aria-hidden="true">' + year + '</span>' +
        '<span class="year-count">' + items.length + ' ' + (items.length === 1 ? H.t('posts.one') : H.t('posts.many')) + '</span>' +
        '<span class="year-line"></span></div>' +
        items.map(function (a) { return renderPostItem(a, globalIndex++); }).join('') +
        '</section>';
    });
    list.innerHTML = html;
  }

  function clearFilters() {
    filters.q = '';
    filters.tag = null;
    var input = document.getElementById('search-input');
    if (input) input.value = '';
    renderPosts();
  }

  function initSearchAndFilters() {
    var input = document.getElementById('search-input');
    if (input) {
      var onSearch = H.debounce(function () {
        filters.q = input.value.trim();
        renderPosts();
      }, 200);
      input.addEventListener('input', onSearch);
    }

    // Delegación global
    document.addEventListener('click', function (e) {
      // 1) tag → filtrar (prioridad sobre la navegación de la card)
      var tagBtn = e.target.closest('.tag');
      if (tagBtn) {
        e.preventDefault();
        filters.tag = tagBtn.dataset.tag;
        if (currentRoute() !== 'posts') window.location.hash = '#posts';
        else renderPosts();
        return;
      }
      if (e.target.closest('#clear-tag')) { filters.tag = null; renderPosts(); return; }
      if (e.target.closest('#reset-filters')) { clearFilters(); return; }

      // 2) card / post-item → navegar al post (si no se hizo clic en un enlace real)
      var card = e.target.closest('.card[data-href], .post-item[data-href]');
      if (card && !e.target.closest('a')) {
        window.location.href = card.dataset.href;
      }
    });
  }

  /* ---------------- router de hash ---------------- */
  var ROUTES = ['home', 'posts', 'about', 'contact'];
  var activeRoute = null;

  // Soporta #home/#posts/#about/#contact y #t/<tag> (filtro por tag desde un post)
  function parseHash() {
    var raw = window.location.hash.replace(/^#/, '');
    if (raw.indexOf('t/') === 0) {
      return { route: 'posts', tag: decodeURIComponent(raw.slice(2)) };
    }
    return { route: ROUTES.indexOf(raw) !== -1 ? raw : 'home', tag: undefined };
  }
  function currentRoute() { return parseHash().route; }

  function setActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function showRoute(route) {
    document.querySelectorAll('.route').forEach(function (section) {
      section.hidden = section.dataset.route !== route;
    });
    setActiveNav(route);
    if (route === 'posts') renderPosts();
    activeRoute = route;
    if (window.HDM_HERO) window.HDM_HERO.setRouteActive(route === 'home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function navigate() {
    var parsed = parseHash();
    if (parsed.tag !== undefined) filters.tag = parsed.tag;
    var route = parsed.route;
    if (route === activeRoute) {
      if (parsed.tag !== undefined) renderPosts(); // mismo route, nuevo filtro
      return;
    }
    var app = document.getElementById('app');
    if (H.prefersReducedMotion || !app) { showRoute(route); return; }
    app.classList.add('fading');
    setTimeout(function () {
      showRoute(route);
      app.classList.remove('fading');
    }, 200);
  }

  /* ---------------- arranque ---------------- */
  function init() {
    if (!document.getElementById('app')) return; // no estamos en index
    initSearchAndFilters();
    H.onLangChange(function () {
      renderHome();
      if (activeRoute === 'posts') renderPosts();
    });
    renderHome();                 // primer render (chrome ya fijó el idioma)
    window.addEventListener('hashchange', navigate);
    var parsed = parseHash();     // aplica filtro de tag si la URL lo trae
    if (parsed.tag !== undefined) filters.tag = parsed.tag;
    showRoute(parsed.route);
    if (window.HDM_HERO) window.HDM_HERO.mount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
