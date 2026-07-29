/* ============================================
   QUIZ.JS — Da Sports Box
   Ticker, quiz interativo e scroll reveal
   ============================================ */

// ---- TICKER ----
var msgs = [
  "FRETE GRÁTIS ACIMA DE R$299",
  "KIT TREINO NA LOJA",
  "ESTOQUE NO BRASIL",
  "ENTREGA EM TODO BRASIL",
  "2X SEM JUROS",
  "TROCA DE TAMANHO GARANTIDA"
];

(function initTicker() {
  var t = document.getElementById('tick');
  if (!t) return;
  var full = (msgs.concat(msgs)).map(function(m) {
    return '<span>' + m + '</span>';
  }).join('');
  t.innerHTML = full + full;
})();

// ---- QUIZ ----
var step = 2;

var questions = [
  'Qual é a sua vibe?',
  'Algum clube que não pode vir?',
  'Clássico ou diferente?',
  'Qual é o seu tamanho?'
];

var optSets = [
  [
    { e: '🏆', n: 'Retrô lendária',    d: 'Zidane, Ronaldo, Nedved' },
    { e: '⚡',  n: 'Atual dos clubões', d: 'Temporada recente' },
    { e: '🌍', n: 'Seleções do mundo', d: 'Japão, Alemanha, Jamaica' },
    { e: '🇧🇷', n: 'Brasil 2026',       d: 'A amarelinha da Copa' }
  ],
  [
    { e: '🚫', n: 'Tenho restrições',  d: 'Vou listar na próxima tela' },
    { e: '✅', n: 'Sem restrição',     d: 'Confio na curadoria' },
    { e: '🔄', n: 'Apenas um clube',   d: 'Vou especificar' },
    { e: '❓', n: 'Sem preferência',   d: 'Me surpreende' }
  ],
  [
    { e: '🎽', n: 'Mais clássico',   d: 'Cores e modelos tradicionais' },
    { e: '🔥', n: 'Mais diferente',  d: 'Edições fora do padrão' },
    { e: '⚖️', n: 'Tanto faz',       d: 'O mistério decide' },
    { e: '🌟', n: 'Me surpreende',   d: 'Confiança total' }
  ],
  [
    { e: '📏', n: 'P / M',             d: 'Até 70kg' },
    { e: '👕', n: 'G / GG',            d: '70–90kg' },
    { e: '💪', n: '2GG+',              d: 'Acima de 90kg' },
    { e: '🔢', n: 'Usar calculadora',  d: 'Calcular pelo peso/altura' }
  ]
];

function renderOpts(idx) {
  var c = document.getElementById('qOpts');
  if (!c) return;
  c.innerHTML = optSets[idx].map(function(o) {
    return '<div class="q-opt" onclick="selectOpt(this)">'
      + '<div class="q-sel-check">✓</div>'
      + '<span class="q-emoji">' + o.e + '</span>'
      + '<div class="q-oname">' + o.n + '</div>'
      + '<div class="q-odesc">' + o.d + '</div>'
      + '</div>';
  }).join('');
}

function selectOpt(el) {
  document.querySelectorAll('.q-opt').forEach(function(o) { o.classList.remove('sel'); });
  el.classList.add('sel');
}

function nextStep() {
  if (step < 4) {
    step++;
    document.getElementById('qQuestion').textContent = questions[step - 2];
    renderOpts(step - 2);
    document.getElementById('qProg').style.width = ((step - 1) / 4 * 100) + '%';

    for (var i = 1; i <= 4; i++) {
      var s = document.getElementById('step' + i);
      s.classList.remove('active', 'done');
      if (i < step)      { s.classList.add('done');   s.textContent = '✓'; }
      else if (i === step){ s.classList.add('active'); s.textContent = i; }
      else                { s.textContent = i; }
      if (i < 4) {
        var l = document.getElementById('line' + i);
        if (l) l.classList.toggle('done', i < step);
      }
    }

    if (step === 4) {
      var btn = document.querySelector('.q-footer .btn-main');
      btn.textContent = 'Ver minha box →';
      btn.onclick = function() { window.location.href = 'box-classica.html'; };
    }
  }
}

// Render inicial
renderOpts(0);

// ---- SCROLL REVEAL ----
var obs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: .15 });

document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
