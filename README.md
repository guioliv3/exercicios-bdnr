# Marketplace e Engenharia de Dados com MongoDB

Projeto Node.js/Express para os exercícios de marketplace e engenharia de dados. Inclui API com Mongoose, seed de 106 mil documentos, pipelines de agregação, diagnóstico de índice e checkout transacional.

## Entregas

| Exercício | Implementação | Evidência e apresentação | Situação atual |
|---|---|---|---|
| Parte 1 — Marketplace em memória | [API atual](src/marketplace.js) | [Roteiro do fluxo](docs/Parte-2-teste-api.md) | Pendente a versão inicial em memória exigida pelo enunciado. |
| Parte 2 — Teste da API | [Teste HTTP](tests/mongodb.test.js) | [Roteiro das cinco chamadas](docs/Parte-2-teste-api.md) | Teste automatizado passou; falta registrar as respostas da sequência para postagem. |
| Parte 3 — Persistência | [Modelos Mongoose](src/models.js), [inicialização](src/index.js) | [Configuração de exemplo](.env.example) | Código implementado; requer uma URI MongoDB configurada localmente. |
| Parte 4 — Seed | [Script](scripts/seed.js) | [Amostra real do banco](exercicios/Parte-4-amostra.json), [instruções](docs/Parte-4-seed.md) | Executado em MongoDB temporário: 1.000 produtos, 5.000 usuários e 100.000 pedidos. |
| Tarefa 1 — Modelagem | [Schemas](src/models.js) | [Modelo e justificativa](docs/Tarefa-1-modelagem.md) | Conteúdo pronto em documento separado; falta colocá-lo em `SOLUCAO.md`, como pede o enunciado. |
| Tarefa 2 — Agregações | [Pipelines](src/analytics.js) | [Relatório técnico](docs/Tarefa-2-agregacoes.md) | Pipelines testados; faltam os resultados da base semeada no relatório. |
| Tarefa 3 — Índice ESR | [Script de explain](scripts/explain.js) | [SOLUCAO.md](SOLUCAO.md) | Análise antes/depois concluída com 100.000 pedidos. |
| Tarefa 4 — Transação ACID | [Checkout](src/marketplace.js), [teste](tests/mongodb.test.js) | Compra e rollback validados | Funciona com os modelos da API; falta compatibilizar com os documentos gerados pelo seed. |

O [relatório de entrega](exercicios/RELATORIO-ENTREGA.md) detalha os requisitos e as limitações observadas. Em cada atividade da plataforma, envie o link direto para o arquivo de evidência correspondente.

## Executar

Requisitos: Node.js 18 ou superior, npm e um MongoDB configurado como **replica set** para a API transacional. Os testes automatizados iniciam instâncias MongoDB temporárias; na primeira execução, pode ser necessário baixar o binário do MongoDB.

```powershell
npm ci
Copy-Item .env.example .env
```

Edite `.env` com a URI do seu MongoDB. O arquivo é ignorado pelo Git; publique somente `.env.example`. Em seguida:

```powershell
npm start
```

A API fica em `http://localhost:3000`. As rotas são `POST /usuarios`, `POST /produtos`, `GET /produtos` e `POST /pedidos`. O [roteiro da Parte 2](docs/Parte-2-teste-api.md) mostra os corpos das requisições e a ordem do fluxo. A compra requer saldo na carteira do comprador.

## Seed, análise e testes

```powershell
npm test
npm run seed
npm run report:explain
```

`npm test` passou com 2 testes: fluxo HTTP e transação em replica set temporário; seed completo, agregações e comparação do plano da consulta. Na execução registrada, o índice `{ shippingCity: 1, status: 1, createdAt: -1 }` mudou o plano de `COLLSCAN` para `IXSCAN` e reduziu os documentos examinados de 100.000 para 593. Os tempos medidos foram 124 ms e 4 ms; variam conforme os dados e a máquina.

**Atenção:** `npm run seed` executa `dropDatabase()` no banco indicado pela URI antes de inserir os dados. Use um banco descartável. O seed e a amostra deste repositório foram gerados em um MongoDB temporário; não há banco persistente incluído no repositório.
