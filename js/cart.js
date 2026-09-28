/* ============================================
   CART.JS — Da Sports Box
   Carrinho em painel lateral. Os itens ficam no
   localStorage do navegador.
   TODO: na Shopify, trocar por /cart.js,
         /cart/add.js e /cart/change.js
   ============================================ */

(function () {
  'use strict';

  var DSB = window.DSB = window.DSB || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'dsb_cart_v1';
  var FREE_SHIPPING = 299;
  var PIX_OFF = 0.05;
  var fmt = DSB.fmt;
  var esc = DSB.escapeHtml;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* modo privado */ }
  }
  try { localStorage.removeItem('dsb_cart_count'); } catch (e) { /* versão antiga */ }

  var items = load();

  // ---------- Markup do painel ----------
  var drawer = document.createElement('div');
  drawer.className = 'drawer drawer-right';
  drawer.id = 'cartDrawer';
  drawer.hidden = true;
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'cartTitle');
  drawer.innerHTML =
    '<div class="drawer-backdrop" data-drawer-close></div>'
    + '<aside class="drawer-panel cart-panel">'
    +   '<div class="drawer-head">'
    +     '<div><div class="drawer-title" id="cartTitle">Seu carrinho</div><div class="drawer-sub" id="cartSub"></div></div>'
    +     '<button class="drawer-x" type="button" data-drawer-close aria-label="Fechar carrinho">✕</button>'
    +   '</div>'
    +   '<div class="cart-ship"><div class="cart-ship-txt" id="cartShipTxt"></div><div class="ship-bar"><i id="cartShipBar"></i></div></div>'
    +   '<div class="cart-body" id="cartBody"></div>'
    +   '<div class="cart-foot" id="cartFoot">'
    +     '<div class="cart-line"><span>Subtotal</span><b id="cartSubtotal"></b></div>'
    +     '<div class="cart-line pix"><span>No Pix (5% off)</span><b id="cartPix"></b></div>'
    +     '<button type="button" class="btn btn-white btn-block" id="cartCheckout">Finalizar compra <span class="arr">→</span></button>'
    +     '<button type="button" class="cart-continue" data-drawer-close>Continuar comprando</button>'
    +   '</div>'
    + '</aside>';
  document.body.appendChild(drawer);

  var body = drawer.querySelector('#cartBody');

  function count() { return items.reduce(function (n, it) { return n + it.qty; }, 0); }
  function subtotal() { return items.reduce(function (n, it) { return n + it.unit * it.qty; }, 0); }

  function renderCount(bump) {
    var n = count();
    document.querySelectorAll('.cart-count').forEach(function (el) {
      el.textContent = n;
      el.setAttribute('data-n', n);
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
  }

  function itemHtml(it, i) {
    var media = it.image
      ? '<img src="' + esc(it.image) + '" alt="" width="420" height="420">'
      : '<span>' + esc(it.emoji || '📦') + '</span>';
    return '<li class="ci" data-id="' + esc(it.id) + '" style="--i:' + i + '">'
      + '<a class="ci-img" href="' + esc(it.url) + '">' + media + '</a>'
      + '<div class="ci-main">'
      +   '<a class="ci-name" href="' + esc(it.url) + '">' + esc(it.name) + '</a>'
      +   '<div class="ci-kit">' + esc(it.kit) + '</div>'
      +   (it.sizes ? '<div class="ci-sizes">' + esc(it.sizes) + '</div>' : '')
      +   '<div class="ci-row">'
      +     '<div class="ci-qty"><button type="button" data-dec aria-label="Diminuir">−</button><span>' + it.qty + '</span><button type="button" data-inc aria-label="Aumentar">+</button></div>'
      +     '<div class="ci-price">' + (it.old ? '<s>' + fmt(it.old * it.qty) + '</s>' : '') + fmt(it.unit * it.qty) + '</div>'
      +   '</div>'
      + '</div>'
      + '<button type="button" class="ci-remove" data-remove aria-label="Remover ' + esc(it.name) + '">✕</button>'
      + '</li>';
  }

  function render(newId) {
    var n = count();
    var sub = subtotal();
    drawer.querySelector('#cartSub').textContent = n ? n + (n > 1 ? ' itens' : ' item') : 'vazio';

    var missing = FREE_SHIPPING - sub;
    var shipTxt = drawer.querySelector('#cartShipTxt');
    shipTxt.innerHTML = !n ? 'Frete grátis nas compras acima de <b>' + fmt(FREE_SHIPPING) + '</b>'
      : missing > 0 ? 'Faltam <b>' + fmt(missing) + '</b> para o frete grátis'
      : '🎉 Você ganhou <b>frete grátis!</b>';
    var bar = drawer.querySelector('#cartShipBar');
    bar.style.width = Math.min(100, sub / FREE_SHIPPING * 100).toFixed(1) + '%';
    bar.classList.toggle('full', n > 0 && missing <= 0);

    if (!n) {
      body.innerHTML = '<div class="cart-empty">'
        + '<div class="cart-empty-box">?</div>'
        + '<b>Seu carrinho está vazio</b>'
        + '<p>O manto está esperando por você.</p>'
        + '<a class="btn btn-white" href="index.html#boxes">Ver as boxes <span class="arr">→</span></a>'
        + '</div>';
      drawer.querySelector('#cartFoot').hidden = true;
    } else {
      body.innerHTML = '<ul class="cart-list">' + items.map(itemHtml).join('') + '</ul>';
      drawer.querySelector('#cartFoot').hidden = false;
      drawer.querySelector('#cartSubtotal').textContent = fmt(sub);
      drawer.querySelector('#cartPix').textContent = fmt(sub * (1 - PIX_OFF));
      if (newId) {
        var li = body.querySelector('[data-id="' + CSS.escape(newId) + '"]');
        if (li) li.classList.add('is-new');
      }
    }
    renderCount(false);
  }

  function find(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return i;
    return -1;
  }

  body.addEventListener('click', function (e) {
    var li = e.target.closest('.ci');
    if (!li) return;
    var i = find(li.getAttribute('data-id'));
    if (i < 0) return;
    if (e.target.closest('[data-inc]')) {
      items[i].qty = Math.min(20, items[i].qty + 1);
    } else if (e.target.closest('[data-dec]')) {
      if (items[i].qty > 1) items[i].qty--;
      else return removeItem(li, i);
    } else if (e.target.closest('[data-remove]')) {
      return removeItem(li, i);
    } else {
      return;
    }
    save();
    render();
    renderCount(true);
  });

  function removeItem(li, i) {
    var removed = items[i];
    li.style.height = li.offsetHeight + 'px';
    li.classList.add('is-removing');
    requestAnimationFrame(function () { li.style.height = '0px'; });
    setTimeout(function () {
      items.splice(find(removed.id), 1);
      save();
      render();
      renderCount(true);
    }, reduceMotion ? 0 : 320);
  }

  drawer.querySelector('#cartCheckout').addEventListener('click', function () {
    var b = this;
    b.classList.add('is-loading');
    // TODO: na Shopify, redirecionar para /checkout depois de sincronizar o carrinho
    setTimeout(function () {
      b.classList.remove('is-loading');
      if (DSB.toast) DSB.toast('Checkout da Shopify ainda não conectado neste tema', { type: 'error' });
    }, 700);
  });

  // ---------- API pública ----------
  // item: { name, url, image, emoji, kit, sizes, unit, old, qty }
  DSB.cart = {
    add: function (item, fromEl) {
      item.qty = item.qty || 1;
      item.id = [item.url, item.kit, item.sizes].join('|');
      var target = document.querySelector('.site-header .cart-btn');

      function commit() {
        var i = find(item.id);
        if (i > -1) items[i].qty = Math.min(20, items[i].qty + item.qty);
        else items.unshift(item);
        save();
        render(item.id);
        renderCount(true);
        setTimeout(function () { DSB.openDrawer('cartDrawer'); }, reduceMotion ? 0 : 150);
      }

      if (!fromEl || !target || reduceMotion) { commit(); return; }
      var hdr = document.querySelector('.site-header');
      if (hdr) hdr.classList.remove('is-hidden');
      var a = fromEl.getBoundingClientRect();
      var b = target.getBoundingClientRect();
      var fly = document.createElement('div');
      fly.className = 'fly';
      fly.innerHTML = item.image ? '<img src="' + esc(item.image) + '" alt="">' : esc(item.emoji || '👕');
      fly.style.left = (a.left + a.width / 2 - 28) + 'px';
      fly.style.top  = (a.top + a.height / 2 - 28) + 'px';
      document.body.appendChild(fly);
      requestAnimationFrame(function () {
        fly.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,'
          + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.3) rotate(-20deg)';
        fly.style.opacity = '.5';
      });
      setTimeout(function () { fly.remove(); commit(); }, 800);
    },
    count: count,
    items: function () { return items.slice(); }
  };

  // Sincroniza entre abas abertas
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { items = load(); render(); }
  });

  render();
})();
