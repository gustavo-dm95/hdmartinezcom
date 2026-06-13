/* ============================================================
   hdmartinez — DATOS (fuente única de verdad)
   UMD: funciona como <script> en el navegador (window.HDM_DATA)
        y como módulo en Node (require) para build.js
   ------------------------------------------------------------
   Para agregar un artículo nuevo:
     1) Añade un objeto a ARTICLES con un `slug` único.
     2) Crea content/<slug>.html con el cuerpo del post.
     3) Corre `npm run build` (o `node build.js`).
   ES es la fuente de verdad; el bloque `en` es opcional
   (si falta, la vista EN cae al texto en español).
   ============================================================ */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api; // Node / build.js
  if (root) root.HDM_DATA = api;                                             // navegador
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------- TAGS ---------------- */
  var TAG_COLORS = {
    'SQL': '#00D4AA',
    'Python': '#FFD166',
    'Power BI': '#E8A33D',
    'Snowflake': '#5BC0EB',
    'dbt': '#FF6B4A',
    'Analytics': '#10B981',
    'BI': '#34D399',
    'Machine Learning': '#FF5C8A',
    'Data Engineering': '#4ADE80',
    'Visualización': '#38BDF8',
    'Carrera': '#60A5FA',
    'Herramientas': '#94A3B8'
  };

  // Etiquetas visibles en EN (la clave canónica sigue siendo la ES)
  var TAG_LABELS_EN = {
    'Visualización': 'Data Viz',
    'Carrera': 'Career',
    'Herramientas': 'Tools'
  };

  /* ---------------- ARTÍCULOS ----------------
     `slug` define la URL del post: posts/<slug>.html
     y el archivo de contenido: content/<slug>.html */
  var ARTICLES = [
    { id: 1, slug: 'pandas-vs-polars-benchmark', fecha: '2025-05-14', tags: ['Python', 'Data Engineering', 'Herramientas'], imagen: 'https://picsum.photos/seed/polars-bench/800/400', minLectura: 10,
      titulo: 'Pandas vs Polars: medí ambos con datos reales y esto encontré',
      extracto: 'Benchmarks con un dataset de 8 millones de filas de ventas: tiempos, memoria y ergonomía de API. Spoiler: la respuesta no es "siempre Polars".',
      en: { titulo: "Pandas vs Polars: I benchmarked both on real data — here's what I found",
            extracto: 'Benchmarks on an 8-million-row sales dataset: timings, memory and API ergonomics. Spoiler: the answer is not "always Polars".' } },
    { id: 2, slug: 'snowflake-dbt-stack-moderno', fecha: '2025-04-02', tags: ['Snowflake', 'dbt', 'Data Engineering'], imagen: 'https://picsum.photos/seed/snowdbt/800/400', minLectura: 9,
      titulo: 'Snowflake + dbt: el stack moderno explicado sin humo',
      extracto: 'Qué resuelve realmente cada pieza, dónde se traslapan y cómo montar un proyecto mínimo viable que no te queme créditos en la primera semana.',
      en: { titulo: 'Snowflake + dbt: the modern stack explained without the hype',
            extracto: "What each piece actually solves, where they overlap, and how to set up a minimum viable project that won't burn your credits in week one." } },
    { id: 3, slug: 'de-analista-a-analytics-engineer', fecha: '2025-03-11', tags: ['Carrera', 'dbt', 'SQL'], imagen: 'https://picsum.photos/seed/carrera-ae/800/400', minLectura: 7,
      titulo: 'De analista a analytics engineer: mapa de ruta realista',
      extracto: 'Las habilidades que sí mueven la aguja, las certificaciones que puedes saltarte y un plan de 6 meses construido sobre proyectos, no sobre cursos.',
      en: { titulo: 'From analyst to analytics engineer: a realistic roadmap',
            extracto: 'The skills that actually move the needle, the certifications you can skip, and a 6-month plan built on projects, not courses.' } },
    { id: 4, slug: 'window-functions-5-patrones', fecha: '2025-02-18', tags: ['SQL', 'Analytics'], imagen: 'https://picsum.photos/seed/sqlwindow/800/400', minLectura: 8,
      titulo: 'Window functions: los 5 patrones que resuelven el 80% de tus consultas',
      extracto: 'ROW_NUMBER para deduplicar, LAG para deltas, ventanas acumuladas para running totals y dos patrones más que deberían venir de fábrica en tu cabeza.',
      en: { titulo: 'Window functions: the 5 patterns that solve 80% of your queries',
            extracto: 'ROW_NUMBER to dedupe, LAG for deltas, cumulative windows for running totals, and two more patterns that should ship pre-installed in your head.' } },
    { id: 5, slug: 'dax-medidas-que-no-se-rompen', fecha: '2025-01-21', tags: ['Power BI', 'BI'], imagen: 'https://picsum.photos/seed/dax-patterns/800/400', minLectura: 6,
      titulo: 'Medidas DAX que no se rompen: patrones de contexto de filtro',
      extracto: 'CALCULATE no es magia negra: es contexto. Tres patrones defensivos para que tus medidas sobrevivan a cualquier slicer que el usuario invente.',
      en: { titulo: "DAX measures that don't break: filter context patterns",
            extracto: 'CALCULATE is not black magic: it is context. Three defensive patterns so your measures survive any slicer a user can invent.' } },
    { id: 6, slug: 'snowflake-cost-control', fecha: '2024-11-05', tags: ['Snowflake', 'Herramientas'], imagen: 'https://picsum.photos/seed/snowflake-cost/800/400', minLectura: 6,
      titulo: 'Snowflake cost control: cómo dejé de quemar créditos',
      extracto: 'Auto-suspend agresivo, warehouses por carga de trabajo y un query del ACCOUNT_USAGE que delata a los culpables. Mi factura bajó 40%.',
      en: { titulo: 'Snowflake cost control: how I stopped burning credits',
            extracto: 'Aggressive auto-suspend, one warehouse per workload, and an ACCOUNT_USAGE query that exposes the culprits. My bill dropped 40%.' } },
    { id: 7, slug: 'dashboards-jerarquia-visual-bi', fecha: '2024-09-17', tags: ['Visualización', 'BI', 'Power BI'], imagen: 'https://picsum.photos/seed/dashboards-bi/800/400', minLectura: 7,
      titulo: 'Dashboards que la gente sí usa: jerarquía visual en BI',
      extracto: 'El problema no es tu data, es que tu dashboard grita doce cosas a la vez. Principios de jerarquía aplicados a reportes ejecutivos reales.',
      en: { titulo: 'Dashboards people actually use: visual hierarchy in BI',
            extracto: 'The problem is not your data — it is that your dashboard shouts twelve things at once. Hierarchy principles applied to real executive reports.' } },
    { id: 8, slug: 'modelado-dimensional-kimball-2024', fecha: '2024-06-24', tags: ['Data Engineering', 'SQL', 'Analytics'], imagen: 'https://picsum.photos/seed/kimball/800/400', minLectura: 11,
      titulo: 'Modelado dimensional en 2024: ¿sigue vivo Kimball?',
      extracto: 'One Big Table, data vault, esquemas estrella: comparé los tres enfoques en un warehouse real. Kimball respira, pero ya no manda solo.',
      en: { titulo: 'Dimensional modeling in 2024: is Kimball still alive?',
            extracto: 'One Big Table, data vault, star schemas: I compared all three approaches in a real warehouse. Kimball breathes, but it no longer rules alone.' } },
    { id: 9, slug: 'machine-learning-pymes', fecha: '2024-03-12', tags: ['Machine Learning', 'Analytics'], imagen: 'https://picsum.photos/seed/ml-pymes/800/400', minLectura: 8,
      titulo: 'Machine Learning para PyMEs: qué sirve y qué es marketing',
      extracto: 'Pronóstico de demanda y segmentación de clientes: sí. "IA que transforma tu negocio" en un PDF de ventas: probablemente no. Una guía honesta.',
      en: { titulo: 'Machine learning for SMBs: what works and what is marketing',
            extracto: 'Demand forecasting and customer segmentation: yes. "AI that transforms your business" in a sales PDF: probably not. An honest guide.' } },
    { id: 10, slug: 'sql-que-escala-indices-particiones', fecha: '2023-08-29', tags: ['SQL', 'Data Engineering'], imagen: 'https://picsum.photos/seed/sql-scale/800/400', minLectura: 9,
      titulo: 'SQL que escala: índices, particiones y sentido común',
      extracto: 'Antes de pedir más hardware, lee el plan de ejecución. Casos reales donde un índice bien puesto convirtió 4 minutos en 200 milisegundos.',
      en: { titulo: 'SQL that scales: indexes, partitions and common sense',
            extracto: 'Before asking for more hardware, read the execution plan. Real cases where a well-placed index turned 4 minutes into 200 milliseconds.' } },
    { id: 11, slug: 'flujo-analisis-python-csv-insight', fecha: '2023-05-16', tags: ['Python', 'Herramientas', 'Analytics'], imagen: 'https://picsum.photos/seed/python-setup/800/400', minLectura: 7,
      titulo: 'Mi flujo de análisis con Python: del CSV crudo al insight',
      extracto: 'Notebook, ambiente virtual, perfilado rápido con pandas y un checklist de calidad de datos que me ha salvado de publicar conclusiones falsas.',
      en: { titulo: 'My Python analysis workflow: from raw CSV to insight',
            extracto: 'Notebook, virtual environment, quick profiling with pandas, and a data-quality checklist that has saved me from publishing false conclusions.' } },
    { id: 12, slug: 'primer-dashboard-power-bi', fecha: '2023-02-07', tags: ['Power BI', 'Visualización', 'Carrera'], imagen: 'https://picsum.photos/seed/primer-dashboard/800/400', minLectura: 5,
      titulo: 'Mi primer dashboard en Power BI: errores que cometí por ti',
      extracto: 'Importé todo, no modelé nada y usé 14 colores. Crónica de un reporte que tardaba 90 segundos en cargar y lo que aprendí al reconstruirlo.',
      en: { titulo: "My first Power BI dashboard: mistakes I made so you don't have to",
            extracto: 'I imported everything, modeled nothing and used 14 colors. The story of a report that took 90 seconds to load — and what rebuilding it taught me.' } }
  ];

  /* ---------------- I18N: textos de interfaz ---------------- */
  var I18N = {
    es: {
      'skip': 'Saltar al contenido',
      'aria.brand': 'hdmartinez — ir al inicio',
      'aria.nav': 'Navegación principal',
      'nav.home': 'Inicio', 'nav.posts': 'Artículos', 'nav.about': 'Sobre mí', 'nav.contact': 'Contacto',
      'hero.eyebrow': 'Blog técnico · en español',
      'hero.w1': 'Datos', 'hero.w2': 'Código', 'hero.w3': 'Ideas',
      'hero.cta': 'Explorar artículos',
      'home.eyebrow': 'Lo último', 'home.title': 'Artículos recientes',
      'home.sub': 'SQL, Python, BI moderno y la carrera en datos — escrito desde la trinchera, sin humo.',
      'home.archive': 'Ver el archivo completo →',
      'posts.eyebrow': 'Archivo', 'posts.title': 'Todos los artículos',
      'posts.search.placeholder': 'Buscar por título o tag…',
      'posts.search.aria': 'Buscar artículos por título o tag',
      'posts.tip': 'Tip: haz clic en cualquier tag para filtrar.',
      'posts.filteringBy': 'Filtrando por tag:',
      'posts.clearTag': 'Quitar filtro de tag {tag}',
      'posts.countAll': '{n} artículos publicados desde 2023.',
      'posts.countFiltered': '{n} de {total} artículos coinciden con tu filtro.',
      'posts.empty1': 'Sin resultados', 'posts.emptyFor': ' para «{q}»',
      'posts.empty2': 'Prueba con otro término o limpia los filtros.',
      'posts.reset': 'Limpiar filtros',
      'posts.one': 'artículo', 'posts.many': 'artículos',
      'posts.yearAria': 'Artículos de {year}',
      'card.minRead': 'min de lectura',
      'card.cover': 'Portada del artículo: {t}',
      'card.thumb': 'Miniatura: {t}',
      'card.readMore': 'Leer artículo',
      'tag.aria': 'Filtrar artículos por {tag}',
      'about.eyebrow': 'Sobre mí', 'about.title': 'Hola, soy hdmartinez',
      'about.p1': 'Desarrollador BI y analista de datos desde Ciudad de México. Llevo años construyendo dashboards, modelos de datos y pipelines para empresas que necesitan respuestas, no diapositivas bonitas. Hoy mi camino apunta hacia la ingeniería analítica: SQL como lengua materna, Python como navaja suiza, y la nube como taller.',
      'about.p2': 'Este blog existe porque la mayoría del contenido técnico de calidad está en inglés, y porque creo que las PyMEs hispanohablantes merecen analítica seria sin traducciones a medias. Escribo lo que me hubiera gustado leer cuando empecé: directo, con código real y con las cicatrices incluidas.',
      'about.p3': 'Cuando no estoy frente a un IDE, estoy en el gimnasio de box o sufriendo con Pumas y la Juve. Las tres cosas enseñan lo mismo: la constancia gana.',
      'about.cta.title': '¿Tienes un proyecto de datos en mente?',
      'about.cta.text': 'Cuéntame qué problema quieres resolver y vemos cómo atacarlo.',
      'about.cta.btn': 'Escríbeme',
      'about.stack': 'Stack & herramientas', 'about.journey': 'Trayectoria',
      'tl1.title': 'Primeros datos', 'tl1.desc': 'De Excel a SQL: reportes que dejaron de romperse los lunes.',
      'tl2.title': 'BI Developer', 'tl2.desc': 'Power BI + SQL Server en producción, modelos tabulares y DAX serio.',
      'tl3.title': 'Stack en la nube', 'tl3.desc': 'Snowflake y Python para pipelines: el warehouse dejó de vivir en un servidor bajo el escritorio.',
      'tl4.title': 'Analytics engineering', 'tl4.desc': 'dbt, orquestación y consultoría de datos para PyMEs en México.',
      'contact.eyebrow': 'Contacto', 'contact.title': 'Hablemos de datos',
      'contact.sub': 'Proyectos, colaboraciones, dudas técnicas o simplemente saludar — todo es bienvenido.',
      'contact.name': 'Nombre', 'contact.email': 'Email', 'contact.message': 'Mensaje',
      'contact.send': 'Enviar mensaje',
      'contact.directEmail': 'Email directo', 'contact.social': 'Redes',
      'form.missing': 'Completa los tres campos para enviar tu mensaje.',
      'form.badEmail': 'Revisa el formato del email.',
      'form.ok': 'Mensaje listo, {name} — demo de UI: aún no hay backend conectado.',
      'theme.toLight': 'Cambiar a tema claro', 'theme.toDark': 'Cambiar a tema oscuro',
      'lang.switch': 'Switch to English',
      'social.github': 'GitHub de hdmartinez', 'social.linkedin': 'LinkedIn de hdmartinez', 'social.x': 'Twitter/X de hdmartinez',
      'footer.text': 'Hecho con SQL, café y tres pantallas.',
      'post.back': '← Volver al inicio', 'post.allPosts': 'Ver todos los artículos',
      'post.published': 'Publicado el', 'post.min': 'min de lectura',
      'post.prev': 'Anterior', 'post.next': 'Siguiente', 'post.share': 'Compartir',
      'post.toc': 'En este artículo'
    },
    en: {
      'skip': 'Skip to content',
      'aria.brand': 'hdmartinez — go home',
      'aria.nav': 'Main navigation',
      'nav.home': 'Home', 'nav.posts': 'Articles', 'nav.about': 'About', 'nav.contact': 'Contact',
      'hero.eyebrow': 'Tech blog · English edition',
      'hero.w1': 'Data', 'hero.w2': 'Code', 'hero.w3': 'Ideas',
      'hero.cta': 'Browse articles',
      'home.eyebrow': 'Latest', 'home.title': 'Recent articles',
      'home.sub': 'SQL, Python, modern BI and the data career — written from the trenches, no fluff.',
      'home.archive': 'View the full archive →',
      'posts.eyebrow': 'Archive', 'posts.title': 'All articles',
      'posts.search.placeholder': 'Search by title or tag…',
      'posts.search.aria': 'Search articles by title or tag',
      'posts.tip': 'Tip: click any tag to filter.',
      'posts.filteringBy': 'Filtering by tag:',
      'posts.clearTag': 'Remove tag filter {tag}',
      'posts.countAll': '{n} articles published since 2023.',
      'posts.countFiltered': '{n} of {total} articles match your filter.',
      'posts.empty1': 'No results', 'posts.emptyFor': ' for “{q}”',
      'posts.empty2': 'Try another term or clear the filters.',
      'posts.reset': 'Clear filters',
      'posts.one': 'article', 'posts.many': 'articles',
      'posts.yearAria': 'Articles from {year}',
      'card.minRead': 'min read',
      'card.cover': 'Article cover: {t}',
      'card.thumb': 'Thumbnail: {t}',
      'card.readMore': 'Read article',
      'tag.aria': 'Filter articles by {tag}',
      'about.eyebrow': 'About', 'about.title': "Hi, I'm hdmartinez",
      'about.p1': "BI developer and data analyst from Mexico City. I've spent years building dashboards, data models and pipelines for companies that need answers, not pretty slides. Today my path points toward analytics engineering: SQL as my mother tongue, Python as my Swiss army knife, and the cloud as my workshop.",
      'about.p2': 'This blog exists because most quality technical content is English-only, and because I believe Spanish-speaking SMBs deserve serious analytics without half-baked translations. I write what I wish I had read when I started: direct, with real code and the scars included.',
      'about.p3': "When I'm not in front of an IDE, I'm at the boxing gym or suffering with Pumas and Juve. All three teach the same lesson: consistency wins.",
      'about.cta.title': 'Got a data project in mind?',
      'about.cta.text': "Tell me the problem you want to solve and let's figure out how to attack it.",
      'about.cta.btn': 'Write to me',
      'about.stack': 'Stack & tools', 'about.journey': 'Journey',
      'tl1.title': 'First data', 'tl1.desc': 'From Excel to SQL: reports that stopped breaking on Mondays.',
      'tl2.title': 'BI Developer', 'tl2.desc': 'Power BI + SQL Server in production, tabular models and serious DAX.',
      'tl3.title': 'Cloud stack', 'tl3.desc': 'Snowflake and Python pipelines: the warehouse no longer lives on a server under a desk.',
      'tl4.title': 'Analytics engineering', 'tl4.desc': 'dbt, orchestration and data consulting for SMBs in Mexico.',
      'contact.eyebrow': 'Contact', 'contact.title': "Let's talk data",
      'contact.sub': 'Projects, collaborations, technical questions or just saying hi — everything is welcome.',
      'contact.name': 'Name', 'contact.email': 'Email', 'contact.message': 'Message',
      'contact.send': 'Send message',
      'contact.directEmail': 'Direct email', 'contact.social': 'Social',
      'form.missing': 'Fill in all three fields to send your message.',
      'form.badEmail': 'Check the email format.',
      'form.ok': 'Message ready, {name} — UI demo: no backend connected yet.',
      'theme.toLight': 'Switch to light theme', 'theme.toDark': 'Switch to dark theme',
      'lang.switch': 'Cambiar a español',
      'social.github': 'hdmartinez on GitHub', 'social.linkedin': 'hdmartinez on LinkedIn', 'social.x': 'hdmartinez on Twitter/X',
      'footer.text': 'Made with SQL, coffee and three monitors.',
      'post.back': '← Back home', 'post.allPosts': 'View all articles',
      'post.published': 'Published on', 'post.min': 'min read',
      'post.prev': 'Previous', 'post.next': 'Next', 'post.share': 'Share',
      'post.toc': 'In this article'
    }
  };

  return {
    ARTICLES: ARTICLES,
    TAG_COLORS: TAG_COLORS,
    TAG_LABELS_EN: TAG_LABELS_EN,
    I18N: I18N
  };
});
