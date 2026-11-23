# Respostas obtidas no MongoDB

Estes são os resultados da execução registrada em 23/11/2026 com um processo real do MongoDB iniciado temporariamente em replica set. O seed gera dados aleatórios; ao executá-lo novamente, valores e identificadores mudam. Os arquivos vinculados contêm as evidências e o código para reproduzir cada resultado.

## Parte 3 — API com persistência

Um comprador com saldo inicial de **R$ 1.000,00** comprou **2** unidades de um produto de **R$ 250,00**. A API retornou pedido **PAID** de **R$ 500,00**. O estoque passou de **5 para 3** e a carteira de **R$ 1.000,00 para R$ 500,00**. [Registro do teste HTTP](Parte-3-resultado.md).

## Parte 4 — Seed

O MongoDB recebeu **1.000 produtos**, **5.000 usuários** e **100.000 pedidos**. A [amostra JSON](../exercicios/Parte-4-amostra.json) contém documentos das três coleções; o [roteiro do seed](Parte-4-seed.md) explica a execução.

## Tarefa 2 — Agregações

Faturamento por categoria nos 90 dias anteriores à execução, calculado sobre os pedidos elegíveis:

| Categoria | Faturamento (R$) | Itens vendidos |
|---|---:|---:|
| Moda | 8.446.735,77 | 30.034 |
| Livros | 8.303.494,62 | 30.454 |
| Eletrônicos | 7.885.713,46 | 29.056 |
| Casa e Cozinha | 7.821.626,90 | 30.751 |
| Esportes | 7.167.170,86 | 27.998 |

Foram encontrados **805 clientes VIP de São Paulo**. Primeira página, ordenada pelo valor gasto:

| Cliente | E-mail | Total gasto (R$) | Pedidos |
|---|---|---:|---:|
| Cliente 49 | cliente49@exemplo.com | 38.703,71 | 25 |
| Cliente 3026 | cliente3026@exemplo.com | 36.762,87 | 22 |
| Cliente 816 | cliente816@exemplo.com | 35.269,47 | 22 |
| Cliente 3677 | cliente3677@exemplo.com | 35.169,38 | 20 |
| Cliente 1281 | cliente1281@exemplo.com | 35.149,32 | 25 |
| Cliente 1989 | cliente1989@exemplo.com | 32.299,69 | 18 |
| Cliente 1943 | cliente1943@exemplo.com | 31.426,16 | 18 |
| Cliente 4512 | cliente4512@exemplo.com | 30.790,45 | 18 |
| Cliente 505 | cliente505@exemplo.com | 30.778,31 | 18 |
| Cliente 3883 | cliente3883@exemplo.com | 30.681,19 | 21 |

[Relatório da execução](Tarefa-2-resultados.md) · [Pipelines](Tarefa-2-agregacoes.md).

## Tarefa 3 — `explain` e índice

Índice aplicado: `{ shippingCity: 1, status: 1, createdAt: -1 }`.

| Métrica | Antes | Depois |
|---|---:|---:|
| Plano | `COLLSCAN` | `IXSCAN` |
| `executionTimeMillis` | 135 ms | 6 ms |
| `totalDocsExamined` | 100.000 | 489 |

[Resposta e justificativa](../SOLUCAO.md#tarefa-3) · [Saída do `explain`](Tarefa-3-explain.json).

## Tarefa 4 — Transação de checkout

O pedido `6b04b9e6ecec63e09e6bce2e` foi criado com status **PAID**, **2** unidades e total de **R$ 364,40**. O estoque passou de **259 para 257**, a carteira de **R$ 1.314,33 para R$ 949,93** e o número de pedidos de **100.000 para 100.001**. Tentativas posteriores com estoque insuficiente e saldo insuficiente não alteraram estoque, carteira ou contagem de pedidos. [Resultado e rollback](Tarefa-4-resultado.md) · [Função de checkout](../src/checkout.js).

## Onde estão as demais respostas

A **Tarefa 1** pede uma proposta de modelagem, entregue em [SOLUCAO.md](../SOLUCAO.md#tarefa-1). A **Parte 1** implementa a API em memória; a **Parte 2** entrega as respostas das requisições a essa API em [Parte-2-resultado.json](Parte-2-resultado.json). Essas duas partes não produzem respostas de consultas ao MongoDB.
