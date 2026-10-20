# Da Sports Box dentro da sua loja Shopify

Estes arquivos são **adicionados** ao tema que você já usa. Nada do tema atual é
substituído: todos os nomes começam com `box` ou `camisa-`, e as páginas da Box
usam um layout próprio (`layout/box.liquid`), com o cabeçalho, a busca, o
carrinho lateral e o rodapé da Box.

> Não edite estes arquivos à mão: eles são gerados por
> `node scripts/gerar-boxes.mjs` a partir do site (index.html, css/, js/, img/).
> Mudou algo no site? Rode o gerador e suba a pasta `shopify/` de novo.

## O que tem aqui

| Pasta | Arquivos | Para que serve |
|---|---|---|
| `layout/` | `box.liquid` | Estrutura das páginas da Box (cabeçalho, busca, menu, rodapé) |
| `templates/` | `page.box.liquid` | Home da Box |
| `templates/` | `page.box-retro.liquid` … `page.box-casal.liquid` | Uma página para cada box (9) |
| `assets/` | `box-*.css`, `box-*.js`, `box-busca.json`, `box-logo-branca.png`, `camisa-*.webp` | Estilos, scripts, índice da busca e fotos |

## Passo a passo

### 1. Faça uma cópia do tema (para testar sem mexer na loja no ar)
**Loja virtual → Temas → ⋯ (no tema atual) → Duplicar.** Trabalhe na cópia.

### 2. Suba os arquivos para a cópia do tema

**Opção A — Shopify CLI (mais rápido, sobe tudo de uma vez):**
```bash
shopify theme push --path shopify --theme <ID_DA_COPIA> --nodelete
```
O `--nodelete` garante que só esses arquivos são enviados e **nada do tema é apagado**.

**Opção B — pelo painel (Editar código):** na cópia, **⋯ → Editar código**.
- **Layout → Adicionar um novo layout** → nome `box` → apague o conteúdo e cole o de `layout/box.liquid`.
- **Templates → Adicionar um novo modelo** → tipo **page**, formato **liquid**, nome `box` → cole `templates/page.box.liquid`.
  Repita para cada box: `box-retro`, `box-atual`, `box-selecoes`, `box-brasil`, `box-classica`,
  `box-masculino`, `box-feminino`, `box-infantil`, `box-casal`.
- **Assets → Adicionar um novo asset** → envie todos os arquivos da pasta `assets/` (dá para selecionar vários).

### 3. Crie os produtos (um por box)
**Produtos → Adicionar produto.** O **identificador (handle)** precisa ser exatamente este,
porque é por ele que a página encontra o produto, os preços e as variantes:

| Box | Handle do produto | Variantes, **nesta ordem** |
|---|---|---|
| Box Retrô | `box-retro` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Atual | `box-atual` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Seleções | `box-selecoes` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Brasil | `box-brasil` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Clássica | `box-classica` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Masculino | `box-masculino` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Feminino | `box-feminino` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Infantil | `box-infantil` | 1 camisa, 3 camisas, 5 camisas, 7 camisas |
| Box Casal | `box-casal` | 1 casal, 2 casais, 3 casais |

- **Preço** da variante = o que o cliente paga; **Preço comparativo** = o valor "de" (riscado).
- O **tamanho** de cada camisa não é variante: ele vai junto no pedido como observação
  do item (aparece no pedido como "Tamanhos: Camisa 1: G · Camisa 2: M…").
- O handle fica em **Produto → Listagem do mecanismo de pesquisa → Editar → Identificador do URL**.

### 4. Crie as páginas
**Loja virtual → Páginas → Adicionar página.**

| Título | Identificador do URL (handle) | Modelo |
|---|---|---|
| Box | `box` | `page.box` |
| Box Retrô | `box-retro` | `page.box-retro` |
| Box Atual | `box-atual` | `page.box-atual` |
| Box Seleções | `box-selecoes` | `page.box-selecoes` |
| Box Brasil | `box-brasil` | `page.box-brasil` |
| Box Clássica | `box-classica` | `page.box-classica` |
| Box Masculino | `box-masculino` | `page.box-masculino` |
| Box Feminino | `box-feminino` | `page.box-feminino` |
| Box Infantil | `box-infantil` | `page.box-infantil` |
| Box Casal | `box-casal` | `page.box-casal` |

O conteúdo da página pode ficar vazio. O modelo escolhe-se no canto direito ("Modelo do tema").

> As páginas só oferecem esses modelos se a cópia do tema for a que está **publicada**.
> Para testar antes: use **Pré-visualizar** na cópia do tema e abra `/pages/box`.

### 5. Coloque a Box no menu da loja
**Loja virtual → Navegação → Menu principal → Adicionar item → link `/pages/box`.**

### 6. Teste e publique
Abra `/pages/box` na pré-visualização da cópia, escolha uma box, um tamanho, adicione
ao carrinho e clique em **Finalizar compra**. Estando tudo certo: **Temas → Publicar** a cópia.

## Como funciona a compra
- O carrinho lateral da Box guarda os itens no navegador.
- **Finalizar compra** esvazia o carrinho da loja, envia os itens da Box (variante + tamanhos)
  pelo carrinho da própria Shopify (`/cart/add.js`) e leva para o **`/checkout`**
  (que o Cartpanda assume, se estiver instalado).
- Não precisa de API, app nem chave: tudo roda no mesmo domínio da loja.

## Bom saber
- **Preços nas páginas de cada box:** vêm do produto da Shopify (sempre iguais ao checkout).
- **Preços na home da Box** (carrossel, "Pra quem é o manto" e resultado do quiz) são fixos no
  código. Mudou preço na Shopify? Atualize em `scripts/gerar-boxes.mjs` / `index.html` e gere de novo.
- Se um produto ainda não existir, a página da box abre normalmente com os preços fixos,
  mas **não consegue finalizar a compra** (falta a variante).
- Ao finalizar pela Box, itens que estavam no carrinho da loja (fora da Box) são removidos,
  para o checkout ter só os itens da Box.
