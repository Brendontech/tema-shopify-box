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
        { e: '🇧🇷', n: 'Brasil 2026',      d: 'A amarelinha da Copa',     box: 'brasil' }
      ]
    },
    {
      label: 'Restrições', q: 'Algum clube que não pode vir?',
      opts: [
        { e: '🚫', n: 'Tenho restrições', d: 'Informo no pedido' },
        { e: '✅', n: 'Sem restrição',    d: 'Confio na curadoria' },
        { e: '🔄', n: 'Apenas um clube',  d: 'Informo no pedido' },
        { e: '❓', n: 'Sem preferência',  d: 'Me surpreende' }
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
    brasil:   { name: 'Box Brasil',   e: '🇧🇷', url: 'box-brasil.html',   price: 'R$ 149', desc: 'A amarelinha ou a azul. Rumo à Copa 2026.' }
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
    var box = BOXES[QUESTIONS[0].opts[answers[0]].box];
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

  // ---------- PARALLAX DA CAIXA NO HERO ----------
  var mstage = document.getElementById('mboxStage');
  if (mstage && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      mstage.style.setProperty('--rx', (x * 16).toFixed(2) + 'deg');
      mstage.style.setProperty('--ry', (-y * 12).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', function () {
      mstage.style.setProperty('--rx', '0deg');
      mstage.style.setProperty('--ry', '0deg');
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
