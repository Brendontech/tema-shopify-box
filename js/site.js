/* ============================================
   SITE.JS — Da Sports Box
   Compartilhado por todas as páginas:
   ticker, header, menu, animações, carrinho,
   toasts e busca AJAX
   ============================================ */

(function () {
  'use strict';

  var DSB = window.DSB = window.DSB || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function fmt(v) {
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  DSB.fmt = fmt;
  DSB.escapeHtml = escapeHtml;

  // ---------- TICKER ----------
  var TICKER_MSGS = [
    'FRETE GRÁTIS ACIMA DE R$299',
    'KIT TREINO NA LOJA',
    'ESTOQUE NO BRASIL',
    'ENTREGA EM TODO BRASIL',
    '2X SEM JUROS',
    'TROCA DE TAMANHO GARANTIDA'
  ];
  var tick = $('#tick');
  if (tick) {
    var half = TICKER_MSGS.concat(TICKER_MSGS).map(function (m) { return '<span>' + m + '</span>'; }).join('');
    tick.innerHTML = half + half;
  }

  // ---------- HEADER: progresso, compactar e esconder ao rolar ----------
  var header = $('.site-header');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) {
      header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
      header.classList.toggle('is-scrolled', y > 24);
      var locked = document.body.classList.contains('drawer-open') || document.body.classList.contains('search-open');
      if (!locked && y > 320 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y <= 320) header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ---------- TRAVA DE ROLAGEM (sem "pulo" da barra de rolagem) ----------
  var lockCount = 0;
  DSB.lockScroll = function (on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    var root = document.documentElement;
    if (lockCount === 1 && on) {
      root.style.paddingRight = (window.innerWidth - root.clientWidth) + 'px';
      root.style.overflow = 'hidden';
    } else if (lockCount === 0) {
      root.style.overflow = '';
      root.style.paddingRight = '';
    }
  };

  // ---------- FOCO PRESO NA CAMADA ABERTA ----------
  // Tab / Shift+Tab circulam só dentro do painel/modal que está por cima.
  var focusStack = [];
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  DSB.trapFocus = function (el) { DSB.releaseFocus(el); focusStack.push(el); };
  DSB.releaseFocus = function (el) {
    var i = focusStack.indexOf(el);
    if (i > -1) focusStack.splice(i, 1);
  };
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !focusStack.length) return;
    var scope = focusStack[focusStack.length - 1];
    var list = $$(FOCUSABLE, scope).filter(function (x) { return x.offsetWidth || x.offsetHeight || x.getClientRects().length; });
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (!scope.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ---------- PAINÉIS LATERAIS (menu e carrinho) ----------
  var openDrawerEl = null;
  var drawerFocus = null;

  DSB.openDrawer = function (id) {
    var d = document.getElementById(id);
    if (!d || d === openDrawerEl) return;
    if (openDrawerEl) DSB.closeDrawer(true);
    drawerFocus = document.activeElement;
    d.hidden = false;
    openDrawerEl = d;
    document.body.classList.add('drawer-open');
    DSB.lockScroll(true);
    DSB.trapFocus(d);
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-open'); }); });
    setTimeout(function () {
      var f = d.querySelector('.drawer-x');
      if (f) f.focus({ preventScroll: true });
    }, 350);
    d.dispatchEvent(new CustomEvent('drawer:open'));
  };

  DSB.closeDrawer = function (instant) {
    var d = openDrawerEl;
    if (!d) return;
    openDrawerEl = null;
    d.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    DSB.lockScroll(false);
    DSB.releaseFocus(d);
    setTimeout(function () { if (!d.classList.contains('is-open')) d.hidden = true; }, instant ? 0 : 450);
    if (!instant && drawerFocus && drawerFocus.focus) drawerFocus.focus({ preventScroll: true });
  };

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-drawer-open]');
    if (opener) { e.preventDefault(); DSB.openDrawer(opener.getAttribute('data-drawer-open')); return; }
    if (e.target.closest('[data-drawer-close]')) { DSB.closeDrawer(); return; }
    // links dentro do menu fecham o painel
    if (openDrawerEl && openDrawerEl.id === 'menuDrawer' && e.target.closest('#menuDrawer a')) DSB.closeDrawer(true);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openDrawerEl && !document.body.classList.contains('search-open')) DSB.closeDrawer();
  });

  // ---------- LINK ATIVO NO MENU (por seção visível) ----------
  var navLinks = $$('.nav-links a[href*="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').split('#')[1];
      var sec = id && document.getElementById(id);
      if (sec) byId[id] = a;
    });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          navLinks.forEach(function (x) { x.classList.remove('is-active'); });
          a.classList.add('is-active');
        } else {
          a.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { secObs.observe(document.getElementById(id)); });
  }

  // ---------- SPLIT DE PALAVRAS (títulos animados) ----------
  function splitWords(root) {
    var count = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span');
            w.className = 'split-word';
            w.innerHTML = '<span style="--w:' + (count++) + '">' + escapeHtml(p) + '</span>';
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    })(root);
  }
  $$('[data-split]').forEach(splitWords);

  // ---------- SCROLL REVEAL (com stagger) ----------
  $$('[data-stagger]').forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (el, i) {
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', group.getAttribute('data-stagger') || 'up');
      el.style.setProperty('--d', i);
    });
  });

  var revealEls = $$('[data-reveal], [data-split]:not(.split-now), [data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        if (e.target.hasAttribute('data-count')) countUp(e.target);
        revealObs.unobserve(e.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
      if (el.hasAttribute('data-count')) countUp(el, true);
    });
  }
  DSB.observeReveal = function (el) {
    if (typeof revealObs !== 'undefined' && revealObs) revealObs.observe(el);
    else el.classList.add('is-visible');
  };

  // ---------- CONTADORES ----------
  function countUp(el, instant) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var dur = 1600;
    function render(v) {
      el.textContent = pre + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    }
    if (instant) { render(target); return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      render(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { render(target); }, dur + 80);
  }

  // ---------- SPOTLIGHT NOS CARDS ----------
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.spotlight');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // ---------- RIPPLE NOS BOTÕES ----------
  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest && e.target.closest('.btn');
    if (!btn || reduceMotion) return;
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(rip);
    setTimeout(function () { rip.remove(); }, 650);
  });

  // ---------- VOLTAR AO TOPO / ANO ----------
  $$('[data-to-top]').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---------- TOASTS ----------
  var toastBox;
  DSB.toast = function (msg, opts) {
    opts = opts || {};
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'toasts';
      toastBox.setAttribute('role', 'status');
      toastBox.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastBox);
    }
    var t = document.createElement('div');
    t.className = 'toast' + (opts.type === 'error' ? ' error' : '');
    t.innerHTML = '<span class="toast-icon">' + (opts.type === 'error' ? '!' : '✓') + '</span>'
      + '<span>' + escapeHtml(msg) + '</span>'
      + (opts.action ? '<a href="' + escapeHtml(opts.action.href) + '">' + escapeHtml(opts.action.label) + '</a>' : '');
    toastBox.appendChild(t);
    setTimeout(function () {
      t.classList.add('is-leaving');
      setTimeout(function () { t.remove(); }, 320);
    }, opts.duration || 3200);
  };

  // ---------- BUSCA AJAX ----------
  // Em produção na Shopify usa o Predictive Search (/search/suggest.json).
  // Fora dela (preview/Vercel), busca no índice estático data/busca.json.
  var search = $('#search');
  if (!search) return;

  var input    = $('#searchInput', search);
  var body     = $('.search-body', search);
  var SEARCH_URL = 'data/busca.json';
  var indexPromise = null;
  var controller = null;
  var debounceId = null;
  var results = [];
  var active = -1;
  var lastFocus = null;
  var popular = [];

  function openSearch(prefill) {
    var wasOpen = search.classList.contains('is-open');
    if (!wasOpen) lastFocus = document.activeElement;
    if (DSB.closeDrawer) DSB.closeDrawer(true);
    // quem abriu a busca pelo menu volta para o botão do menu
    if (lastFocus && !document.contains(lastFocus)) lastFocus = null;
    if (lastFocus && lastFocus.closest && lastFocus.closest('.drawer')) lastFocus = $('.menu-toggle');
    document.body.classList.add('search-open');
    if (!wasOpen) { DSB.lockScroll(true); DSB.trapFocus(search); }
    search.hidden = false;
    requestAnimationFrame(function () { search.classList.add('is-open'); });
    if (typeof prefill === 'string') input.value = prefill;
    setTimeout(function () { input.focus(); input.select(); }, 30);
    if (input.value.trim()) runSearch(input.value); else renderIdle();
  }
  function closeSearch() {
    if (!search.classList.contains('is-open')) return;
    input.blur();
    search.classList.remove('is-open');
    document.body.classList.remove('search-open');
    DSB.lockScroll(false);
    DSB.releaseFocus(search);
    clearTimeout(debounceId);
    setTimeout(function () { if (!search.classList.contains('is-open')) search.hidden = true; }, 260);
    if (controller) controller.abort();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  DSB.openSearch = openSearch;

  $$('[data-search-open]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openSearch(); });
  });
  $$('[data-search-close]', search).forEach(function (b) { b.addEventListener('click', closeSearch); });
  search.addEventListener('mousedown', function (e) { if (e.target === search) closeSearch(); });

  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      search.classList.contains('is-open') ? closeSearch() : openSearch();
    } else if (e.key === '/' && !typing && !search.classList.contains('is-open')) {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape' && search.classList.contains('is-open')) {
      closeSearch();
    }
  });

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(SEARCH_URL, { headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          popular = data.populares || [];
          return (data.itens || []).map(function (it) {
            it._t = normalize(it.titulo);
            it._d = normalize(it.descricao);
            it._g = (it.tags || []).map(normalize);
            it._k = normalize(it.tipo);
            return it;
          });
        })
        .catch(function (err) { indexPromise = null; throw err; });
    }
    return indexPromise;
  }

  function localSearch(q) {
    var terms = normalize(q).split(/\s+/).filter(Boolean);
    return loadIndex().then(function (items) {
      return items.map(function (it) {
        var score = 0;
        for (var i = 0; i < terms.length; i++) {
          var t = terms[i], s = 0;
          if (it._t.indexOf(t) === 0) s += 10;
          else if (it._t.indexOf(t) > -1) s += 7;
          it._g.forEach(function (g) {
            if (g === t) s += 6;
            else if (g.indexOf(t) === 0) s += 4;
            else if (g.indexOf(t) > -1) s += 2;
          });
          if (it._d.indexOf(t) > -1) s += 2;
          if (it._k.indexOf(t) === 0) s += 1;
          if (!s) return null;           // todo termo precisa bater
          score += s;
        }
        return { item: it, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 8).map(function (r) {
        var it = r.item;
        return { tipo: it.tipo, titulo: it.titulo, url: it.url, descricao: it.descricao, emoji: it.emoji, imagem: it.imagem, preco: it.preco, precoAntigo: it.precoAntigo };
      });
    });
  }

  function shopifySearch(q, signal) {
    var root = (window.Shopify.routes && window.Shopify.routes.root) || '/';
    var url = root + 'search/suggest.json?q=' + encodeURIComponent(q)
      + '&resources[type]=product,page&resources[limit]=8&resources[options][unavailable_products]=last';
    return fetch(url, { signal: signal, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        var res = (d.resources && d.resources.results) || {};
        var products = (res.products || []).map(function (p) {
          return {
            tipo: 'Box', titulo: p.title, url: p.url, descricao: p.body ? p.body.replace(/<[^>]+>/g, '').slice(0, 90) : '',
            imagem: p.image, preco: parseFloat(p.price), precoAntigo: parseFloat(p.compare_at_price_max) || null
          };
        });
        var pages = (res.pages || []).map(function (p) {
          return { tipo: 'Página', titulo: p.title, url: p.url, emoji: '📄', descricao: '' };
        });
        return products.concat(pages);
      });
  }

  function runSearch(q) {
    q = q.trim();
    if (controller) controller.abort();
    if (!q) { search.classList.remove('is-loading'); renderIdle(); return; }

    controller = window.AbortController ? new AbortController() : null;
    var signal = controller && controller.signal;
    search.classList.add('is-loading');
    if (!results.length) renderSkeleton();

    var req = window.Shopify ? shopifySearch(q, signal) : localSearch(q);
    req.then(function (list) {
      if (signal && signal.aborted) return;
      search.classList.remove('is-loading');
      renderResults(list, q);
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      search.classList.remove('is-loading');
      results = [];
      body.innerHTML = '<div class="search-empty"><b>⚠️</b>Não foi possível buscar agora. Tente novamente.</div>';
    });
  }

  input.addEventListener('input', function () {
    clearTimeout(debounceId);
    var q = input.value;
    debounceId = setTimeout(function () { runSearch(q); }, 180);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!results.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      paintActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var pick = results[active > -1 ? active : 0];
      if (pick) go(pick.url);
    }
  });

  function paintActive() {
    $$('.search-item', body).forEach(function (el, i) {
      el.classList.toggle('is-active', i === active);
      if (i === active) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function samePath(a, b) {
    function clean(p) { return p.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/+$/, '') || '/'; }
    return clean(a) === clean(b);
  }
  function go(url) {
    var u = new URL(url, location.href);
    if (samePath(u.pathname, location.pathname) && u.hash) {
      closeSearch();
      history.pushState(null, '', u.hash);
      var target = document.getElementById(u.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      return;
    }
    location.href = u.href;
  }

  function highlight(title, q) {
    var norm = normalize(title);
    var marks = [];
    normalize(q).split(/\s+/).filter(Boolean).forEach(function (t) {
      var i = norm.indexOf(t);
      if (i > -1) marks.push([i, i + t.length]);
    });
    if (!marks.length || norm.length !== title.length) return escapeHtml(title);
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', pos = 0;
    marks.forEach(function (m) {
      if (m[0] < pos) return;
      out += escapeHtml(title.slice(pos, m[0])) + '<mark>' + escapeHtml(title.slice(m[0], m[1])) + '</mark>';
      pos = m[1];
    });
    return out + escapeHtml(title.slice(pos));
  }

  function itemHtml(r, q, i) {
    var thumb = r.imagem
      ? '<img src="' + escapeHtml(r.imagem) + '" alt="" loading="lazy">'
      : escapeHtml(r.emoji || '👕');
    var price = r.preco
      ? '<div class="search-price">' + (r.precoAntigo ? '<s>' + fmt(r.precoAntigo) + '</s>' : '') + fmt(r.preco) + '</div>'
      : '<div class="search-type">' + escapeHtml(r.tipo) + '</div>';
    return '<li><a class="search-item" href="' + escapeHtml(r.url) + '" data-i="' + i + '" style="--i:' + i + '">'
      + '<span class="search-thumb">' + thumb + '</span>'
      + '<span class="search-meta"><div class="search-title">' + highlight(r.titulo, q) + '</div>'
      + (r.descricao ? '<div class="search-desc">' + escapeHtml(r.descricao) + '</div>' : '') + '</span>'
      + price + '</a></li>';
  }

  function bindItems() {
    $$('.search-item', body).forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); go(a.getAttribute('href')); });
      a.addEventListener('mouseenter', function () { active = +a.getAttribute('data-i'); paintActive(); });
    });
  }

  function renderResults(list, q) {
    results = list;
    active = list.length ? 0 : -1;
    if (!list.length) {
      body.innerHTML = '<div class="search-empty"><b>🤷‍♂️</b>Nada encontrado para “' + escapeHtml(q) + '”.<br>Tente “retrô”, “seleções” ou “Brasil”.</div>';
      return;
    }
    body.innerHTML = '<div class="search-label">' + list.length + ' resultado' + (list.length > 1 ? 's' : '') + '</div>'
      + '<ul class="search-results">' + list.map(function (r, i) { return itemHtml(r, q, i); }).join('') + '</ul>';
    bindItems();
    paintActive();
  }

  function renderSkeleton() {
    body.innerHTML = [0, 1, 2].map(function () { return '<div class="search-skel"><i></i><b></b></div>'; }).join('');
  }

  function renderIdle() {
    results = [];
    active = -1;
    loadIndex().then(function (items) {
      if (input.value.trim()) return;
      var boxes = items.filter(function (it) { return it.tipo === 'Box'; }).slice(0, 4);
      results = boxes;
      body.innerHTML = '<div class="search-label">Buscas populares</div>'
        + '<div class="search-chips">' + popular.map(function (p) {
          return '<button type="button" class="search-chip">' + escapeHtml(p) + '</button>';
        }).join('') + '</div>'
        + '<div class="search-label">Boxes em destaque</div>'
        + '<ul class="search-results">' + boxes.map(function (r, i) { return itemHtml(r, '', i); }).join('') + '</ul>';
      $$('.search-chip', body).forEach(function (c) {
        c.addEventListener('click', function () { input.value = c.textContent; input.focus(); runSearch(input.value); });
      });
      bindItems();
    }).catch(function () {
      body.innerHTML = '<div class="search-empty"><b>🔎</b>Digite para buscar boxes, clubes e seleções.</div>';
    });
  }

  // Pré-carrega o índice quando o usuário demonstra intenção
  $$('[data-search-open]').forEach(function (b) {
    b.addEventListener('pointerenter', function () { if (!window.Shopify) loadIndex().catch(function () {}); }, { once: true });
  });
})();
