/* ============================================================
   hdmartinez — FORMULARIO DE CONTACTO (solo UI / demo)
   Validación en cliente; no hay backend conectado.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var H = window.HDM;
    var form = document.getElementById('contact-form');
    var note = document.getElementById('form-note');
    if (!form || !note || !H) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = document.getElementById('f-nombre').value.trim();
      var email = document.getElementById('f-email').value.trim();
      var mensaje = document.getElementById('f-mensaje').value.trim();
      if (!nombre || !email || !mensaje) {
        note.textContent = H.t('form.missing');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = H.t('form.badEmail');
        return;
      }
      note.textContent = H.fmt(H.t('form.ok'), { name: nombre });
      form.reset();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
