# Parte 2 — Resultado do teste da API

O fluxo foi executado na API em memória da Parte 1, na ordem exata do enunciado. O registro integral de requisições e respostas está em [Parte-2-resultado.json](Parte-2-resultado.json).

| Passo | Requisição | Resultado observado |
|---|---|---|
| 1 | `POST /usuarios` — Loja Tech, vendedor | HTTP 201; vendedor `id: 1` |
| 2 | `POST /usuarios` — João Silva, comprador | HTTP 201; comprador `id: 2` |
| 3 | `POST /produtos` — Teclado Mecânico, R$ 250, estoque 5 | HTTP 201; produto `id: 1` |
| 4 | `GET /produtos` | HTTP 200; vitrine inclui o teclado com estoque 5 |
| 5 | `POST /pedidos` — comprador 2, produto 1, quantidade 2 | HTTP 201; pedido de R$ 500 |
| Conferência | `GET /produtos` após a compra | Estoque 3 |

Para reproduzir, execute `node parte1/index.js` e faça as cinco chamadas no Postman/Insomnia. O comando `npm run capture:part2` executa a mesma sequência automaticamente, confere as respostas e atualiza o JSON de evidência.

A versão MongoDB/Mongoose fica em `src/` e usa ObjectIds; para demonstrar a compra transacional nela, cadastre o comprador com `saldoInicial: 1000` além de nome e tipo.
