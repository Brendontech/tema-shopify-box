// Gera, a partir de um único lugar:
//   - as páginas box-*.html (template único)
//   - a grade "Camisas que podem vir" do index.html (entre os marcadores CAMISAS)
//   - o índice da busca AJAX (data/busca.json)
// O header, a busca e o rodapé das páginas de box são copiados do index.html.
//   node scripts/gerar-boxes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMISAS, byId, foto } from './catalogo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');

// ---------- Kits ----------
const KITS = [
  { n: 1, pay: null },
  { n: 3, pay: 2 },
  { n: 5, pay: 3, hot: true },
  { n: 7, pay: 4 }
];
const KITS_CASAL = [
  { n: 2, label: '1 CASAL', sub: '1 masculina + 1 feminina' },
  { n: 4, label: '2 CASAIS', sub: '2 masculinas + 2 femininas', hot: true },
  { n: 6, label: '3 CASAIS', sub: '3 masculinas + 3 femininas' }
];

// ---------- Boxes ----------
// Preços das boxes por perfil (masculino, feminino, infantil, casal) são provisórios.
const BOXES = [
  {
    slug: 'box-retro', name: 'Box Retrô', short: 'RETRÔ', emoji: '🏆',
    tag: '★ BOX RETRÔ ★', off: 'DOS ANOS 70 AO 2020', sub: 'HISTÓRIA BORDADA',
    isub: 'Zidane, Ronaldo, Nedved, Bebeto — os mantos que escreveram a história.',
    rating: '4.9', reviews: 214,
    prices: [[174, 289.97], [418, 869.91], [522, 1449.85], [580, 2029.79]],
    feats: ['Camisas de 1970 a 2020', 'Peças raras de coleção'],
    desc: 'Camisas históricas de 1970 a 2020. Os clássicos que marcaram época.',
    photos: ['r5', 'r1', 'r2', 'r4', 'r3'],
    tags: ['retro', 'classica', 'historica', 'vintage', 'anos 90', 'copa', 'zidane', 'ronaldo', 'nedved', 'bebeto', 'flamengo', 'juventus', 'manchester united', 'inter de milao', 'inglaterra']
  },
  {
    slug: 'box-atual', name: 'Box Atual', short: 'ATUAL', emoji: '⚡',
    tag: '★ BOX ATUAL ★', off: 'ÚLTIMA TEMPORADA', sub: 'TEMPORADA RECENTE',
    isub: 'Premier League, La Liga, Série A — o que os craques estão vestindo agora.',
    rating: '4.8', reviews: 189,
    prices: [[119, 197.95], [348, 593.85], [447, 989.75], [476, 1385.65]],
    feats: ['Temporada recente dos clubões', 'Premier, La Liga, Série A'],
    desc: 'Temporada recente dos clubões e modelos fora do padrão.',
    photos: ['m2', 'm5', 'm3', 'm4', 'f5'],
    tags: ['atual', 'temporada', 'lancamento', 'clubes', 'europa', 'premier league', 'la liga', 'serie a', 'chelsea', 'atletico de madrid', 'gremio', 'sao paulo']
  },
  {
    slug: 'box-selecoes', name: 'Box Seleções', short: 'SELEÇÕES', emoji: '🌍',
    tag: '★ BOX SELEÇÕES ★', off: '32 PAÍSES', sub: 'DO MUNDO INTEIRO',
    isub: 'Do Japão à Jamaica, da Croácia ao Senegal — seleções raras que ninguém tem.',
    rating: '4.9', reviews: 97,
    prices: [[149, 249.97], [378, 749.91], [477, 1249.85], [526, 1749.79]],
    feats: ['Seleções raras de 32 países', 'Japão, Jamaica, Croácia e mais'],
    desc: 'Do Japão à Jamaica — seleções que ninguém tem.',
    photos: ['f3', 'f2', 'r3', 'i3'],
    tags: ['selecoes', 'selecao', 'mundo', 'copa do mundo', 'japao', 'jamaica', 'alemanha', 'senegal', 'colombia', 'inglaterra', 'croacia']
  },
  {
    slug: 'box-brasil', name: 'Box Brasil', short: 'BRASIL', emoji: '🇧🇷',
    tag: '★ BOX BRASIL ★', off: 'CBF OFICIAL', sub: 'AMARELINHA E AZUL',
    thumbs: [['🇧🇷', 'BRASIL'], ['💛', 'AMARELINHA'], ['💙', 'AZUL'], ['📦', 'A CAIXA'], ['🎽', 'KIT']],
    isub: 'Amarelinha e azul da CBF — das clássicas do tetra e do penta aos modelos mais recentes.',
    rating: '5.0', reviews: 241,
    prices: [[149, 249.97], [378, 749.91], [477, 1249.85], [526, 1749.79]],
    feats: ['Amarelinha e azul CBF oficial', 'Clássicas e modelos recentes'],
    desc: 'A amarelinha ou a azul. Das clássicas do tetra e do penta às mais recentes.',
    tags: ['brasil', 'cbf', 'amarelinha', 'azul', 'selecao brasileira', 'canarinho', 'tetra', 'penta']
  },
  {
    slug: 'box-classica', name: 'Box Clássica', short: 'CLÁSSICA', emoji: '👕',
    tag: '★ BOX CLÁSSICA ★', off: 'ATÉ 40% OFF', sub: 'ESTOQUE LENDÁRIO',
    isub: 'Retrô, atual, clubes e seleções — o equilíbrio perfeito.',
    rating: '4.9', reviews: 163,
    prices: [[119, 197.95], [348, 593.85], [447, 989.75], [476, 1385.65]],
    feats: ['Camisas retrô, atuais e seleções', 'Escolhida por quem coleciona'],
    desc: 'Retrô, atual, clubes e seleções — o equilíbrio perfeito.',
    photos: ['r1', 'm2', 'f3', 'r5', 'm5'],
    tags: ['classica', 'mista', 'variada', 'surpresa', 'retro', 'atual', 'clubes', 'selecoes', 'presente']
  },
  {
    slug: 'box-masculino', name: 'Box Masculino', short: 'MASCULINO', emoji: '👕',
    tag: '★ BOX MASCULINO ★', off: 'MODELAGEM MASCULINA', sub: 'CLUBES E SELEÇÕES',
    isub: 'Camisas masculinas de clubes e seleções do mundo todo, escolhidas a dedo pela curadoria.',
    rating: '4.9', reviews: 0,
    prices: [[119, 197.95], [348, 593.85], [447, 989.75], [476, 1385.65]],
    feats: ['Modelagem masculina', 'Clubes nacionais e internacionais'],
    desc: 'Camisas masculinas de clubes e seleções do mundo todo.',
    photos: ['m2', 'm5', 'm3', 'm4', 'm1'],
    tags: ['masculino', 'masculina', 'homem', 'ele', 'pra ele', 'presente pra ele', 'chelsea', 'gremio', 'sao paulo', 'atletico de madrid', 'regata', 'nba']
  },
  {
    slug: 'box-feminino', name: 'Box Feminino', short: 'FEMININO', emoji: '👚',
    tag: '★ BOX FEMININO ★', off: 'MODELAGEM FEMININA', sub: 'BABY LOOK',
    isub: 'Camisas com modelagem feminina — clubes e seleções com caimento certo.',
    rating: '4.9', reviews: 0,
    prices: [[119, 197.95], [348, 593.85], [447, 989.75], [476, 1385.65]],
    feats: ['Modelagem feminina (baby look)', 'Clubes e seleções'],
    desc: 'Camisas com modelagem feminina, de clubes e seleções.',
    photos: ['f1', 'f2', 'f3', 'f4', 'f5'],
    sizes: ['P', 'M', 'G', 'GG', '2GG'], model: 'feminino',
    tags: ['feminino', 'feminina', 'mulher', 'ela', 'pra ela', 'baby look', 'presente pra ela', 'senegal', 'alemanha', 'bahia', 'cruzeiro', 'atletico de madrid']
  },
  {
    slug: 'box-infantil', name: 'Box Infantil', short: 'INFANTIL', emoji: '🧒',
    tag: '★ BOX INFANTIL ★', off: 'KITS E CONJUNTOS', sub: 'O PRÓXIMO CRAQUE',
    isub: 'Kits e conjuntos infantis de clubes e seleções — pra criar o próximo craque da família.',
    rating: '5.0', reviews: 0,
    prices: [[99, 169.9], [278, 509.7], [357, 849.5], [399, 1189.3]],
    feats: ['Tamanhos do 4 ao 14', 'Kits e conjuntos completos'],
    desc: 'Kits e conjuntos infantis pra criar o próximo craque.',
    photos: ['i3', 'i2', 'i4', 'i1', 'i5'],
    sizes: ['4', '6', '8', '10', '12', '14'], model: 'infantil',
    tags: ['infantil', 'crianca', 'kids', 'menino', 'menina', 'filho', 'filha', 'kit infantil', 'conjunto', 'dortmund', 'aston villa', 'colombia']
  },
  {
    slug: 'box-casal', name: 'Box Casal', short: 'CASAL', emoji: '💑',
    tag: '★ BOX CASAL ★', off: 'ELE + ELA', sub: 'MISTÉRIO EM DOBRO',
    isub: 'Uma camisa masculina e uma feminina no mesmo box — pra vestir o manto junto.',
    rating: '5.0', reviews: 0,
    kits: KITS_CASAL,
    prices: [[219, 379.9], [399, 759.8], [549, 1139.7]],
    feats: ['1 masculina + 1 feminina por casal', 'Tamanho separado pra cada um'],
    desc: 'Uma camisa masculina + uma feminina. Mistério em dobro.',
    photos: ['m5', 'f1', 'm2', 'f3', 'm3', 'f5'],
    mode: 'casal',
    tags: ['casal', 'namorados', 'namorada', 'namorado', 'dia dos namorados', 'ele e ela', 'dupla', 'par', 'presente']
  }
];

const brl = (v, dec = 2) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// ---------- Partes do template ----------
function kitHtml(box, k, i) {
  const [t, o] = box.prices[i];
  const casal = box.mode === 'casal';
  const shirts = Array.from({ length: k.n }, (_, j) => `<span class="ki${k.pay && j >= k.pay ? ' dim' : ''}">${casal ? (j % 2 ? '👚' : '👕') : '👕'}</span>`).join('');
  const eco = k.n > 1
    ? `\n            <div class="kc-eco"><span class="eco-b">ECONOMIZE ${brl(Math.floor(o - t), 0)}</span><span class="eco-p">${brl(Math.round(t / k.n), 0)}/camisa</span></div>`
    : '';
  const name = k.label || `${k.n} CAMISA${k.n > 1 ? 'S' : ''}`;
  const promo = k.pay ? ` <span class="kc-promo">· você paga ${k.pay}</span>` : (k.sub ? ` <span class="kc-promo">· ${k.sub}</span>` : '');
  return `
      <div class="kc${k.hot ? ' hot' : ''}" data-kit="${i}" data-qty="${k.n}" role="radio" aria-checked="false" tabindex="0">
        ${k.hot ? '<span class="kc-badge">MAIS VENDIDO</span>' : ''}
        <div class="kc-head">
          <span class="kc-radio"></span>
          <div class="kc-main">
            <div class="kc-name">${name}${promo}</div>
            <div class="kc-icons">${shirts}</div>
          </div>
          <div class="kc-right">
            <div class="kc-old">${brl(o)}</div>
            <div class="kc-price${k.n > 1 ? ' bl' : ''}">${brl(t)}</div>${eco}
          </div>
        </div>
        <div class="kc-sizes"><div class="kc-sizes-inner">
          ${k.n > 1 ? '<div class="sz-tabs"></div>' : ''}
          <div class="sz-btns-label">${k.n > 1 ? 'Tamanho' : 'Selecione o tamanho'}</div>
          <div class="sz-btns"></div>
        </div></div>
      </div>`;
}

function galleryHtml(box) {
  if (box.photos) {
    const ph = box.photos.map(id => byId[id]);
    return `
        <div class="mi has-photo" id="mi">
          <img class="mi-photo" id="miPhoto" src="${foto(ph[0])}" alt="${esc(ph[0].nome)} — exemplo do acervo" width="900" height="900">
          <div class="mi-fan" id="miFan" hidden></div>
          <div class="mi-tag">${box.tag}</div>
          <div class="mi-off">${box.off}</div>
          <div class="mi-lbl" id="miLbl">${esc(ph[0].nome)}</div>
          <div class="mi-sub" id="miSub">EXEMPLO DO ACERVO · A SUA É SURPRESA</div>
        </div>
        <div class="tbs" role="tablist" style="--n:${ph.length}">
${ph.map((c, i) => `          <button type="button" class="tb tb-photo${i === 0 ? ' on' : ''}" data-src="${foto(c)}" data-label="${esc(c.nome)}" aria-label="${esc(c.nome)}"><img src="${foto(c, true)}" alt="" loading="lazy" width="420" height="420"></button>`).join('\n')}
        </div>`;
  }
  return `
        <div class="mi" id="mi">
          <div class="mi-tag">${box.tag}</div>
          <div class="mi-off">${box.off}</div>
          <div class="mi-big" id="miBig">${box.emoji}</div>
          <div class="mi-lbl" id="miLbl">${box.short}</div>
          <div class="mi-sub" id="miSub">${box.sub}</div>
        </div>
        <div class="tbs" role="tablist">
${box.thumbs.map(([e, l], i) => `          <button type="button" class="tb${i === 0 ? ' on' : ''}" data-icon="${e}" data-label="${l}" aria-label="${l}">${e}</button>`).join('\n')}
        </div>`;
}

function crossSell(box) {
  return BOXES.filter(b => b.slug !== box.slug).slice(0, 8).map(b => {
    const media = b.photos
      ? `<span class="xs-photo"><img src="${foto(byId[b.photos[0]], true)}" alt="" loading="lazy" width="420" height="420"></span>`
      : `<span class="xs-emoji">${b.emoji}</span>`;
    return `
      <a href="${b.slug}.html" class="xs-card spotlight">
        ${media}
        <div>
          <div class="xs-name">${b.name}</div>
          <div class="xs-desc">${b.desc}</div>
        </div>
        <div class="xs-price"><s>${brl(b.prices[0][1])}</s>${brl(b.prices[0][0])}</div>
      </a>`;
  }).join('');
}

function page(box, top, foot) {
  const kits = box.kits || KITS;
  const [t1, o1] = box.prices[0];
  const rating = box.reviews
    ? `<span class="sts">★★★★★</span>
          <span class="rn">${box.rating}</span>
          <span class="rc">(${box.reviews} avaliações)</span>`
    : `<span class="rn-new">NOVIDADE</span>
          <span class="rc">Acabou de chegar na Da Sports Box</span>`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${box.name} — Da Sports Box</title>
  <meta name="description" content="${esc(box.name + ': ' + box.isub)}">
  <meta name="theme-color" content="#0c0c0c">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/global.css">
  <link rel="stylesheet" href="css/box.css">
</head>
<body class="page-product">

${top}

<main class="product">
  <div class="container">

    <nav class="bc" aria-label="Você está em">
      <a href="index.html">Início</a><span>›</span><a href="index.html#boxes">Boxes</a><span>›</span><b>${box.name}</b>
    </nav>

    <div class="pg">

      <!-- Galeria -->
      <div class="gallery">${galleryHtml(box)}
        <div class="trust">
          <div><b>🚚</b>Frete grátis acima de R$ 299</div>
          <div><b>🔄</b>Troca garantida em 30 dias</div>
          <div><b>🔒</b>Compra 100% segura</div>
        </div>
      </div>

      <!-- Informações e compra -->
      <div class="info">
        <p class="itag">Da Sports · Caixa Misteriosa</p>
        <h1 class="ih1">${box.name}</h1>
        <p class="isub">${box.isub}</p>
        <div class="rat">
          ${rating}
        </div>

        <div class="kl">
          <span>Escolha seu kit</span>
          <button type="button" class="kl-link" data-open-sizes>📏 Qual meu tamanho?</button>
        </div>

        <div class="kits" id="kits" role="radiogroup" aria-label="Kits">${kits.map((k, i) => kitHtml(box, k, i)).join('')}
        </div>

        <div class="qrow">
          <span class="qlbl">Quantidade de kits</span>
          <div class="qctl">
            <button type="button" class="qbt" data-q="-1" aria-label="Diminuir">−</button>
            <div class="qnm" id="qN">1</div>
            <button type="button" class="qbt" data-q="1" aria-label="Aumentar">+</button>
          </div>
        </div>

        <div class="tot">
          <div class="tot-row"><span class="tot-lbl">Valor original</span><span class="tot-old" id="tOld">${brl(o1)}</span></div>
          <div class="tot-row"><span class="tot-lbl strong">Total com desconto</span><span class="tot-main" id="tMain">${brl(t1)}</span></div>
          <div class="pix-row"><span class="pix-lbl">No Pix (5% off)</span><span class="pix-val" id="tPix">${brl(t1 * .95)}</span></div>
          <div class="ship">
            <div class="ship-txt" id="shipTxt">${t1 >= 299 ? '🎉 Você ganhou frete grátis!' : `Faltam <b>${brl(299 - t1)}</b> para frete grátis`}</div>
            <div class="ship-bar"><i id="shipBar" style="width:${Math.min(100, t1 / 299 * 100).toFixed(1)}%"></i></div>
          </div>
        </div>

        <div class="buy" id="buy">
          <button type="button" class="btn btn-main btn-block" id="btnPix">Comprar agora via Pix · 5% off</button>
          <button type="button" class="btn btn-outline btn-block" id="btnCart">Adicionar ao carrinho <span class="arr">→</span></button>
        </div>

        <div class="feats">
          <div class="ft"><span class="fc">✓</span>${box.feats[0]}</div>
          <div class="ft"><span class="fc">✓</span>Lacrada e embalada na origem</div>
          <div class="ft"><span class="fc">✓</span>Garantia de troca em 30 dias</div>
          <div class="ft"><span class="fc">✓</span>${box.feats[1]}</div>
          <div class="ft"><span class="fc">✓</span>Sem camisa repetida por cliente</div>
          <div class="ft"><span class="fc">✓</span>Entrega rastreada para todo Brasil</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Como funciona (resumo) -->
  <section class="p-how">
    <div class="container">
      <div class="p-how-grid" data-stagger="up">
        <div><span class="p-how-n">1</span><div><b>Escolha o kit e os tamanhos</b><p>Leva menos de 2 minutos.</p></div></div>
        <div><span class="p-how-n">2</span><div><b>A curadoria escala suas camisas</b><p>Sem repetir camisa por cliente.</p></div></div>
        <div><span class="p-how-n">3</span><div><b>Abre, filma e posta</b><p>Marque @dasportsbox e ganhe 20% off.</p></div></div>
      </div>
    </div>
  </section>

  <!-- Outras boxes -->
  <section class="xs">
    <div class="container">
      <div class="s-head">
        <div>
          <p class="s-label" data-reveal>Mais mistério</p>
          <h2 class="s-title" data-split>Conheça as outras boxes</h2>
        </div>
      </div>
      <div class="xs-grid" data-stagger="up">${crossSell(box)}
      </div>
    </div>
  </section>
</main>

<!-- Barra de compra fixa (mobile) -->
<div class="sticky-buy" id="stickyBuy" aria-hidden="true">
  <div class="container sticky-inner">
    <div>
      <div class="sticky-name">${box.name}</div>
      <div class="sticky-total" id="stickyTotal">${brl(t1)}</div>
    </div>
    <button type="button" class="btn btn-main" id="stickyBtn">Comprar <span class="arr">→</span></button>
  </div>
</div>

<!-- Modal: guia de tamanhos -->
<div class="overlay" id="sizeModal" role="dialog" aria-modal="true" aria-labelledby="sizeTitle" hidden>
  <div class="modal">
    <div class="modal-head">
      <div>
        <div class="modal-title" id="sizeTitle">Guia de tamanhos</div>
        <div class="modal-sub">As medidas são da camiseta, não do corpo.</div>
      </div>
      <button type="button" class="mclose" data-close-sizes aria-label="Fechar">✕</button>
    </div>
    <div class="modal-body">
      <form class="calc-card" id="calcForm">
        <div class="calc-title">Descubra seu tamanho</div>
        <div class="calc-sub">Informe altura e peso — calculamos o tamanho ideal pela tabela do modelo selecionado.</div>
        <div class="calc-fields">
          <div class="cf"><label for="cH">Altura (cm)</label><input type="number" id="cH" inputmode="numeric" min="90" max="230" placeholder="Ex: 178"></div>
          <div class="cf"><label for="cW">Peso (kg)</label><input type="number" id="cW" inputmode="numeric" min="12" max="250" placeholder="Ex: 82"></div>
        </div>
        <button type="submit" class="btn btn-dark btn-block">Encontrar meu tamanho</button>
        <div class="calc-result" id="calcR" aria-live="polite"></div>
      </form>
      <button type="button" class="toggle-table" id="toggleTable" aria-expanded="false">
        <span>Ver tabela completa</span><span class="tt-arr">▾</span>
      </button>
      <div class="table-section" id="tableSection"><div>
        <div class="model-tabs">
          <button type="button" class="mt" data-model="masculino">Masculino</button>
          <button type="button" class="mt" data-model="feminino">Feminino</button>
          <button type="button" class="mt" data-model="infantil">Infantil</button>
          <button type="button" class="mt" data-model="jogador">Jogador</button>
          <button type="button" class="mt" data-model="torcedor">Torcedor</button>
        </div>
        <div id="tableWrap"></div>
      </div></div>
    </div>
  </div>
</div>

${foot}

<script>
  // Dados da box (em produção virão da Shopify)
  window.BOX = ${JSON.stringify({
    name: box.name,
    emoji: box.emoji,
    mode: box.mode || null,
    sizes: box.sizes || null,
    model: box.model || 'masculino',
    photos: box.photos ? box.photos.map(id => ({ src: foto(byId[id]), thumb: foto(byId[id], true), nome: byId[id].nome, cat: byId[id].cat })) : null,
    prices: box.prices.map(([t, o]) => ({ t, o }))
  }, null, 2).replace(/\n/g, '\n  ')};
</script>
<script src="js/site.js"></script>
<script src="js/box.js"></script>
</body>
</html>
`;
}

// ---------- Index: grade de camisas ----------
function shirtsGrid() {
  return CAMISAS.map(c => `      <figure class="shirt-card" data-cat="${c.cat}">
        <div class="shirt-img"><img src="${foto(c, true)}" alt="${esc(c.nome)} — ${esc(c.det)}" loading="lazy" width="420" height="420"></div>
        <figcaption><span class="shirt-name">${esc(c.nome)}</span><span class="shirt-det">${esc(c.det)}</span></figcaption>
      </figure>`).join('\n');
}

// ---------- Busca ----------
const AJUDA = [
  { tipo: 'Ajuda', titulo: 'Guia de tamanhos', url: 'box-classica.html#tamanhos', descricao: 'Calcule seu tamanho pela altura e peso ou veja a tabela completa.', emoji: '📏', tags: ['tamanho', 'medidas', 'tabela', 'calculadora', 'p', 'm', 'g', 'gg', 'infantil', 'feminino'] },
  { tipo: 'Ajuda', titulo: 'Monte sua box (quiz)', url: 'index.html#quiz', descricao: '4 perguntas rápidas e a gente indica a box ideal pra você.', emoji: '🎯', tags: ['quiz', 'montar', 'indicacao', 'qual box', 'ajuda a escolher'] },
  { tipo: 'Ajuda', titulo: 'Camisas que podem vir', url: 'index.html#camisas', descricao: 'Exemplos reais do acervo: retrô, masculina, feminina e infantil.', emoji: '👕', tags: ['camisas', 'acervo', 'exemplos', 'fotos', 'modelos'] },
  { tipo: 'Ajuda', titulo: 'Como funciona', url: 'index.html#como-funciona', descricao: 'Escolha a vibe, a gente escala a camisa e você revela.', emoji: '📦', tags: ['como funciona', 'caixa misteriosa', 'passo a passo', 'curadoria'] },
  { tipo: 'Ajuda', titulo: 'Trocas e garantia', url: 'index.html#faq', descricao: 'Garantia de troca em 30 dias e troca de tamanho garantida.', emoji: '🔄', tags: ['troca', 'devolucao', 'garantia', '30 dias', 'tamanho errado'] },
  { tipo: 'Ajuda', titulo: 'Frete e entrega', url: 'index.html#faq', descricao: 'Frete grátis acima de R$299 e entrega rastreada para todo o Brasil.', emoji: '🚚', tags: ['frete', 'entrega', 'prazo', 'rastreio', 'frete gratis', 'correios'] },
  { tipo: 'Ajuda', titulo: 'Pagamento', url: 'index.html#faq', descricao: 'Pix com 5% off ou cartão em até 2x sem juros.', emoji: '💳', tags: ['pagamento', 'pix', 'cartao', 'parcelar', 'sem juros', 'desconto'] }
];

function searchIndex() {
  const itens = BOXES.map(b => ({
    tipo: 'Box', titulo: b.name, url: `${b.slug}.html`, descricao: b.desc, emoji: b.emoji,
    imagem: b.photos ? foto(byId[b.photos[0]], true) : undefined,
    preco: b.prices[0][0], precoAntigo: b.prices[0][1], tags: b.tags
  }));
  return { populares: ['Retrô', 'Feminino', 'Infantil', 'Casal', 'Guia de tamanhos'], itens: itens.concat(AJUDA) };
}

// ---------- Execução ----------
let index = fs.readFileSync(INDEX, 'utf8');
const START = '<!-- CAMISAS:INICIO -->', END = '<!-- CAMISAS:FIM -->';
index = index.slice(0, index.indexOf(START) + START.length) + '\n' + shirtsGrid() + '\n' + index.slice(index.indexOf(END));
fs.writeFileSync(INDEX, index);
console.log('ok index.html (camisas:', CAMISAS.length + ')');

const top = index.slice(index.indexOf('<div class="ticker"'), index.indexOf('<main>')).trimEnd();
const foot = index.slice(index.indexOf('<!-- RODAPÉ -->'), index.indexOf('</footer>') + '</footer>'.length);
for (const box of BOXES) {
  fs.writeFileSync(path.join(ROOT, box.slug + '.html'), page(box, top, foot));
  console.log('ok', box.slug);
}

fs.writeFileSync(path.join(ROOT, 'data', 'busca.json'), JSON.stringify(searchIndex(), null, 2) + '\n');
console.log('ok data/busca.json');
