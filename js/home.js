/* ============================================
   HOME.JS — Da Sports Box
   Quiz interativo, parallax do hero e FAQ
   ============================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- QUIZ ----------
  var QUESTIONS = [
    {
      label: 'Vibe', q: 'Qual é a sua vibe?',
      opts: [
        { e: '🏆', n: 'Retrô lendária',    d: 'Zidane, Ronaldo, Nedved', box: 'retro' },
        { e: '⚡', n: 'Atual dos clubões', d: 'Temporada recente',        box: 'atual' },
        { e: '🌍', n: 'Seleções do mundo', d: 'Japão, Alemanha, Jamaica', box: 'selecoes' },
        { e: '🇧🇷', n: 'Seleção Brasileira', d: 'Amarelinha e azul',       box: 'brasil' }
      ]
    },
    {
      label: 'Pra quem', q: 'Pra quem é a box?',
      opts: [
        { e: '🙋‍♂️', n: 'Pra mim',        d: 'Modelagem masculina' },
        { e: '🙋‍♀️', n: 'Pra ela',        d: 'Modelagem feminina', box: 'feminino' },
        { e: '🧒', n: 'Pra criança',      d: 'Tamanhos infantis',   box: 'infantil' },
        { e: '💑', n: 'Pro casal',        d: 'Uma dele + uma dela', box: 'casal' }
      ]
    },
    {
      label: 'Estilo', q: 'Clássico ou diferente?',
      opts: [
        { e: '🎽', n: 'Mais clássico',  d: 'Cores e modelos tradicionais' },
        { e: '🔥', n: 'Mais diferente', d: 'Edições fora do padrão' },
        { e: '⚖️', n: 'Tanto faz',      d: 'O mistério decide' },
        { e: '🌟', n: 'Me surpreende',  d: 'Confiança total' }
      ]
    },
    {
      label: 'Tamanho', q: 'Qual é o seu tamanho?',
      opts: [
        { e: '📏', n: 'P / M',            d: 'Até 70kg' },
        { e: '👕', n: 'G / GG',           d: '70–90kg' },
        { e: '💪', n: '2GG+',             d: 'Acima de 90kg' },
        { e: '🔢', n: 'Usar calculadora', d: 'Calcular pelo peso/altura', calc: true }
      ]
    }
  ];

  var BOXES = {
    retro:    { name: 'Box Retrô',    e: '🏆', url: 'box-retro.html',    price: 'R$ 174', desc: 'Camisas históricas de 1970 a 2020. Os mantos que escreveram a história.' },
    atual:    { name: 'Box Atual',    e: '⚡', url: 'box-atual.html',    price: 'R$ 119', desc: 'Temporada recente dos clubões e modelos fora do padrão.' },
    selecoes: { name: 'Box Seleções', e: '🌍', url: 'box-selecoes.html', price: 'R$ 149', desc: 'Do Japão à Jamaica — seleções que ninguém tem.' },
    brasil:   { name: 'Box Brasil',   e: '🇧🇷', url: 'box-brasil.html',   price: 'R$ 149', desc: 'A amarelinha ou a azul — das clássicas às mais recentes.' },
    feminino: { name: 'Box Feminino', e: '👚', url: 'box-feminino.html', price: 'R$ 119', desc: 'Camisas com modelagem feminina, de clubes e seleções.' },
    infantil: { name: 'Box Infantil', e: '🧒', url: 'box-infantil.html', price: 'R$ 99',  desc: 'Kits e conjuntos infantis pra criar o próximo craque.' },
    casal:    { name: 'Box Casal',    e: '💑', url: 'box-casal.html',    price: 'R$ 219', desc: 'Uma camisa masculina + uma feminina. Mistério em dobro.' }
  };

  var stage   = document.getElementById('qStage');
  if (!stage) return;
  var card    = stage.closest('.q-card');
  var optsEl  = document.getElementById('qOpts');
  var qEl     = document.getElementById('qQuestion');
  var countEl = document.getElementById('qCount');
  var nextBtn = document.getElementById('qNext');
  var backBtn = document.getElementById('qBack');
  var progEl  = document.getElementById('qProg');
  var summary = document.getElementById('qSummary');
  var footer  = card.querySelector('.q-footer');
  var steps   = card.querySelectorAll('.q-step');
  var lines   = card.querySelectorAll('.q-line');

  var current = 0;
  var answers = [];
  var autoTimer = null;
  var stageHtml = stage.innerHTML;

  function renderSummary() {
    summary.innerHTML = QUESTIONS.map(function (q, i) {
      var a = answers[i] != null ? q.opts[answers[i]] : null;
      var cls = a ? 'filled' : (i === current ? 'current' : '');
      return '<li class="' + cls + '"><span class="n">' + (a ? '✓' : i + 1) + '</span>' + q.label
        + '<b>' + (a ? a.e + ' ' + a.n : '') + '</b></li>';
    }).join('');
  }

  function renderSteps(finished) {
    steps.forEach(function (s, i) {
      s.classList.remove('active', 'done');
      if (finished || i < current) { s.classList.add('done'); s.textContent = '✓'; }
      else if (i === current)     { s.classList.add('active'); s.textContent = i + 1; }
      else                        { s.textContent = i + 1; }
    });
    lines.forEach(function (l, i) { l.classList.toggle('done', finished || i < current); });
    var answered = answers.filter(function (a) { return a != null; }).length;
    progEl.style.width = (finished ? 100 : answered / QUESTIONS.length * 100) + '%';
  }

  function renderQuestion() {
    var q = QUESTIONS[current];
    countEl.textContent = 'Pergunta ' + (current + 1) + ' de ' + QUESTIONS.length;
    qEl.textContent = q.q;
    optsEl.innerHTML = q.opts.map(function (o, i) {
      var sel = answers[current] === i;
      return '<button type="button" class="q-opt' + (sel ? ' sel' : '') + '" role="radio" aria-checked="' + sel + '" data-i="' + i + '" style="--i:' + i + '">'
        + '<span class="q-sel-check">✓</span>'
        + '<span class="q-emoji">' + o.e + '</span>'
        + '<div class="q-oname">' + o.n + '</div>'
        + '<div class="q-odesc">' + o.d + '</div>'
        + '</button>';
    }).join('');
    nextBtn.disabled = answers[current] == null;
    nextBtn.innerHTML = (current === QUESTIONS.length - 1 ? 'Ver minha box' : 'Próximo') + ' <span class="arr">→</span>';
    backBtn.disabled = current === 0;
    renderSteps(false);
    renderSummary();
  }

  function transition(dir, fn) {
    if (reduceMotion) { fn(); return; }
    stage.classList.remove('in-left', 'in-right');
    stage.classList.add(dir > 0 ? 'out-left' : 'out-right');
    setTimeout(function () {
      stage.classList.remove('out-left', 'out-right');
      fn();
      stage.classList.add(dir > 0 ? 'in-right' : 'in-left');
    }, 230);
  }

  function goTo(idx) {
    clearTimeout(autoTimer);
    var dir = idx > current ? 1 : -1;
    transition(dir, function () {
      current = idx;
      renderQuestion();
    });
  }

  function next() {
    if (answers[current] == null) return;
    if (current < QUESTIONS.length - 1) goTo(current + 1);
    else transition(1, showResult);
  }

  // Delegação no stage: continua funcionando quando o HTML é recriado
  stage.addEventListener('click', function (e) {
    var b = e.target.closest('.q-opt');
    if (!b) return;
    answers[current] = +b.getAttribute('data-i');
    optsEl.querySelectorAll('.q-opt').forEach(function (o) {
      var on = o === b;
      o.classList.toggle('sel', on);
      o.setAttribute('aria-checked', on);
    });
    nextBtn.disabled = false;
    renderSteps(false);
    renderSummary();
    clearTimeout(autoTimer);
    autoTimer = setTimeout(next, 450);
  });
  nextBtn.addEventListener('click', next);
  backBtn.addEventListener('click', function () { if (current > 0) goTo(current - 1); });

  function showResult() {
    // O perfil (pergunta 2) tem prioridade; senão vale a vibe (pergunta 1)
    var perfil = QUESTIONS[1].opts[answers[1]].box;
    var box = BOXES[perfil || QUESTIONS[0].opts[answers[0]].box];
    var wantsCalc = QUESTIONS[3].opts[answers[3]].calc;
    footer.hidden = true;
    renderSteps(true);
    current = QUESTIONS.length;
    renderSummary();
    stage.innerHTML = '<div class="q-result">'
      + '<span class="q-result-emoji">' + box.e + '</span>'
      + '<div class="q-result-kicker">Sua box ideal</div>'
      + '<div class="q-result-name">' + box.name + '</div>'
      + '<p class="q-result-desc">' + box.desc + '</p>'
      + '<p class="q-result-price">a partir de <b>' + box.price + '</b></p>'
      + '<div class="q-result-actions">'
      + '<a class="btn btn-main" href="' + box.url + (wantsCalc ? '#tamanhos' : '') + '">'
      + (wantsCalc ? 'Ver box e calcular tamanho' : 'Ver minha box') + ' <span class="arr">→</span></a>'
      + '</div>'
      + '<p style="margin-top:1rem"><button type="button" class="q-restart">Refazer o quiz</button></p>'
      + '</div>';
    stage.querySelector('.q-restart').addEventListener('click', restart);
    confetti(stage.querySelector('.q-result-emoji'));
  }

  function restart() {
    answers = [];
    footer.hidden = false;
    transition(-1, function () {
      stage.innerHTML = stageHtml;
      optsEl  = document.getElementById('qOpts');
      qEl     = document.getElementById('qQuestion');
      countEl = document.getElementById('qCount');
      current = 0;
      renderQuestion();
    });
  }

  function confetti(origin) {
    if (reduceMotion || !origin) return;
    var colors = ['#0c0c0c', '#3a3a3a', '#8a8a8a', '#c8c8c8', '#0c0c0c'];
    var r = origin.getBoundingClientRect();
    var host = card.getBoundingClientRect();
    card.style.position = 'relative';
    for (var i = 0; i < 36; i++) {
      var c = document.createElement('span');
      c.className = 'confetti';
      var ang = Math.random() * Math.PI * 2;
      var dist = 120 + Math.random() * 200;
      c.style.left = (r.left - host.left + r.width / 2) + 'px';
      c.style.top  = (r.top - host.top + r.height / 2) + 'px';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--x', Math.cos(ang) * dist + 'px');
      c.style.setProperty('--y', Math.sin(ang) * dist + 120 + 'px');
      c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      card.appendChild(c);
      setTimeout(c.remove.bind(c), 1500);
    }
  }

  renderQuestion();

  // ---------- CAIXA MISTERIOSA ABRINDO (toque = embaralhar) ----------
  var reveal = document.getElementById('heroFan');
  if (reveal) {
    var sparksEl = document.getElementById('rvSparks');
    var shirtImgs = Array.prototype.slice.call(reveal.querySelectorAll('.rv-shirt img'));
    var timers = [];
    var played = false;
    var busy = false;

    // Todas as fotos do acervo (grade "Camisas que podem vir")
    var pool = Array.prototype.slice.call(document.querySelectorAll('#shirtGrid img')).map(function (i) { return i.getAttribute('src'); });
    var current = shirtImgs.map(function (i) { return i.getAttribute('src'); });

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function nextSet() {
      var fresh = pool.filter(function (s) { return current.indexOf(s) < 0; });
      for (var i = fresh.length - 1; i > 0; i--) {           // embaralha
        var k = Math.floor(Math.random() * (i + 1));
        var t = fresh[i]; fresh[i] = fresh[k]; fresh[k] = t;
      }
      return fresh.slice(0, shirtImgs.length);
    }
    function preload(list) { list.forEach(function (src) { var im = new Image(); im.src = src; }); }

    function burst() {
      sparksEl.innerHTML = '';
      var w = reveal.offsetWidth;
      for (var i = 0; i < 18; i++) {
        var s = document.createElement('span');
        s.className = 'rv-spark';
        var ang = -Math.PI * (.1 + Math.random() * .8);
        var dist = w * (.1 + Math.random() * .25);
        s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(0) + 'px');
        s.style.setProperty('--dy', (Math.sin(ang) * dist).toFixed(0) + 'px');
        s.style.setProperty('--s', (2 + Math.random() * 4).toFixed(1) + 'px');
        s.style.setProperty('--t', (.7 + Math.random() * .8).toFixed(2) + 's');
        sparksEl.appendChild(s);
      }
      for (var k = 0; k < 6; k++) {
        var st = document.createElement('span');
        st.className = 'rv-star';
        st.textContent = '✦';
        var a2 = -Math.PI * (.15 + Math.random() * .7);
        var d2 = w * (.08 + Math.random() * .2);
        st.style.left = (Math.cos(a2) * d2).toFixed(0) + 'px';
        st.style.top = (Math.sin(a2) * d2).toFixed(0) + 'px';
        st.style.setProperty('--s', (8 + Math.random() * 8).toFixed(0) + 'px');
        st.style.setProperty('--dl', (Math.random() * 2.6).toFixed(2) + 's');
        sparksEl.appendChild(st);
      }
    }

    // Partículas de luz subindo da caixa (criadas uma vez, animação infinita no CSS)
    var motes = document.getElementById('rvMotes');
    if (motes && !motes.children.length) {
      for (var m = 0; m < 16; m++) {
        var mo = document.createElement('span');
        mo.className = 'rv-mote';
        mo.style.setProperty('--s', (2 + Math.random() * 3).toFixed(1) + 'px');
        mo.style.setProperty('--x0', ((Math.random() - .5) * 8).toFixed(1) + 'cqw');
        mo.style.setProperty('--x1', ((Math.random() - .5) * 26).toFixed(1) + 'cqw');
        mo.style.setProperty('--t', (2.2 + Math.random() * 2).toFixed(2) + 's');
        mo.style.setProperty('--dl', (Math.random() * 3).toFixed(2) + 's');
        motes.appendChild(mo);
      }
    }

    function open() {
      reveal.classList.add('shake');
      later(function () {
        reveal.classList.remove('shake');
        reveal.classList.add('open');
        burst();
      }, 950);
      later(function () { reveal.classList.add('done'); busy = false; }, 2200);
    }

    function play() {
      if (busy) return;
      busy = true;
      played = true;
      timers.forEach(clearTimeout);
      timers = [];

      if (reduceMotion) {
        if (reveal.classList.contains('open')) swapShirts();
        reveal.classList.add('open', 'done');
        busy = false;
        return;
      }

      if (reveal.classList.contains('open')) {
        // Camisas voltam para a caixa, a tampa fecha, e abre de novo com outras
        var next = nextSet();
        preload(next);
        reveal.classList.remove('open', 'done');
        reveal.classList.add('closing');
        sparksEl.innerHTML = '';
        later(function () {
          reveal.classList.remove('closing');
          next.forEach(function (src, i) { shirtImgs[i].src = src; });
          current = next;
          open();
        }, 650);
      } else {
        open();
      }
    }

    function swapShirts() {
      var next = nextSet();
      next.forEach(function (src, i) { shirtImgs[i].src = src; });
      current = next;
    }

    document.getElementById('rvBox').addEventListener('click', play);

    // Abre sozinha quando aparece na tela (depois da animação do título)
    if ('IntersectionObserver' in window) {
      var ro = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !played) {
          played = true;
          setTimeout(function () { played = false; play(); }, 900);
          ro.disconnect();
        }
      }, { threshold: .2 });
      ro.observe(reveal);
    } else {
      play();
    }

    // Parallax leve com o mouse
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      var hero = document.querySelector('.hero');
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        reveal.style.transform = 'translate(' + (x * 16).toFixed(1) + 'px,' + (y * 8).toFixed(1) + 'px)';
      });
      hero.addEventListener('pointerleave', function () { reveal.style.transform = ''; });
    }
  }

  // ---------- CAMISAS: abas por categoria ----------
  var tabs = document.querySelectorAll('.shirt-tab');
  var ind = document.querySelector('.shirt-tab-ind');
  var cards = document.querySelectorAll('.shirt-card');
  function moveInd(tab) {
    if (!ind || !tab) return;
    ind.style.width = tab.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
  }
  function showCat(cat) {
    var i = 0;
    cards.forEach(function (c) {
      var on = c.getAttribute('data-cat') === cat;
      c.hidden = !on;
      c.classList.remove('in');
      if (on) {
        c.style.setProperty('--i', i++);
        void c.offsetWidth;
        c.classList.add('in');
      }
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
      moveInd(t);
      showCat(t.getAttribute('data-cat'));
    });
  });
  if (tabs.length) {
    showCat(tabs[0].getAttribute('data-cat'));
    requestAnimationFrame(function () { moveInd(document.querySelector('.shirt-tab.on')); });
    window.addEventListener('resize', function () { moveInd(document.querySelector('.shirt-tab.on')); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInd(document.querySelector('.shirt-tab.on')); });
  }

  // ---------- CAMISAS: abrir em tela cheia e deslizar ----------
  var grid = document.getElementById('shirtGrid');
  if (grid && window.DSB && DSB.lightbox) {
    grid.querySelectorAll('.shirt-card').forEach(function (c) {
      c.setAttribute('tabindex', '0');
      c.setAttribute('role', 'button');
    });
    function openShirt(card) {
      var visible = Array.prototype.slice.call(grid.querySelectorAll('.shirt-card:not([hidden])'));
      DSB.lightbox.open(visible.map(function (c) {
        var img = c.querySelector('img');
        return {
          src: img.getAttribute('src').replace(/-p\.webp$/, '.webp'),
          caption: c.querySelector('.shirt-name').textContent + ' · ' + c.querySelector('.shirt-det').textContent
        };
      }), visible.indexOf(card));
    }
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.shirt-card');
      if (card) openShirt(card);
    });
    grid.addEventListener('keydown', function (e) {
      var card = e.target.closest('.shirt-card');
      if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openShirt(card); }
    });
  }

  // ---------- FAQ COM ABRIR/FECHAR ANIMADO ----------
  document.querySelectorAll('.faq-item').forEach(function (d) {
    if (d.open) d.classList.add('is-open');
    d.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      if (d.classList.contains('is-open')) {
        d.classList.remove('is-open');
        setTimeout(function () { if (!d.classList.contains('is-open')) d.open = false; }, 450);
      } else {
        d.open = true;
        requestAnimationFrame(function () { d.classList.add('is-open'); });
      }
    });
  });
})();
