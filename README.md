# hdmartinez — blog técnico

Sitio estático **multipágina**: el `index.html` es la portada/archivo (SPA con router
de hash) y cada artículo es una **página real** en `posts/<slug>.html`, generada por
`build.js` a partir de los datos en `assets/js/data.js` y el cuerpo en `content/<slug>.html`.

## Estructura

```
index.html                 Portada + archivo (router de hash: #home #posts #about #contact)
build.js                   Generador de posts (Node, sin dependencias)
package.json               Scripts: build / serve / dev
sitemap.xml                Generado por build.js
assets/
  css/styles.css           Todo el CSS (tokens + componentes + estilos de artículo)
  js/
    data.js                FUENTE ÚNICA: artículos (con slug) + tags + textos i18n  (UMD: navegador + Node)
    chrome.js              Compartido: tema, idioma, almacenamiento, utilidades  (todas las páginas)
    hero.js                Three.js (constelación) — carga diferida + optimizado  (solo index)
    home.js                Render del archivo, búsqueda, filtros, router  (solo index)
    post.js                Cabecera bilingüe, anterior/siguiente, TOC, progreso  (solo posts)
    contact.js             Formulario de contacto (demo UI)  (solo index)
content/<slug>.html        Cuerpo de cada artículo (lo editas tú)
posts/<slug>.html          GENERADO — no lo edites a mano
```

## Cómo agregar un artículo nuevo

1. Añade un objeto a `ARTICLES` en `assets/js/data.js` con un **`slug` único**
   (define la URL `posts/<slug>.html`). Copia el formato de los existentes.
2. Corre `node build.js`. Si aún no existe `content/<slug>.html`, se crea un
   **andamio editable** con la estructura y todos los estilos disponibles.
3. Edita `content/<slug>.html` con tu artículo (HTML simple: `h2`, `h3`, `p`,
   `ul/ol`, `pre>code`, `blockquote`, `figure>img`, `div.callout`).
4. Vuelve a correr `node build.js`. Listo: la card aparece sola en la portada y
   en el archivo, y el post queda en `posts/<slug>.html`.

## Comandos

```bash
npm run build      # genera posts/ + sitemap.xml
npm run dev        # build + servidor local en http://localhost:8000  (python3)
npm run serve      # build + servidor local con `npx serve`
```

> El sitio funciona también abriendo `index.html` directo (scripts clásicos, sin
> módulos ES), pero para ver el sitemap o probar rutas reales conviene un servidor.

## Notas de rendimiento

- **Three.js se carga de forma diferida**: el script (~600 KB) solo se descarga
  cuando el hero se va a animar (portada visible, con WebGL y sin
  `prefers-reduced-motion`). Quien aterriza en un post nunca lo baja.
- CSS/JS externos y compartidos → se **cachean** entre todas las páginas.
- Imágenes con `width/height`, `loading="lazy"` y `decoding="async"`.
- Reconstrucción de líneas del hero con *throttle* y menos nodos en móvil.

## SEO

Cada post genera `<title>`, `meta description`, **Open Graph/Twitter**, `canonical`,
JSON-LD `BlogPosting` y entra en `sitemap.xml`. Antes de publicar, cambia
`SITE.baseUrl` en `build.js` por tu dominio real.

## Idiomas

ES es la fuente de verdad; EN es opcional por artículo (`en: { titulo, extracto }`
en `data.js`). El **cuerpo** del post se escribe en ES; si falta traducción, la
vista EN muestra el texto en español (mismo criterio de fallback que el resto).

---

`index.html.bak` es el respaldo del monolito original (un solo archivo). Puedes
borrarlo cuando estés conforme con la nueva estructura.
