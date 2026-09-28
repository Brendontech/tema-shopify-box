/* ============================================
   LIGHTBOX.JS — Da Sports Box
   Visualizador de fotos em tela cheia.
   Celular: deslizar para o lado troca a foto,
            deslizar para baixo fecha.
   Desktop: setas, teclado (← → Esc) e clique.
   Uso: DSB.lightbox.open([{ src, caption }], indice)
   ============================================ */

(function () {
  'use strict';

  var DSB = window.DSB = window.DSB || {};
  var esc = DSB.escapeHtml;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Fotos');
  lb.innerHTML =
    '<div class="lb-top"><span class="lb-count" aria-live="polite"></span>'
    + '<button type="button" class="lb-x" aria-label="Fechar">✕</button></div>'
    + '<div class="lb-viewport"><div class="lb-track"></div></div>'
    + '<button type="button" class="lb-nav lb-prev" aria-label="Foto anterior">‹</button>'
    + '<button type="button" class="lb-nav lb-next" aria-label="Próxima foto">›</button>'
    + '<div class="lb-bottom"><div class="lb-caption"></div><div class="lb-dots"></div></div>';
  document.body.appendChild(lb);

  var viewport = lb.querySelector('.lb-viewport');
  var track    = lb.querySelector('.lb-track');
  var countEl  = lb.querySelector('.lb-count');
  var capEl    = lb.querySelector('.lb-caption');
  var dotsEl   = lb.querySelector('.lb-dots');

  var list = [];
  var index = 0;
  var lastFocus = null;

  function setPos(dx, dy, animate) {
    track.style.transition = animate && !reduceMotion ? 'transform .45s cubic-bezier(.22,1,.36,1)' : 'none';
    track.style.transform = 'translate3d(calc(' + (-index * 100) + '% + ' + (dx || 0) + 'px),' + (dy || 0) + 'px,0)';
    var fade = dy ? Math.max(.35, 1 - Math.abs(dy) / 400) : 1;
    lb.style.setProperty('--bg', fade);
  }

  function update() {
    countEl.textContent = (index + 1) + ' / ' + list.length;
    capEl.textContent = list[index].caption || '';
    dotsEl.querySelectorAll('i').forEach(function (d, i) { d.classList.toggle('on', i === index); });
    lb.querySelector('.lb-prev').disabled = index === 0;
    lb.querySelector('.lb-next').disabled = index === list.length - 1;
    // carrega as vizinhas
    [index - 1, index, index + 1].forEach(function (i) {
      var img = track.children[i] && track.children[i].querySelector('img');
      if (img && !img.src) img.src = img.getAttribute('data-src');
    });
  }

  function go(i) {
    index = Math.max(0, Math.min(list.length - 1, i));
    setPos(0, 0, true);
    update();
  }

  function open(items, start) {
    list = items;
    index = start || 0;
    lastFocus = document.activeElement;
    track.innerHTML = list.map(function (it) {
      return '<div class="lb-slide"><img data-src="' + esc(it.src) + '" alt="' + esc(it.caption || '') + '" draggable="false"></div>';
    }).join('');
    dotsEl.innerHTML = list.length > 1 ? list.map(function () { return '<i></i>'; }).join('') : '';
    lb.classList.toggle('single', list.length < 2);
    lb.hidden = false;
    if (DSB.lockScroll) DSB.lockScroll(true);
    setPos(0, 0, false);
    update();
    requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add('is-open'); }); });
    setTimeout(function () { lb.querySelector('.lb-x').focus({ preventScroll: true }); }, 50);
  }

  function close() {
    if (lb.hidden) return;
    lb.classList.remove('is-open');
    if (DSB.lockScroll) DSB.lockScroll(false);
    setTimeout(function () { if (!lb.classList.contains('is-open')) lb.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  lb.querySelector('.lb-x').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { go(index - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { go(index + 1); });
  dotsEl.addEventListener('click', function (e) {
    var d = e.target.closest('i');
    if (d) go(Array.prototype.indexOf.call(dotsEl.children, d));
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
  });

  // ---------- Gesto de arrastar ----------
  var startX = 0, startY = 0, dx = 0, dy = 0, axis = null, dragging = false, startT = 0;

  viewport.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; axis = null; dx = dy = 0;
    startX = e.clientX; startY = e.clientY; startT = Date.now();
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (axis === 'x') {
      var edge = (index === 0 && dx > 0) || (index === list.length - 1 && dx < 0);
      setPos(edge ? dx * .3 : dx, 0, false);
    } else if (axis === 'y' && dy > 0) {
      setPos(0, dy, false);
    }
  });
  function end(e) {
    if (!dragging) return;
    dragging = false;
    var fast = Date.now() - startT < 250;
    if (axis === 'x' && (Math.abs(dx) > viewport.offsetWidth * .18 || (fast && Math.abs(dx) > 30))) {
      go(index + (dx < 0 ? 1 : -1));
    } else if (axis === 'y' && (dy > 120 || (fast && dy > 50))) {
      close();
    } else if (!axis) {
      // toque simples fora da imagem fecha
      var hit = document.elementFromPoint(e.clientX, e.clientY);
      if (!hit || hit.tagName !== 'IMG') close();
      else setPos(0, 0, true);
    } else {
      setPos(0, 0, true);
    }
  }
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', function () { dragging = false; setPos(0, 0, true); });

  DSB.lightbox = { open: open, close: close };
})();
