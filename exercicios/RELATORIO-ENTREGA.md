# Relatório de entrega — Exercícios MongoDB

## Escopo lido

Foram lidas as nove imagens e os três arquivos de referência da pasta `exercicios`. As imagens apresentam oito entregas: Marketplace Parte 1–4 e Engenharia de Dados Tarefa 1–4. O exemplo monolítico e o exemplo com Mongoose, mais o seed de referência, foram utilizados como requisitos de partida.

## Entregas

| Exercício | O que pede e formato | Arquivos entregues | Estado |
|---|---|---|---|
| Parte 1 | Marketplace Node/Express **em memória**; visão geral de vendedores, produtos e compras | `src/index.js`, `src/marketplace.js`, `src/models.js` | **Parcial**: a API atual usa MongoDB; falta a versão inicial em memória pedida pelo print |
| Parte 2 | Iniciar `node index.js`, executar cinco requisições na ordem indicada e **postar o resultado** | `docs/Parte-2-teste-api.md`, `tests/mongodb.test.js` | **Parcial**: há roteiro e teste automatizado, mas falta um registro apresentável das respostas reais da sequência; a API atual usa ObjectIds e exige saldo para a compra |
| Parte 3 | Substituir a implementação em memória por MongoDB/Mongoose, com `.env` contendo a URI | `src/models.js`, `src/index.js`, `.env.example` | **Parcial**: persistência implementada e template de `.env` fornecido; não há `.env` configurado nem banco local persistente |
| Parte 4 | Seed sem índices adicionais, 1k produtos, 5k usuários, 100k pedidos em lotes; apresentar amostra | `scripts/seed.js`, `scripts/create-sample.js`, `exercicios/Parte-4-amostra.json`, `docs/Parte-4-seed.md` | Seed rodou em MongoDB temporário e as contagens foram validadas; amostra anexada |
| Tarefa 1 | Modelar avaliações e histórico; apresentar JSON, embedding/referencing e justificativa **em `SOLUCAO.md`** | `docs/Tarefa-1-modelagem.md`, `src/models.js` | **Parcial no formato**: conteúdo está em outro arquivo; `SOLUCAO.md` contém apenas a Tarefa 3 |
| Tarefa 2 | Executar dois pipelines diretamente no MongoDB e **apresentar os resultados em relatório** | `src/analytics.js`, `docs/Tarefa-2-agregacoes.md` | **Parcial no relatório**: pipelines e testes existem, mas o documento apresenta instruções/código, sem as tabelas de resultado da base semeada |
| Tarefa 3 | `explain` antes/depois, índice ESR e comparação de métricas em `SOLUCAO.md` | `scripts/explain.js`, `SOLUCAO.md` | Comparação executada em 100k documentos; `COLLSCAN` 124 ms/100.000 docs → `IXSCAN` 4 ms/593 docs |
| Tarefa 4 | Entregar função/script de checkout transacional com cinco passos atômicos e rollback | `src/marketplace.js`, `tests/mongodb.test.js` | **Parcial na integração**: a transação e o rollback foram testados na API; os campos do seed diferem dos modelos da API, então o checkout não funciona diretamente com os documentos do seed |

## Forma de entrega indicada pelos prints

Os prints não exigem capturas de tela como formato específico. Eles pedem: código executável para as Partes 1 e 3 e a Tarefa 4; resultado postado da API para a Parte 2; amostra do banco instanciado para a Parte 4; texto explicitamente em `SOLUCAO.md` para a Tarefa 1; relatório com os resultados das duas agregações para a Tarefa 2; e análise/medições em `SOLUCAO.md` para a Tarefa 3. `Engenharia-Tarefa2.png` e `Engenharia-Tarefa2.1.png` repetem o mesmo enunciado.

## Testes e limitações do ambiente

`npm test` passou (2 testes). Um MongoDB temporário em replica set validou endpoints, criação de usuário/produto, listagem, compra, redução de estoque/carteira, rollback, ambos os pipelines e uso do índice (`IXSCAN`). Outro MongoDB temporário executou o seed completo, confirmou contagens exatas, campos dos pedidos, ausência de índices não solicitados e mediu a consulta antes/depois do índice.

Não há `mongod` instalado e o Docker Desktop não está iniciado; por isso os dados de demonstração foram executados em instâncias temporárias de teste, não ficaram em um banco local persistente. A amostra JSON anexada contém documentos reais desse seed temporário. O `npm install` dependeu de `--strict-ssl=false` devido a certificado da rede; essa opção não foi salva no projeto. Para transações locais, use replica set (o URI exemplo usa `replicaSet=rs0`).

## Como rodar

Copie `.env.example` para `.env`, configure um MongoDB replica set, rode `npm install`, `npm test`, `npm run seed` e `npm run report:explain`. O seed apaga o banco selecionado antes de popular; use uma base descartável.
