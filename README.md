# Marketplace e Engenharia de Dados com MongoDB

Projeto Node.js/Express para os exercícios de marketplace e engenharia de dados. A Parte 1 usa armazenamento em memória; a Parte 3 usa MongoDB/Mongoose. Inclui seed de 106 mil documentos, pipelines de agregação, diagnóstico de índice e checkout transacional.

## Entregas

| Exercício | Implementação | Evidência e apresentação | Situação atual |
|---|---|---|---|
| Parte 1 — Marketplace em memória | [API da Parte 1](parte1/index.js) | [Visão geral e execução](docs/Parte-1-visao-geral.md) | Implementado. |
| Parte 2 — Teste da API | [Reprodução automática](scripts/capture-part2.js) | [Cinco respostas e estoque final](docs/Parte-2-resultado.json) | Executado: pedido de R$ 500 e estoque de 5 para 3. |
| Parte 3 — Persistência | [Modelos Mongoose](src/models.js), [API](src/marketplace.js), [inicialização](src/index.js) | [Teste HTTP](docs/Parte-3-resultado.md), [configuração](.env.example) | Implementado e testado em MongoDB real temporário. |
| Parte 4 — Seed | [Script](scripts/seed.js) | [Amostra do banco](exercicios/Parte-4-amostra.json), [instruções](docs/Parte-4-seed.md) | Executado: 1.000 produtos, 5.000 usuários e 100.000 pedidos. |
| Tarefa 1 — Modelagem | [Schemas](src/models.js) | [SOLUCAO.md](SOLUCAO.md), [explicação detalhada](docs/Tarefa-1-modelagem.md) | JSON, embedding, referências e limite de avaliações documentados. |
| Tarefa 2 — Agregações | [Pipelines](src/analytics.js) | [Relatório com resultados](docs/Tarefa-2-resultados.md), [consultas](docs/Tarefa-2-agregacoes.md) | Executado sobre 100.000 pedidos. |
| Tarefa 3 — Índice ESR | [Script de explain](scripts/explain.js) | [SOLUCAO.md](SOLUCAO.md), [métricas brutas](docs/Tarefa-3-explain.json) | `COLLSCAN` → `IXSCAN` medido na base completa. |
| Tarefa 4 — Transação ACID | [Checkout para a base do seed](src/checkout.js) | [Resultado e rollback](docs/Tarefa-4-resultado.md) | Compra, débito, baixa de estoque e dois casos de falha validados. |

O [relatório de entrega](exercicios/RELATORIO-ENTREGA.md) detalha os requisitos e as limitações observadas. Em cada atividade da plataforma, envie o link direto para o arquivo de evidência correspondente.

## Executar

Requisitos: Node.js 18 ou superior e npm. Para usar MongoDB persistente, configure um servidor como **replica set**. Os testes e o modo de demonstração iniciam um MongoDB temporário; na primeira execução, pode ser necessário baixar o binário do MongoDB.

```powershell
npm ci
npm run dev
```

`npm run dev` inicia a API com MongoDB temporário em `http://localhost:3000`; os dados são descartados ao encerrar. Para usar seu próprio MongoDB persistente, copie `.env.example` para `.env`, ajuste a URI e execute `npm start`:

```powershell
Copy-Item .env.example .env
npm start
```

O arquivo `.env` é ignorado pelo Git; publique somente `.env.example`. As rotas são `POST /usuarios`, `POST /produtos`, `GET /produtos` e `POST /pedidos`. Na versão MongoDB, cadastre o comprador com `saldoInicial: 1000` para demonstrar a compra. A [Parte 1](docs/Parte-1-visao-geral.md) usa IDs numéricos e pode ser iniciada com `node parte1/index.js`; os resultados das chamadas estão na [Parte 2](docs/Parte-2-teste-api.md).

## Seed, análise e testes

```powershell
npm test
npm run capture:part2
npm run report:all
npm run seed
npm run report:explain
```

`npm run capture:part2` atualiza as respostas da API em memória. `npm run report:all` executa seed, agregações, explain e checkout com rollback em um MongoDB temporário e atualiza os relatórios. Na execução registrada, o índice `{ shippingCity: 1, status: 1, createdAt: -1 }` mudou o plano de `COLLSCAN` para `IXSCAN` e reduziu os documentos examinados de 100.000 para 489. Os tempos medidos foram 135 ms e 6 ms; variam conforme os dados e a máquina.

**Atenção:** `npm run seed` executa `dropDatabase()` no banco indicado pela URI antes de inserir os dados. Use um banco descartável. O seed e a amostra deste repositório foram gerados em um MongoDB temporário; não há banco persistente incluído no repositório.
