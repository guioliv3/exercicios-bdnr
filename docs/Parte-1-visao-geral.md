# Parte 1 — Visão geral do marketplace em memória

O projeto inicial usa Node.js e Express. Usuários, produtos e pedidos são guardados em arrays enquanto o processo está em execução. Ele permite cadastrar vendedores e compradores, anunciar produtos, listar a vitrine e fazer compras.

## Fluxo do sistema

1. `POST /usuarios` cadastra um usuário com `nome` e `tipo` (`vendedor` ou `comprador`).
2. `POST /produtos` aceita `vendedorId`, `nome`, `preco` e `estoque`; somente um vendedor cadastrado pode anunciar.
3. `GET /produtos` mostra produtos com estoque maior que zero.
4. `POST /pedidos` aceita `compradorId`, `produtoId` e `quantidade`; valida o comprador e o estoque, reduz a quantidade disponível e registra o valor total.

Os IDs são números sequenciais, como no exemplo fornecido. Os dados deixam de existir quando o servidor é encerrado. A implementação está em [parte1/index.js](../parte1/index.js).

## Como executar

Na raiz do repositório, instale as dependências com `npm ci` e inicie a API com `node parte1/index.js`. Ela escuta em `http://localhost:3000`. O teste das cinco chamadas e suas respostas pertence à [Parte 2](Parte-2-teste-api.md).
