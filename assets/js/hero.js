/* ============================================================
   hdmartinez — HERO Three.js (constelación de datos)
   OPTIMIZACIONES vs. versión monolítica:
     · Carga diferida de Three.js: el script (~600 KB) solo se
       descarga cuando el hero realmente se va a animar
       (ruta home activa + visible + pestaña activa + WebGL +
        sin prefers-reduced-motion). Quien aterriza en otra
       vista, usa reduced-motion o no tiene WebGL NUNCA lo baja.
     · Reconstrucción de líneas con throttle (~30 fps) aunque la
       física corra a 60 fps: la mitad del trabajo O(n²) por seg.
     · Ajustes de bajo consumo en móvil (sin antialias, menos nodos,
       powerPreference: 'low-power').
   Expone window.HDM_HERO = { mount, setRouteActive }.
   ============================================================ */
(function () {
  'use strict';

  var THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  var HERO_PALETTES = {
    dark: {
      points: [0x34D399, 0x00D4AA],
      lineA: [0.063, 0.725, 0.506], lineB: [0.0, 0.831, 0.667],
      fadeToBg: null,
      pointSize: 2.6, pointOpacity: 0.95, lineOpacity: 0.55, blending: 'additive'
    },
    light: {
      points: [0x047857, 0x0F766E],
      lineA: [0.016, 0.471, 0.341], lineB: [0.059, 0.463, 0.431],
      fadeToBg: [0.969, 0.969, 0.988],
      pointSize: 3.0, pointOpacity: 0.9, lineOpacity: 0.85, blending: 'normal'
    }
  };

  var hero = {
    initialized: false, rafId: null, visible: true, routeActive: true,
    loading: false, loaded: false,
    renderer: null, scene: null, camera: null,
    points: null, lines: null,
    positions: null, velocities: null, kinds: null,
    linePositions: null, lineColors: null,
    palette: null, count: 0, frame: 0,
    bounds: { x: 160, y: 95, z: 60 },
    mouse: { x: 0, y: 0, worldX: 9999, worldY: 9999, active: false },
    world: { w: 0, h: 0 }
  };
  var CONNECT_DIST = 52;
  var MOUSE_RADIUS = 46;
  var LINE_EVERY = 2; // reconstruir líneas cada N frames (throttle O(n²))

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isWebGLAvailable() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  /* ---------------- carga diferida de Three.js ---------------- */
  function loadThree(cb) {
    if (window.THREE) { cb(true); return; }
    if (hero.loading) return;
    hero.loading = true;
    var s = document.createElement('script');
    s.src = THREE_SRC;
    s.async = true;
    s.onload = function () { hero.loading = false; cb(true); };
    s.onerror = function () { hero.loading = false; cb(false); };
    document.head.appendChild(s);
  }

  function computeWorldSize() {
    var heroEl = document.getElementById('hero');
    var fovRad = (hero.camera.fov * Math.PI) / 180;
    hero.world.h = 2 * Math.tan(fovRad / 2) * hero.camera.position.z;
    hero.world.w = hero.world.h * (heroEl.clientWidth / heroEl.clientHeight);
  }

  function buildConstellation() {
    var isMobile = window.innerWidth < 768;
    hero.count = isMobile ? 48 : 90;
    var n = hero.count;

    hero.positions = new Float32Array(n * 3);
    hero.velocities = new Float32Array(n * 3);
    hero.kinds = new Uint8Array(n);
    var pointColors = new Float32Array(n * 3);

    for (var i = 0; i < n; i++) {
      hero.positions[i * 3]     = (Math.random() - 0.5) * 2 * hero.bounds.x;
      hero.positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * hero.bounds.y;
      hero.positions[i * 3 + 2] = (Math.random() - 0.5) * 2 * hero.bounds.z;
      hero.velocities[i * 3]     = (Math.random() - 0.5) * 0.12;
      hero.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      hero.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
      hero.kinds[i] = Math.random() < 0.55 ? 0 : 1;
    }

    var pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(hero.positions, 3).setUsage(THREE.DynamicDrawUsage));
    pointGeo.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));
    var pointMat = new THREE.PointsMaterial({
      size: 2.6, vertexColors: true, transparent: true, opacity: 0.95,
      depthWrite: false, sizeAttenuation: true
    });
    hero.points = new THREE.Points(pointGeo, pointMat);
    hero.scene.add(hero.points);

    var maxSegments = (n * (n - 1)) / 2;
    hero.linePositions = new Float32Array(maxSegments * 2 * 3);
    hero.lineColors = new Float32Array(maxSegments * 2 * 3);
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(hero.linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(hero.lineColors, 3).setUsage(THREE.DynamicDrawUsage));
    var lineMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false
    });
    hero.lines = new THREE.LineSegments(lineGeo, lineMat);
    hero.scene.add(hero.lines);
  }

  function updateHeroTheme() {
    if (!hero.initialized) return;
    var theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    var pal = HERO_PALETTES[theme];
    hero.palette = pal;

    var cA = new THREE.Color(pal.points[0]);
    var cB = new THREE.Color(pal.points[1]);
    var colorAttr = hero.points.geometry.attributes.color;
    for (var i = 0; i < hero.count; i++) {
      var c = hero.kinds[i] === 0 ? cA : cB;
      colorAttr.array[i * 3] = c.r;
      colorAttr.array[i * 3 + 1] = c.g;
      colorAttr.array[i * 3 + 2] = c.b;
    }
    colorAttr.needsUpdate = true;

    var blending = pal.blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending;
    var pm = hero.points.material;
    pm.blending = blending; pm.opacity = pal.pointOpacity; pm.size = pal.pointSize;
    pm.needsUpdate = true;
    var lm = hero.lines.material;
    lm.blending = blending; lm.opacity = pal.lineOpacity;
    lm.needsUpdate = true;

    rebuildLines();
    if (hero.rafId === null) hero.renderer.render(hero.scene, hero.camera);
  }

  function stepParticles() {
    var n = hero.count;
    var p = hero.positions, v = hero.velocities, b = hero.bounds;
    var m = hero.mouse;
    for (var i = 0; i < n; i++) {
      var ix = i * 3, iy = ix + 1, iz = ix + 2;
      if (m.active) {
        var dx = p[ix] - m.worldX;
        var dy = p[iy] - m.worldY;
        var distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0.01) {
          var dist = Math.sqrt(distSq);
          var force = (1 - dist / MOUSE_RADIUS) * 0.45;
          p[ix] += (dx / dist) * force;
          p[iy] += (dy / dist) * force;
        }
      }
      p[ix] += v[ix]; p[iy] += v[iy]; p[iz] += v[iz];
      if (p[ix] > b.x || p[ix] < -b.x) v[ix] *= -1;
      if (p[iy] > b.y || p[iy] < -b.y) v[iy] *= -1;
      if (p[iz] > b.z || p[iz] < -b.z) v[iz] *= -1;
    }
    hero.points.geometry.attributes.position.needsUpdate = true;
  }

  function rebuildLines() {
    if (!hero.palette) return;
    var n = hero.count;
    var p = hero.positions;
    var lp = hero.linePositions, lc = hero.lineColors;
    var a = hero.palette.lineA, bCol = hero.palette.lineB;
    var fade = hero.palette.fadeToBg;
    var seg = 0;
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        var dx = p[i * 3] - p[j * 3];
        var dy = p[i * 3 + 1] - p[j * 3 + 1];
        var dz = p[i * 3 + 2] - p[j * 3 + 2];
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DIST) {
          var s = 1 - dist / CONNECT_DIST;
          var o = seg * 6;
          lp[o] = p[i * 3]; lp[o + 1] = p[i * 3 + 1]; lp[o + 2] = p[i * 3 + 2];
          lp[o + 3] = p[j * 3]; lp[o + 4] = p[j * 3 + 1]; lp[o + 5] = p[j * 3 + 2];
          if (fade) {
            lc[o]     = a[0] + (fade[0] - a[0]) * (1 - s);
            lc[o + 1] = a[1] + (fade[1] - a[1]) * (1 - s);
            lc[o + 2] = a[2] + (fade[2] - a[2]) * (1 - s);
            lc[o + 3] = bCol[0] + (fade[0] - bCol[0]) * (1 - s);
            lc[o + 4] = bCol[1] + (fade[1] - bCol[1]) * (1 - s);
            lc[o + 5] = bCol[2] + (fade[2] - bCol[2]) * (1 - s);
          } else {
            lc[o] = a[0] * s; lc[o + 1] = a[1] * s; lc[o + 2] = a[2] * s;
            lc[o + 3] = bCol[0] * s; lc[o + 4] = bCol[1] * s; lc[o + 5] = bCol[2] * s;
          }
          seg++;
        }
      }
    }
    hero.lines.geometry.setDrawRange(0, seg * 2);
    hero.lines.geometry.attributes.position.needsUpdate = true;
    hero.lines.geometry.attributes.color.needsUpdate = true;
  }

  function heroFrame() {
    stepParticles();
    if (hero.frame % LINE_EVERY === 0) rebuildLines(); // throttle del O(n²)
    hero.frame++;
    hero.camera.position.x += (hero.mouse.x * 14 - hero.camera.position.x) * 0.04;
    hero.camera.position.y += (-hero.mouse.y * 9 - hero.camera.position.y) * 0.04;
    hero.camera.lookAt(0, 0, 0);
    hero.renderer.render(hero.scene, hero.camera);
    hero.rafId = window.requestAnimationFrame(heroFrame);
  }

  function startHero() {
    if (hero.rafId === null && hero.initialized) hero.rafId = window.requestAnimationFrame(heroFrame);
  }
  function stopHero() {
    if (hero.rafId !== null) { window.cancelAnimationFrame(hero.rafId); hero.rafId = null; }
  }

  function shouldRun() {
    return hero.routeActive && hero.visible && !document.hidden && !prefersReducedMotion;
  }

  function updateHeroRunning() {
    if (!shouldRun()) { stopHero(); return; }
    // Primera vez que se necesita: ahora sí cargamos Three y construimos.
    if (!hero.initialized) { ensureInitialized(); return; }
    startHero();
  }

  /* ---------------- inicialización perezosa ---------------- */
  function ensureInitialized() {
    if (hero.initialized || hero.loading) return;
    var canvas = document.getElementById('hero-canvas');
    var heroEl = document.getElementById('hero');
    if (!canvas || !heroEl || !isWebGLAvailable()) {
      if (canvas) canvas.remove();
      return;
    }
    loadThree(function (ok) {
      if (!ok) { canvas.remove(); return; }

      var isMobile = window.innerWidth < 768;
      hero.renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true,
        antialias: !isMobile,
        powerPreference: isMobile ? 'low-power' : 'default'
      });
      hero.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      hero.renderer.setSize(heroEl.clientWidth, heroEl.clientHeight, false);

      hero.scene = new THREE.Scene();
      hero.camera = new THREE.PerspectiveCamera(60, heroEl.clientWidth / heroEl.clientHeight, 1, 1000);
      hero.camera.position.z = 210;
      computeWorldSize();

      buildConstellation();
      hero.initialized = true;
      updateHeroTheme();

      heroEl.addEventListener('pointermove', onHeroPointerMove);
      heroEl.addEventListener('pointerleave', onHeroPointerLeave);
      window.addEventListener('resize', window.HDM.debounce(onHeroResize, 150));

      updateHeroRunning(); // arranca si toca
    });
  }

  function onHeroPointerMove(e) {
    var heroEl = document.getElementById('hero');
    var rect = heroEl.getBoundingClientRect();
    hero.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    hero.mouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    hero.mouse.worldX = hero.mouse.x * (hero.world.w / 2);
    hero.mouse.worldY = -hero.mouse.y * (hero.world.h / 2);
    hero.mouse.active = true;
  }
  function onHeroPointerLeave() { hero.mouse.active = false; }

  function onHeroResize() {
    if (!hero.initialized) return;
    var heroEl = document.getElementById('hero');
    var w = heroEl.clientWidth, h = heroEl.clientHeight;
    hero.camera.aspect = w / h;
    hero.camera.updateProjectionMatrix();
    hero.renderer.setSize(w, h, false);
    computeWorldSize();
    if (hero.rafId === null) hero.renderer.render(hero.scene, hero.camera);
  }

  /* ---------------- API pública ---------------- */
  window.HDM_HERO = {
    mount: function () {
      var heroEl = document.getElementById('hero');
      if (!heroEl) return; // esta página no tiene hero
      if (prefersReducedMotion) return; // sin animación: queda el gradiente CSS

      var observer = new IntersectionObserver(function (entries) {
        hero.visible = entries[0].isIntersecting;
        updateHeroRunning();
      }, { threshold: 0.05 });
      observer.observe(heroEl);

      document.addEventListener('visibilitychange', updateHeroRunning);
      if (window.HDM) window.HDM.onThemeChange(updateHeroTheme);

      updateHeroRunning();
    },
    setRouteActive: function (active) {
      hero.routeActive = active;
      updateHeroRunning();
    }
  };
})();
