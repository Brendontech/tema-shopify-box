// Catálogo das fotos de camisas (exemplos do acervo) — usado pelo gerador.
// Os arquivos ficam em img/camisas/<categoria>/<arquivo>.webp (+ versão "-p" menor).
// Para adicionar fotos: coloque na pasta original, rode scripts/otimizar-camisas.py
// e acrescente a linha aqui.

export const CATEGORIAS = {
  retro:     'Retrô',
  masculina: 'Masculina',
  feminina:  'Feminina',
  infantil:  'Infantil'
};

export const CAMISAS = [
  { id: 'r1', cat: 'retro', arquivo: '01-camisa-juventus-retro-2010-preta-e-branca', nome: 'Juventus', det: 'Retrô · listrada' },
  { id: 'r2', cat: 'retro', arquivo: '02-camisa-manchester-united-home-1-199899-umbro-retro-masculina', nome: 'Manchester United 98/99', det: 'Retrô · Umbro' },
  { id: 'r3', cat: 'retro', arquivo: '03-camisa-inglaterra-retro-2013-branca-nike', nome: 'Inglaterra 2013', det: 'Retrô · seleção' },
  { id: 'r4', cat: 'retro', arquivo: '04-camisa-inter-de-milao-retro-0405-masculino', nome: 'Inter de Milão 04/05', det: 'Retrô · Nike' },
  { id: 'r5', cat: 'retro', arquivo: '05-flamengo-retro-19921993-home', nome: 'Flamengo 92/93', det: 'Retrô · home' },

  { id: 'm1', cat: 'masculina', arquivo: '01-regata-orlando-magic-masculina-preta', nome: 'Orlando Magic', det: 'Regata NBA' },
  { id: 'm2', cat: 'masculina', arquivo: '02-camisa-chelsea-i-2324-nike-azul', nome: 'Chelsea 23/24', det: 'Masculina · home' },
  { id: 'm3', cat: 'masculina', arquivo: '03-camisa-masculina-umbro-gremio-oficial-2425-torcedor-com-patr', nome: 'Grêmio 24/25', det: 'Masculina · torcedor' },
  { id: 'm4', cat: 'masculina', arquivo: '04-camisa-sao-paulo-2526-goleiro-home', nome: 'São Paulo 25/26', det: 'Masculina · goleiro' },
  { id: 'm5', cat: 'masculina', arquivo: '05-camisa-nike-atletico-de-madrid-202526-pre-jogo', nome: 'Atlético de Madrid 25/26', det: 'Masculina · pré-jogo' },

  { id: 'f1', cat: 'feminina', arquivo: '01-camisa-feminina-nike-atletico-madrid-202526-i-torcedor', nome: 'Atlético de Madrid 25/26', det: 'Feminina · torcedor' },
  { id: 'f2', cat: 'feminina', arquivo: '02-camisa-feminina-senegal-202627-i', nome: 'Senegal 26/27', det: 'Feminina · seleção' },
  { id: 'f3', cat: 'feminina', arquivo: '03-camisa-feminina-alemanha-202627-i', nome: 'Alemanha 26/27', det: 'Feminina · seleção' },
  { id: 'f4', cat: 'feminina', arquivo: '04-camisa-bahia-2425-uniforme-2-jogo-feminina', nome: 'Bahia 24/25', det: 'Feminina · uniforme 2' },
  { id: 'f5', cat: 'feminina', arquivo: '05-camisa-cruzeiro-ii-202627-torcedor-adidas-feminina-brancoazu', nome: 'Cruzeiro 26/27', det: 'Feminina · uniforme 2' },

  { id: 'i1', cat: 'infantil', arquivo: '01-kit-infantil-atletico-de-madrid-l-2425', nome: 'Atlético de Madrid 24/25', det: 'Kit infantil' },
  { id: 'i2', cat: 'infantil', arquivo: '02-conjunto-infantil-aston-villa-home-2425-vinho', nome: 'Aston Villa 24/25', det: 'Conjunto infantil' },
  { id: 'i3', cat: 'infantil', arquivo: '03-conjunto-infantil-colombia-202627', nome: 'Colômbia 26/27', det: 'Conjunto infantil' },
  { id: 'i4', cat: 'infantil', arquivo: '04-kit-infantil-borussia-dortmund-2324-amarelopreto', nome: 'Borussia Dortmund 23/24', det: 'Kit infantil' },
  { id: 'i5', cat: 'infantil', arquivo: '05-conjunto-infantil-borussia-dortmund-202627', nome: 'Borussia Dortmund 26/27', det: 'Conjunto infantil' }
];

export const byId = Object.fromEntries(CAMISAS.map(c => [c.id, c]));
export const foto = (c, pequena) => `img/camisas/${c.cat}/${c.arquivo}${pequena ? '-p' : ''}.webp`;
