# Relatório de entrega — Exercícios MongoDB

## Escopo lido

Foram lidas as nove imagens e os três arquivos de referência da pasta `exercicios`. As imagens apresentam oito entregas: Marketplace Parte 1–4 e Engenharia de Dados Tarefa 1–4. O exemplo monolítico e o exemplo com Mongoose, mais o seed de referência, foram utilizados como requisitos de partida.

## Entregas

| Exercício | O que pede e formato | Arquivos entregues | Estado |
|---|---|---|---|
| Parte 1 | Marketplace Node/Express **em memória**; visão geral de vendedores, produtos e compras | `parte1/index.js` | Entregue; IDs numéricos e rotas do exemplo |
| Parte 2 | Iniciar `node index.js`, executar cinco requisições na ordem indicada e **postar o resultado** | `docs/Parte-2-teste-api.md`, `docs/Parte-2-resultado.json` | Entregue; cinco respostas reais e estoque 5 → 3 |
| Parte 3 | Substituir a implementação em memória por MongoDB/Mongoose, com `.env` contendo a URI | `src/models.js`, `src/index.js`, `.env.example`, `docs/Parte-3-resultado.md` | Código e fluxo HTTP testados em MongoDB temporário; URI persistente local configurável em `.env` |
| Parte 4 | Seed sem índices adicionais, 1k produtos, 5k usuários, 100k pedidos em lotes; apresentar amostra | `scripts/seed.js`, `scripts/create-sample.js`, `exercicios/Parte-4-amostra.json`, `docs/Parte-4-seed.md` | Seed rodou em MongoDB temporário e as contagens foram validadas; amostra anexada |
| Tarefa 1 | Modelar avaliações e histórico; apresentar JSON, embedding/referencing e justificativa **em `SOLUCAO.md`** | `SOLUCAO.md`, `docs/Tarefa-1-modelagem.md`, `src/models.js` | Entregue; resumo, dez avaliações recentes e histórico completo referenciado |
| Tarefa 2 | Executar dois pipelines diretamente no MongoDB e **apresentar os resultados em relatório** | `src/analytics.js`, `docs/Tarefa-2-agregacoes.md`, `docs/Tarefa-2-resultados.md` | Entregue; tabelas reais da base com 100 mil pedidos |
| Tarefa 3 | `explain` antes/depois, índice ESR e comparação de métricas em `SOLUCAO.md` | `scripts/explain.js`, `SOLUCAO.md`, `docs/Tarefa-3-explain.json` | Entregue; `COLLSCAN` 135 ms/100.000 docs → `IXSCAN` 6 ms/489 docs |
| Tarefa 4 | Entregar função/script de checkout transacional com cinco passos atômicos e rollback | `src/checkout.js`, `docs/Tarefa-4-resultado.md` | Entregue; compra e duas falhas com rollback na base do seed |

## Forma de entrega indicada pelos prints

Os prints não exigem capturas de tela como formato específico. Eles pedem: código executável para as Partes 1 e 3 e a Tarefa 4; resultado postado da API para a Parte 2; amostra do banco instanciado para a Parte 4; texto explicitamente em `SOLUCAO.md` para a Tarefa 1; relatório com os resultados das duas agregações para a Tarefa 2; e análise/medições em `SOLUCAO.md` para a Tarefa 3. `Engenharia-Tarefa2.png` e `Engenharia-Tarefa2.1.png` repetem o mesmo enunciado.

## Testes e limitações do ambiente

`npm test` passou (2 testes). `npm run capture:part2` executou a sequência pedida da API em memória. `npm run report:all` executou o seed completo, as agregações, o explain e o checkout com rollback em MongoDB temporário. A API Mongoose também foi iniciada com `npm run dev` e exercitada via HTTP: pedido pago de R$ 500, estoque 5 → 3.

Não foi encontrado um serviço `mongod` ativo nem MongoDB na porta 27017; por isso os dados de demonstração foram executados no binário real do MongoDB iniciado temporariamente pelo projeto, sem banco local persistente. A amostra JSON anexada contém documentos reais desse seed. Para persistência entre execuções, é preciso configurar uma URI MongoDB própria em `.env`. Para transações locais, use replica set (o URI exemplo usa `replicaSet=rs0`).

## Como rodar

Rode `npm ci`, `npm run capture:part2`, `npm test`, `npm run report:all` e `npm run dev`. Para banco persistente, copie `.env.example` para `.env`, configure um MongoDB replica set e use `npm start`. `npm run seed` apaga o banco selecionado antes de popular; use uma base descartável.
