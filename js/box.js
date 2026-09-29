/* ============================================
   BOX.JS — Da Sports Box
   Página de produto: kits, tamanhos, totais,
   carrinho, galeria e guia de tamanhos
   TODO: substituir SIZES e PRICES por dados
         reais da Shopify Storefront API
   ============================================ */

(function () {
  'use strict';

  var DSB = window.DSB || {};
  var BOX = window.BOX || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- DADOS (virão da Shopify API em produção) ----
  var SIZES_MASC = ['P', 'M', 'G', 'GG', '2GG', '3GG', '4GG'];
  var SIZES_FEM  = ['P', 'M', 'G', 'GG', '2GG'];
  var SIZES = BOX.sizes || SIZES_MASC;
  var CASAL = BOX.mode === 'casal';

  function sizesFor(i) { return CASAL ? (i % 2 ? SIZES_MASC : SIZES_FEM) : SIZES; }
  function modelFor(i) { return CASAL ? (i % 2 ? 'masculino' : 'feminino') : (BOX.model || 'masculino'); }
  function labelFor(i) { return CASAL ? (i % 2 ? 'Ele' : 'Ela') + ' ' + Math.ceil(i / 2) : 'Camisa ' + i; }
  var PRICES = BOX.prices || [
    { t: 119, o: 197.95 },
    { t: 348, o: 593.85 },
    { t: 447, o: 989.75 },
    { t: 476, o: 1385.65 }
  ];
  var FREE_SHIPPING = 299;
  var PIX_OFF = 0.05;

  // Tabelas por modelo para o guia de tamanhos
  var TABLES = {
    masculino: [
      { sz: 'P',   alt: '160–170', peso: '55–70',   busto: '96–99',   comp: '67–69' },
      { sz: 'M',   alt: '168–176', peso: '65–80',   busto: '100–103', comp: '70–72' },
      { sz: 'G',   alt: '174–182', peso: '75–92',   busto: '104–107', comp: '73–75' },
      { sz: 'GG',  alt: '178–186', peso: '85–100',  busto: '108–111', comp: '76–78' },
      { sz: '2GG', alt: '182–190', peso: '95–115',  busto: '112–115', comp: '77–79' },
      { sz: '3GG', alt: '184–192', peso: '108–128', busto: '116–120', comp: '79–81' },
      { sz: '4GG', alt: '186–196', peso: '120–145', busto: '122–126', comp: '80–82' }
    ],
    feminino: [
      { sz: 'P',   alt: '155–163', peso: '48–58',  busto: '86–89',   comp: '62–64' },
      { sz: 'M',   alt: '160–168', peso: '56–68',  busto: '90–94',   comp: '64–66' },
      { sz: 'G',   alt: '165–173', peso: '64–78',  busto: '96–100',  comp: '66–68' },
      { sz: 'GG',  alt: '168–176', peso: '74–90',  busto: '102–106', comp: '68–70' },
      { sz: '2GG', alt: '170–178', peso: '86–104', busto: '108–112', comp: '70–72' }
    ],
    infantil: [
      { sz: '4',  alt: '98–108',  peso: '14–18', busto: '60–63', comp: '42–44' },
      { sz: '6',  alt: '108–118', peso: '18–23', busto: '63–66', comp: '45–47' },
      { sz: '8',  alt: '118–128', peso: '22–28', busto: '66–70', comp: '48–50' },
      { sz: '10', alt: '128–138', peso: '26–35', busto: '70–74', comp: '52–54' },
      { sz: '12', alt: '138–148', peso: '33–44', busto: '75–79', comp: '56–58' },
      { sz: '14', alt: '148–158', peso: '40–54', busto: '80–85', comp: '60–62' }
    ],
    jogador: [
      { sz: 'P',   alt: '165–173', peso: '60–74',  busto: '94–97',   comp: '69–71' },
      { sz: 'M',   alt: '171–179', peso: '70–84',  busto: '98–101',  comp: '71–73' },
      { sz: 'G',   alt: '177–185', peso: '80–96',  busto: '102–105', comp: '73–75' },
      { sz: 'GG',  alt: '181–189', peso: '90–108', busto: '106–110', comp: '75–77' },
      { sz: '2GG', alt: '185–193', peso: '105–122',busto: '112–116', comp: '77–79' }
    ],
    torcedor: [
      { sz: 'P',   alt: '158–168', peso: '58–72',  busto: '98–102',  comp: '68–70' },
      { sz: 'M',   alt: '166–174', peso: '68–82',  busto: '102–106', comp: '70–72' },
      { sz: 'G',   alt: '172–180', peso: '78–94',  busto: '106–110', comp: '72–74' },
      { sz: 'GG',  alt: '176–184', peso: '88–106', busto: '110–115', comp: '74–76' },
      { sz: '2GG', alt: '180–188', peso: '100–120',busto: '116–121', comp: '76–78' },
      { sz: '3GG', alt: '182–190', peso: '115–135',busto: '122–127', comp: '78–80' }
    ]
  };

  // ---- ESTADO ----
  var state = { kit: -1, n: 0, qty: 1, sizes: {}, tab: 1 };
  var shown = { old: PRICES[0].o, main: PRICES[0].t, pix: PRICES[0].t * (1 - PIX_OFF) };

  function $(id) { return document.getElementById(id); }
  var fmt = DSB.fmt || function (v) {
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  function toast(msg, opts) { if (DSB.toast) DSB.toast(msg, opts); }

  var kitsEl = $('kits');
  var kitEls = Array.prototype.slice.call(kitsEl.querySelectorAll('.kc'));

  // ---- SELEÇÃO DE KIT ----
  function selectKit(idx) {
    if (state.kit === idx) return;
    var el = kitEls[idx];
    state.kit = idx;
    state.n = +el.getAttribute('data-qty');
    state.sizes = {};
    state.tab = 1;

    kitEls.forEach(function (k, i) {
      var on = i === idx;
      k.classList.toggle('sel', on);
      k.setAttribute('aria-checked', on);
    });

    if (state.n > 1) buildTabs();
    buildButtons();
    renderGallery(state.n);
    updateTotals();
  }

  kitsEl.addEventListener('click', function (e) {
    var kc = e.target.closest('.kc');
    if (!kc) return;
    // cliques dentro da área de tamanhos não trocam de kit
    if (e.target.closest('.kc-sizes') && kc.classList.contains('sel')) {
      var tab = e.target.closest('.sz-tab');
      var szb = e.target.closest('.szb');
      if (tab) switchTab(+tab.getAttribute('data-n'));
      if (szb) pickSize(szb.getAttribute('data-sz'));
      return;
    }
    selectKit(+kc.getAttribute('data-kit'));
  });
  kitsEl.addEventListener('keydown', function (e) {
    var kc = e.target.closest('.kc');
    if (!kc || e.target !== kc) return;
    var i = +kc.getAttribute('data-kit');
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectKit(i); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var j = (i + (e.key === 'ArrowDown' ? 1 : -1) + kitEls.length) % kitEls.length;
      kitEls[j].focus();
      selectKit(j);
    }
  });

  function buildTabs() {
    var tc = kitEls[state.kit].querySelector('.sz-tabs');
    var html = '';
    for (var i = 1; i <= state.n; i++) {
      html += '<button type="button" class="sz-tab' + (i === 1 ? ' on' : '') + '" data-n="' + i + '">'
        + '<span class="sz-tab-label">' + labelFor(i) + '</span>'
        + '<span class="sz-tab-val">Escolher</span></button>';
    }
    tc.innerHTML = html;
  }

  function buildButtons() {
    var kc  = kitEls[state.kit];
    var cur = state.sizes[state.tab] || '';
    var lbl = kc.querySelector('.sz-btns-label');
    var list = sizesFor(state.tab);
    if (state.n > 1) lbl.textContent = 'Tamanho · ' + labelFor(state.tab) + (CASAL ? (state.tab % 2 ? ' (masculina)' : ' (feminina)') : '');
    var btns = kc.querySelector('.sz-btns');
    btns.style.setProperty('--cols', list.length);
    btns.innerHTML = list.map(function (s, i) {
      return '<button type="button" class="szb' + (cur === s ? ' on' : '') + '" data-sz="' + s + '" style="--i:' + i + '">' + s + '</button>';
    }).join('');
    renderDone();
  }

  function switchTab(t) {
    state.tab = t;
    var kc = kitEls[state.kit];
    kc.querySelectorAll('.sz-tab').forEach(function (x) {
      var n = +x.getAttribute('data-n');
      x.classList.toggle('on', n === t);
      x.classList.toggle('done', n !== t && !!state.sizes[n]);
      x.classList.remove('missing');
    });
    buildButtons();
  }

  function pickSize(size) {
    state.sizes[state.tab] = size;
    var kc = kitEls[state.kit];
    kc.querySelectorAll('.szb').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-sz') === size); });

    var tab = kc.querySelector('.sz-tab[data-n="' + state.tab + '"]');
    if (tab) {
      tab.querySelector('.sz-tab-val').textContent = size;
      tab.classList.remove('on', 'missing');
      tab.classList.add('done');
    }
    // Avança para a próxima camisa sem tamanho
    var next = firstMissing();
    if (next) setTimeout(function () { switchTab(next); }, 180);
    else renderDone();
  }

  function firstMissing() {
    for (var i = 1; i <= state.n; i++) if (!state.sizes[i]) return i;
    return 0;
  }

  function renderDone() {
    var kc = kitEls[state.kit];
    var old = kc.querySelector('.sz-done');
    if (old) old.remove();
    if (state.n > 1 && !firstMissing()) {
      var d = document.createElement('div');
      d.className = 'sz-done';
      d.textContent = '✓ Tamanhos escolhidos: ' + Object.keys(state.sizes).map(function (k) { return state.sizes[k]; }).join(' · ');
      kc.querySelector('.kc-sizes-inner').appendChild(d);
    }
  }

  // ---- GALERIA ----
  var mi      = $('mi');
  var miBig   = $('miBig');
  var miPhoto = $('miPhoto');
  var miFan   = $('miFan');
  var miLbl   = $('miLbl');
  var baseLabel = miLbl.textContent;

  function swap(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function kitLabel(n) {
    if (CASAL) return (n / 2) + (n > 2 ? ' CASAIS' : ' CASAL');
    return n + ' CAMISAS';
  }

  function renderGallery(n) {
    document.querySelectorAll('.tb').forEach(function (t) { t.classList.remove('on'); });
    miLbl.textContent = n > 1 ? kitLabel(n) : baseLabel;
    swap(miLbl, 'swap');

    if (miPhoto && BOX.photos) {
      if (n > 1) {
        var shots = BOX.photos.filter(function (p) { return !p.cover; });
        if (!shots.length) shots = BOX.photos;
        var k = Math.min(n, 5), html = '';
        for (var i = 0; i < k; i++) {
          var p = shots[i % shots.length];
          var rot = (i - (k - 1) / 2) * 7;
          html += '<img src="' + p.thumb + '" alt="" style="--i:' + i + ';--r:' + rot + 'deg;--x:' + ((i - (k - 1) / 2) * 34) + '%">';
        }
        miFan.innerHTML = html;
        miFan.hidden = false;
        mi.classList.add('fanned');
      } else {
        miFan.hidden = true;
        mi.classList.remove('fanned');
        miPhoto.src = BOX.photos[0].src;
        mi.classList.toggle('is-cover', !!BOX.photos[0].cover);
        var first = document.querySelector('.tb');
        if (first) first.classList.add('on');
      }
      return;
    }

    miBig.classList.toggle('many', n > 1);
    var h = '';
    for (var j = 0; j < Math.min(n, 7); j++) h += '<span class="pop" style="--i:' + j + '">👕</span>';
    miBig.innerHTML = h;
  }

  document.querySelectorAll('.tb').forEach(function (tb) {
    tb.addEventListener('click', function () {
      document.querySelectorAll('.tb').forEach(function (t) { t.classList.remove('on'); });
      tb.classList.add('on');
      miLbl.textContent = tb.getAttribute('data-label');
      swap(miLbl, 'swap');
      if (miPhoto) {
        mi.classList.toggle('is-cover', tb.getAttribute('data-cover') === '1');
        miFan.hidden = true;
        mi.classList.remove('fanned');
        miPhoto.src = tb.getAttribute('data-src');
        miPhoto.alt = tb.getAttribute('data-label') + ' — exemplo do acervo';
        swap(miPhoto, 'swap');
        return;
      }
      miBig.classList.remove('many');
      miBig.textContent = tb.getAttribute('data-icon');
      swap(miBig, 'swap');
    });
  });

  // Toque/clique na foto abre o visualizador em tela cheia
  if (miPhoto && BOX.photos && DSB.lightbox) {
    mi.classList.add('zoomable');
    mi.addEventListener('click', function (e) {
      if (e.target.closest('.mi-tag, .mi-off')) return;
      var thumbs = Array.prototype.slice.call(document.querySelectorAll('.tb-photo'));
      var cur = Math.max(0, thumbs.indexOf(document.querySelector('.tb-photo.on')));
      DSB.lightbox.open(BOX.photos.map(function (p) {
        return { src: p.src, caption: p.cover ? p.nome : p.nome + ' · exemplo do acervo' };
      }), mi.classList.contains('fanned') ? 0 : cur);
    });
  }

  // Inclinação 3D seguindo o mouse
  if (mi && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    mi.addEventListener('pointermove', function (e) {
      var r = mi.getBoundingClientRect();
      mi.style.setProperty('--rx', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg');
      mi.style.setProperty('--ry', (-((e.clientY - r.top) / r.height - .5) * 8).toFixed(2) + 'deg');
    });
    mi.addEventListener('pointerleave', function () {
      mi.style.setProperty('--rx', '0deg');
      mi.style.setProperty('--ry', '0deg');
    });
  }

  // ---- QUANTIDADE ----
  document.querySelectorAll('[data-q]').forEach(function (b) {
    b.addEventListener('click', function () {
      var nq = Math.min(20, Math.max(1, state.qty + +b.getAttribute('data-q')));
      if (nq === state.qty) return;
      state.qty = nq;
      var q = $('qN');
      q.textContent = nq;
      swap(q, 'bump');
      updateTotals();
    });
  });

  // ---- TOTAIS (com contagem animada) ----
  var tweenId = {};
  function tween(el, from, to, key) {
    var id = tweenId[key] = (tweenId[key] || 0) + 1;
    function finish() { if (tweenId[key] === id) { el.textContent = fmt(to); shown[key] = to; } }
    if (reduceMotion || from === to) { finish(); return; }
    var start = null, dur = 500;
    swap(el, 'tick');
    function step(ts) {
      if (tweenId[key] !== id) return;
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var v = from + (to - from) * (1 - Math.pow(1 - p, 3));
      el.textContent = fmt(v);
      shown[key] = v;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    // garante o valor final mesmo se o rAF estiver pausado (aba em segundo plano)
    setTimeout(finish, dur + 80);
  }

  function currentTotal() {
    var p = PRICES[Math.max(state.kit, 0)];
    return { t: p.t * state.qty, o: p.o * state.qty };
  }

  function updateTotals() {
    var tot = currentTotal();
    tween($('tOld'),  shown.old,  tot.o, 'old');
    tween($('tMain'), shown.main, tot.t, 'main');
    tween($('tPix'),  shown.pix,  tot.t * (1 - PIX_OFF), 'pix');
    $('stickyTotal').textContent = fmt(tot.t);

    var txt = $('shipTxt');
    var bar = $('shipBar');
    var missing = FREE_SHIPPING - tot.t;
    bar.style.width = Math.min(100, tot.t / FREE_SHIPPING * 100).toFixed(1) + '%';
    bar.classList.toggle('full', missing <= 0);
    txt.classList.toggle('ok', missing <= 0);
    txt.innerHTML = missing > 0
      ? 'Faltam <b>' + fmt(missing) + '</b> para frete grátis'
      : '🎉 Você ganhou frete grátis!';
  }

  // ---- VALIDAÇÃO ----
  function validate() {
    if (state.kit < 0) {
      swap(kitsEl, 'shake');
      kitsEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      toast('Escolha um kit para continuar', { type: 'error' });
      return false;
    }
    var miss = firstMissing();
    if (miss) {
      var kc = kitEls[state.kit];
      if (state.n > 1) {
        switchTab(miss);
        var tab = kc.querySelector('.sz-tab[data-n="' + miss + '"]');
        if (tab) swap(tab, 'missing');
      } else {
        swap(kc.querySelector('.sz-btns'), 'shake');
      }
      kc.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      toast(state.n > 1 ? 'Falta escolher o tamanho: ' + labelFor(miss) : 'Escolha o tamanho da camisa', { type: 'error' });
      return false;
    }
    return true;
  }

  // ---- COMPRA ----
  var btnCart = $('btnCart');
  var cartHtml = btnCart.innerHTML;

  function cartItem() {
    var sizes = [];
    for (var i = 1; i <= state.n; i++) sizes.push((state.n > 1 ? labelFor(i) + ': ' : 'Tamanho ') + state.sizes[i]);
    var price = PRICES[state.kit];
    return {
      name: BOX.name || document.title,
      url: location.pathname.split('/').pop() || 'index.html',
      image: BOX.photos ? BOX.photos[0].thumb : null, // capa da box
      emoji: BOX.emoji,
      kit: CASAL ? kitLabel(state.n).toLowerCase().replace(/^./, function (c) { return c.toUpperCase(); }) + ' · ' + state.n + ' camisas'
                 : state.n + (state.n > 1 ? ' camisas' : ' camisa'),
      sizes: sizes.join(' · '),
      unit: price.t,
      old: price.o,
      qty: state.qty,
      variantId: BOX.variants ? BOX.variants[state.kit] : null
    };
  }

  btnCart.addEventListener('click', function () {
    if (!validate()) return;
    btnCart.classList.add('is-loading');
    setTimeout(function () {
      btnCart.classList.remove('is-loading');
      btnCart.classList.add('ok');
      btnCart.innerHTML = '✓ Adicionado ao carrinho!';
      if (DSB.cart) DSB.cart.add(cartItem(), btnCart);
      setTimeout(function () {
        btnCart.classList.remove('ok');
        btnCart.innerHTML = cartHtml;
      }, 2200);
    }, 450);
  });

  // ---- BARRA FIXA (mobile) ----
  var sticky = $('stickyBuy');
  var buyEl  = $('buy');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      var passed = !e.isIntersecting && e.boundingClientRect.top < 0;
      sticky.classList.toggle('is-visible', passed);
      sticky.setAttribute('aria-hidden', !passed);
    }).observe(buyEl);
  }
  $('stickyBtn').addEventListener('click', function () {
    btnCart.click();
  });

  // ---- GUIA DE TAMANHOS (modal) ----
  var modal = $('sizeModal');
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    setTimeout(function () { $('cH').focus(); }, 60);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { if (!modal.classList.contains('is-open')) modal.hidden = true; }, 260);
    if (location.hash === '#tamanhos') history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-open-sizes]').forEach(function (b) { b.addEventListener('click', openModal); });
  document.querySelectorAll('[data-close-sizes]').forEach(function (b) { b.addEventListener('click', closeModal); });
  modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
  function checkHash() { if (location.hash === '#tamanhos' && modal.hidden) openModal(); }
  window.addEventListener('hashchange', checkHash);
  checkHash();

  // Primeira linha da tabela em que altura e peso cabem no limite superior
  function maxOf(range) { return parseFloat(String(range).split(/[–-]/).pop()); }
  function recommend(h, w, model) {
    var rows = TABLES[model] || TABLES.masculino;
    for (var i = 0; i < rows.length; i++) {
      if (h <= maxOf(rows[i].alt) && w <= maxOf(rows[i].peso)) return rows[i].sz;
    }
    return rows[rows.length - 1].sz;
  }
  function calcModel() { return state.kit >= 0 ? modelFor(state.tab) : currentModel; }

  $('calcForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var h = parseFloat($('cH').value);
    var w = parseFloat($('cW').value);
    var r = $('calcR');
    r.className = 'calc-result';
    void r.offsetWidth;
    if (!h || !w) {
      r.classList.add('show', 'err');
      r.textContent = 'Informe altura e peso para continuar.';
      return;
    }
    var model = calcModel();
    var sz = recommend(h, w, model);
    var canUse = state.kit >= 0 && sizesFor(state.tab).indexOf(sz) > -1;
    r.classList.add('show', 'ok');
    r.innerHTML = 'Tamanho recomendado<b>' + sz + '</b>tabela ' + model + ', pela sua altura e peso'
      + (canUse ? '<br><button type="button" class="use-size">Usar ' + sz + (state.n > 1 ? ' em ' + labelFor(state.tab) : '') + '</button>' : '');
    selectModel(model);
    var use = r.querySelector('.use-size');
    if (use) use.addEventListener('click', function () { closeModal(); pickSize(sz); });
    highlightRow(sz);
  });

  var tableOpen = false;
  var currentModel = BOX.model || 'masculino';
  function selectModel(m) {
    currentModel = m;
    document.querySelectorAll('.mt').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-model') === m); });
    if (tableOpen) renderTable(m);
  }
  selectModel(currentModel);
  $('toggleTable').addEventListener('click', function () {
    tableOpen = !tableOpen;
    this.setAttribute('aria-expanded', tableOpen);
    this.firstElementChild.textContent = tableOpen ? 'Ocultar tabela' : 'Ver tabela completa';
    $('tableSection').classList.toggle('open', tableOpen);
    if (tableOpen) renderTable(currentModel);
  });
  document.querySelectorAll('.mt').forEach(function (b) {
    b.addEventListener('click', function () {
      selectModel(b.getAttribute('data-model'));
      renderTable(currentModel);
    });
  });

  function renderTable(m) {
    var d = TABLES[m] || [];
    var h = '<table class="sz-table"><thead><tr>'
      + '<th>Tam.</th><th>Altura (cm)</th><th>Peso (kg)</th><th>Busto (cm)</th><th>Comp. (cm)</th>'
      + '</tr></thead><tbody>';
    d.forEach(function (row, i) {
      h += '<tr data-sz="' + row.sz + '" style="--i:' + i + '"><td>' + row.sz + '</td><td>' + row.alt + '</td><td>'
        + row.peso + '</td><td>' + row.busto + '</td><td>' + row.comp + '</td></tr>';
    });
    $('tableWrap').innerHTML = h + '</tbody></table>';
    if (lastRecommended) highlightRow(lastRecommended);
  }
  var lastRecommended = '';
  function highlightRow(sz) {
    lastRecommended = sz;
    document.querySelectorAll('.sz-table tr').forEach(function (tr) {
      tr.classList.toggle('hl', tr.getAttribute('data-sz') === sz);
    });
  }
})();
