/* ============================================
   BOX-CLASSICA.JS — Da Sports Box
   Seleção de kit, tamanhos, carrinho e modal
   TODO: substituir SIZES e PRICES por dados
         reais da Shopify Storefront API
   ============================================ */

// ---- DADOS (virão da Shopify API em produção) ----
var SIZES  = ['P', 'M', 'G', 'GG', '2GG', '3GG', '4GG'];
var PRICES = [
  { t: 119,  o: 197.95  },   // 1 camisa
  { t: 348,  o: 593.85  },   // 3 camisas
  { t: 447,  o: 989.75  },   // 5 camisas
  { t: 476,  o: 1385.65 }    // 7 camisas
];

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
var state = {
  qty: 1, kitIdx: -1, kitQty: 0,
  kitPrice: 119, kitOld: 197.95,
  sizes: {}, activeTab: {}
};
var qty          = 1;
var tableVisible = false;

// ---- MODAL ----
function openModal() {
  document.getElementById('sizeModal').style.display = 'flex';
}
function closeModal(e) {
  if (!e || e.target === document.getElementById('sizeModal')) {
    document.getElementById('sizeModal').style.display = 'none';
  }
}
function calcSize() {
  var h = parseFloat(document.getElementById('cH').value);
  var w = parseFloat(document.getElementById('cW').value);
  var r = document.getElementById('calcR');
  if (!h || !w) {
    r.style.cssText = 'display:block;background:#fff3f3;border:1.5px solid #fca5a5;color:#dc2626;';
    r.textContent = 'Informe altura e peso para continuar.';
    return;
  }
  var sz = h <= 170 && w <= 70  ? 'P'
         : h <= 176 && w <= 80  ? 'M'
         : h <= 182 && w <= 92  ? 'G'
         : h <= 186 && w <= 100 ? 'GG'
         : h <= 190 && w <= 115 ? '2GG'
         : h <= 192 && w <= 128 ? '3GG' : '4GG';
  r.style.cssText = 'display:block;background:#f0fdf4;border:1.5px solid #86efac;color:#16a34a;';
  r.textContent = 'Tamanho recomendado: ' + sz + ' — baseado na sua altura e peso.';
}
function toggleTable() {
  tableVisible = !tableVisible;
  document.getElementById('tableSection').style.display = tableVisible ? 'block' : 'none';
  document.getElementById('tTxt').textContent = tableVisible ? 'Ocultar tabela' : 'Ver tabela completa';
  document.getElementById('tArr').textContent = tableVisible ? '▲' : '▼';
  if (tableVisible) renderTable('masculino');
}
function setModel(el, m) {
  document.querySelectorAll('.mt').forEach(function(x) { x.classList.remove('on'); });
  el.classList.add('on');
  renderTable(m);
}
function renderTable(m) {
  var d = TABLES[m] || [];
  var h = '<table class="sz-table"><thead><tr>'
    + '<th>Tam.</th><th>Altura (cm)</th><th>Peso (kg)</th><th>Busto (cm)</th><th>Comp. (cm)</th>'
    + '</tr></thead><tbody>';
  d.forEach(function(row) {
    h += '<tr><td>' + row.sz + '</td><td>' + row.alt + '</td><td>'
      + row.peso + '</td><td>' + row.busto + '</td><td>' + row.comp + '</td></tr>';
  });
  document.getElementById('tableWrap').innerHTML = h + '</tbody></table>';
}

// ---- SELEÇÃO DE KIT ----
function selKit(idx, n) {
  for (var i = 0; i < 4; i++) {
    document.getElementById('ks' + i).style.display = 'none';
    document.getElementById('k'  + i).classList.remove('sel');
  }
  document.getElementById('k'  + idx).classList.add('sel');
  document.getElementById('ks' + idx).style.display = 'block';

  state.kitIdx   = idx;
  state.kitQty   = n;
  state.kitPrice = PRICES[idx].t;
  state.kitOld   = PRICES[idx].o;
  state.sizes    = {};
  state.activeTab[idx] = 1;

  document.getElementById('miBig').innerHTML = Array(Math.min(n, 5)).fill('👕').join(' ');

  if (n === 1) {
    buildBtns('sb0', 0, 1);
  } else {
    buildTabs(idx, n);
    document.getElementById('sl' + idx).textContent = 'Tamanho · Camisa 1';
    buildBtns('sb' + idx, idx, 1);
  }
  updateTotals();
}

function buildTabs(idx, n) {
  var tc   = document.getElementById('st' + idx);
  var html = '';
  for (var i = 1; i <= n; i++) {
    html += '<div class="sz-tab' + (i === 1 ? ' on' : '') + '" id="tab_' + idx + '_' + i
      + '" onclick="switchTab(' + idx + ',' + i + ',' + n + ')">'
      + '<span class="sz-tab-label">Camisa ' + i + '</span>'
      + '<span class="sz-tab-val">Escolher</span></div>';
  }
  tc.innerHTML = html;
}

function switchTab(idx, t, n) {
  for (var i = 1; i <= n; i++) {
    var x = document.getElementById('tab_' + idx + '_' + i);
    if (x) x.classList.remove('on');
  }
  var el = document.getElementById('tab_' + idx + '_' + t);
  if (el) { el.classList.add('on'); el.classList.remove('done'); }
  state.activeTab[idx] = t;
  document.getElementById('sl' + idx).textContent = 'Tamanho · Camisa ' + t;
  buildBtns('sb' + idx, idx, t);
}

function buildBtns(cId, idx, shirtNum) {
  var c   = document.getElementById(cId);
  var cur = state.sizes[idx + '_' + shirtNum] || '';
  c.innerHTML = SIZES.map(function(s) {
    return '<button class="szb' + (cur === s ? ' on' : '') + '" onclick="pickSz('
      + idx + ',' + shirtNum + ',\'' + s + '\',this)">' + s + '</button>';
  }).join('');
}

function pickSz(idx, n, size, btn) {
  btn.parentNode.querySelectorAll('.szb').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  state.sizes[idx + '_' + n] = size;

  var tab = document.getElementById('tab_' + idx + '_' + n);
  if (tab) {
    tab.querySelector('.sz-tab-val').textContent = size;
    tab.classList.remove('on');
    tab.classList.add('done');
  }

  // Avança automaticamente para a próxima camisa sem tamanho
  var total = state.kitQty;
  for (var i = 1; i <= total; i++) {
    if (!state.sizes[idx + '_' + i]) { switchTab(idx, i, total); return; }
  }
}

// ---- QUANTIDADE ----
function chQ(d) {
  qty = Math.max(1, qty + d);
  document.getElementById('qN').textContent = qty;
  updateTotals();
}

// ---- TOTAIS ----
function fmt(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function updateTotals() {
  var t = state.kitPrice * qty;
  var o = state.kitOld   * qty;
  document.getElementById('tOld').textContent  = fmt(o);
  document.getElementById('tMain').textContent = fmt(t);
  document.getElementById('tPix').textContent  = fmt(t * 0.95);
}

// ---- COMPRA ----
function addCart() {
  var n = parseInt(document.getElementById('cN').textContent) || 0;
  document.getElementById('cN').textContent = n + qty;
  var b = document.querySelector('.bcart');
  b.textContent       = '✓ Adicionado!';
  b.style.background  = '#16a34a';
  setTimeout(function() {
    b.textContent      = 'Adicionar ao carrinho →';
    b.style.background = '#111';
  }, 2000);
}
function buyNow() {
  var b = document.querySelector('.bpix');
  b.textContent = 'Redirecionando...';
  // TODO: redirecionar para checkout Shopify com linha de pedido correta
  setTimeout(function() { b.innerHTML = '🟢 Comprar agora via Pix'; }, 2000);
}

// ---- GALERIA ----
function setTb(el, icon, lbl) {
  document.querySelectorAll('.tb').forEach(function(t) { t.classList.remove('on'); });
  el.classList.add('on');
  document.getElementById('miBig').innerHTML = icon;
  document.getElementById('miLbl').textContent = lbl;
}
