#!/usr/bin/env node
/* ============================================================
   hdmartinez — GENERADOR DE POSTS (sin dependencias)
   Uso:  node build.js     (o  npm run build)

   Qué hace:
     1) Lee assets/js/data.js (la fuente única de artículos).
     2) Para cada artículo:
        · Si NO existe content/<slug>.html, crea un andamio editable.
        · Inyecta ese cuerpo en la plantilla de página completa
          (head + nav + cabecera + cuerpo + anterior/siguiente + footer).
        · Escribe posts/<slug>.html.
     3) Genera sitemap.xml con todas las URLs.

   Para publicar un artículo nuevo:
     · Añade el objeto (con `slug`) a assets/js/data.js
     · Escribe content/<slug>.html
     · node build.js
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = require(path.join(ROOT, 'assets', 'js', 'data.js'));
const { ARTICLES } = DATA;

/* ---------------- CONFIG DEL SITIO ---------------- */
const SITE = {
  baseUrl: 'https://hdmartinez.dev', // ← cámbialo por tu dominio real (sin slash final)
  name: 'hdmartinez',
  author: 'hdmartinez'
};

/* ---------------- utilidades ---------------- */
function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formatDateES(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}
function thumb(imagen) { return imagen.replace('/800/400', '/400/280'); }

/* ---------------- partes compartidas (HTML) ---------------- */
// prefix: ruta relativa hacia la raíz ('' para index, '../' para /posts/*)
function navHtml(prefix) {
  const home = prefix + 'index.html';
  return `<header class="nav">
  <a href="${home}#home" class="brand" data-i18n-aria="aria.brand" aria-label="hdmartinez — ir al inicio">
    <span class="brand-hd">hd</span>martinez<span class="brand-cursor">_</span>
  </a>
  <nav class="nav-links" data-i18n-aria="aria.nav" aria-label="Navegación principal">
    <a href="${home}#home" class="nav-link" data-route="home" data-i18n="nav.home">Inicio</a>
    <a href="${home}#posts" class="nav-link" data-route="posts" data-i18n="nav.posts">Artículos</a>
    <a href="${home}#about" class="nav-link" data-route="about" data-i18n="nav.about">Sobre mí</a>
    <a href="${home}#contact" class="nav-link" data-route="contact" data-i18n="nav.contact">Contacto</a>
  </nav>
  <button id="lang-toggle" class="lang-toggle" aria-label="Switch to English">
    <span data-lang-opt="es" class="active">ES</span><span data-lang-opt="en">EN</span>
  </button>
  <button id="theme-toggle" class="theme-toggle" aria-label="Cambiar a tema claro">
    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
  </button>
</header>`;
}

function footerHtml() {
  return `<footer class="footer">
  © 2026 hdmartinez <span class="dot">●</span> <span data-i18n="footer.text">Hecho con SQL, café y tres pantallas.</span>
</footer>`;
}

// Evita el "flash" de tema: fija data-theme antes de pintar.
const THEME_NOFLASH = `<script>(function(){try{var t=localStorage.getItem('hdm-theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();</script>`;

/* ---------------- andamio de contenido editable ---------------- */
function scaffoldBody(a) {
  const code = [
    'import polars as pl',
    '',
    'ventas = pl.read_parquet("ventas.parquet")',
    'resumen = (',
    '    ventas',
    '    .group_by("categoria")',
    '    .agg(pl.col("monto").sum().alias("total"))',
    '    .sort("total", descending=True)',
    ')',
    'print(resumen.head())'
  ].join('\n');

  return `<!-- ============================================================
     ANDAMIO AUTOGENERADO — reemplaza este contenido con tu artículo.
     Etiquetas disponibles (ya estilizadas): h2, h3, p, ul/ol,
     <pre><code>, blockquote, <figure><img>, <div class="callout">.
     Tras editar, corre:  node build.js
     ============================================================ -->
<p>${esc(a.extracto)}</p>

<p>Este es un <strong>andamio de ejemplo</strong>. Borra todo lo que hay debajo
y escribe tu artículo usando estas etiquetas — ya vienen con estilo.</p>

<h2>Por qué importa</h2>
<p>Un par de párrafos que sitúan el problema. Aquí va el contexto: qué dolió,
qué intentaste primero y por qué eso te trajo hasta este texto.</p>

<div class="callout">
  <strong>Nota:</strong> los bloques <code>callout</code> sirven para resaltar
  una idea clave, una advertencia o un atajo.
</div>

<h2>Manos a la obra</h2>
<p>Introduce el ejemplo y luego muestra el código:</p>

<pre><code>${esc(code)}</code></pre>

<p>Explica qué hace el snippet y cuál fue el resultado medido.</p>

<h3>Un detalle fino</h3>
<ul>
  <li>Primer punto que descubriste.</li>
  <li>Segundo punto, con su matiz.</li>
  <li>Tercero: el que casi nadie menciona.</li>
</ul>

<blockquote>La conclusión en una frase que valga la pena citar.</blockquote>

<h2>Cierre</h2>
<p>Resume el aprendizaje y deja una llamada a la acción: prueba esto,
mídelo en tu caso y cuéntame cómo te fue.</p>`;
}

function ensureContent(a) {
  const file = path.join(ROOT, 'content', a.slug + '.html');
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, scaffoldBody(a) + '\n', 'utf8');
    return { file, created: true };
  }
  return { file, created: false };
}

/* ---------------- tags y navegación de la cabecera ---------------- */
function tagsHtml(a) {
  return a.tags.map(tag => {
    const color = (DATA.TAG_COLORS[tag]) || '#94A3B8';
    return `<a class="tag" href="../index.html#t/${encodeURIComponent(tag)}" style="--tc:${color}">${esc(tag)}</a>`;
  }).join('');
}

function postNavHtml(older, newer) {
  const prev = older
    ? `<a class="post-nav-link post-nav-prev" href="${older.slug}.html"><span class="post-nav-dir">Anterior</span><span class="post-nav-title">${esc(older.titulo)}</span></a>`
    : '<span></span>';
  const next = newer
    ? `<a class="post-nav-link post-nav-next" href="${newer.slug}.html"><span class="post-nav-dir">Siguiente</span><span class="post-nav-title">${esc(newer.titulo)}</span></a>`
    : '<span></span>';
  return prev + next;
}

/* ---------------- plantilla de página completa ---------------- */
function renderPage(a, bodyHtml, older, newer) {
  const url = `${SITE.baseUrl}/posts/${a.slug}.html`;
  const desc = a.extracto;
  return `<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(a.titulo)} — hdmartinez</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(SITE.author)}">
<link rel="canonical" href="${url}">
<!-- Open Graph / Twitter -->
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(a.titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(a.imagen)}">
<meta property="og:url" content="${url}">
<meta property="article:published_time" content="${a.fecha}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(a.titulo)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(a.imagen)}">
${THEME_NOFLASH}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/styles.css">
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: a.titulo,
  description: desc,
  image: a.imagen,
  datePublished: a.fecha,
  author: { '@type': 'Person', name: SITE.author },
  mainEntityOfPage: url
}, null, 2)}
</script>
</head>
<body>
<a class="skip-link" href="#post-main" data-i18n="skip">Saltar al contenido</a>
<div class="reading-progress" id="reading-progress" aria-hidden="true"></div>
${navHtml('../')}

<main id="app">
  <article class="post" data-slug="${a.slug}" id="post-main">
    <div class="container post-container">
      <a class="post-back" href="../index.html#posts" data-i18n="post.allPosts">Ver todos los artículos</a>

      <header class="post-header">
        <div class="post-tags tag-row">${tagsHtml(a)}</div>
        <h1 class="post-title">${esc(a.titulo)}</h1>
        <p class="post-lead">${esc(a.extracto)}</p>
        <div class="post-byline">
          <time class="post-date" datetime="${a.fecha}">Publicado el ${formatDateES(a.fecha)}</time>
          <span class="dot">●</span>
          <span class="post-readtime">${a.minLectura} min de lectura</span>
        </div>
      </header>

      <figure class="post-cover">
        <img src="${esc(a.imagen)}" alt="${esc(a.titulo)}" width="800" height="400" decoding="async">
      </figure>

      <nav class="post-toc" id="post-toc" aria-label="Índice del artículo"></nav>

      <div class="post-body">
${bodyHtml}
      </div>

      <nav class="post-nav" aria-label="Más artículos">${postNavHtml(older, newer)}</nav>
    </div>
  </article>
</main>

${footerHtml()}

<script defer src="../assets/js/data.js"></script>
<script defer src="../assets/js/chrome.js"></script>
<script defer src="../assets/js/post.js"></script>
</body>
</html>
`;
}

/* ---------------- sitemap ---------------- */
function writeSitemap(ordered) {
  const urls = [`${SITE.baseUrl}/index.html`]
    .concat(ordered.map(a => `${SITE.baseUrl}/posts/${a.slug}.html`));
  const body = urls.map(u =>
    `  <url><loc>${esc(u)}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
}

/* ---------------- build ---------------- */
function build() {
  const ordered = ARTICLES.slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
  let created = 0, written = 0, scaffolded = 0;

  // valida slugs únicos
  const seen = new Set();
  for (const a of ARTICLES) {
    if (!a.slug) throw new Error(`Artículo id=${a.id} sin slug`);
    if (seen.has(a.slug)) throw new Error(`slug duplicado: ${a.slug}`);
    seen.add(a.slug);
  }

  ordered.forEach((a, i) => {
    const c = ensureContent(a);
    if (c.created) { scaffolded++; console.log(`  + andamio creado: content/${a.slug}.html`); }
    const body = fs.readFileSync(c.file, 'utf8').trimEnd();

    const newer = ordered[i - 1]; // más reciente
    const older = ordered[i + 1]; // más antiguo
    const html = renderPage(a, body, older, newer);
    fs.writeFileSync(path.join(ROOT, 'posts', a.slug + '.html'), html, 'utf8');
    written++;
  });

  writeSitemap(ordered);

  console.log(`\n✓ build OK`);
  console.log(`  ${written} páginas → posts/`);
  if (scaffolded) console.log(`  ${scaffolded} andamios de contenido creados en content/ (edítalos y vuelve a correr)`);
  console.log(`  sitemap.xml actualizado (${ordered.length + 1} URLs)`);
}

build();
