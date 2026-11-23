# SOLUÇÃO — Engenharia de Dados com MongoDB

<a id="tarefa-1"></a>

## Tarefa 1 — Modelagem e evolução de schema

Um produto popular mantém somente as dez avaliações mais recentes incorporadas. O total e a soma das notas ficam no próprio produto; a média exibida é `sum / count`. A coleção `reviews` preserva todas as avaliações, com referências ao produto e ao autor:

```json
{
  "products": {
    "_id": "ObjectId(produto)", "name": "Teclado",
    "reviewSummary": { "count": 12345, "sum": 55555 },
    "reviews": [{ "rating": 5, "comment": "Ótimo", "date": "2026-11-23T12:00:00Z", "author": "ObjectId(usuario)" }]
  },
  "reviews": {
    "_id": "ObjectId(avaliacao)", "productId": "ObjectId(produto)",
    "author": "ObjectId(usuario)", "rating": 5, "comment": "Ótimo", "date": "2026-11-23T12:00:00Z"
  }
}
```

O limite de dez é mantido com `$push`, `$sort` por data e `$slice: 10`; isso impede que o array de avaliações faça o documento atingir 16 MiB e permite ler média, contagem e avaliações recentes em uma única consulta ao produto. O histórico completo fica na coleção referenciada, indexada por `productId` e `date`. A inserção da avaliação e a atualização do resumo devem ocorrer na mesma transação quando for exigida consistência atômica.

O histórico de status fica incorporado ao pedido, pois pertence ao seu ciclo de vida e normalmente tem poucas transições. Usuário e produto são referenciados porque são entidades compartilhadas:

```json
{
  "_id": "ObjectId(pedido)", "buyerId": "ObjectId(usuario)",
  "productId": "ObjectId(produto)", "status": "SHIPPED",
  "statusHistory": [
    { "status": "PENDING", "date": "2026-11-20T10:00:00Z", "responsible": "ObjectId(usuario)" },
    { "status": "PAID", "date": "2026-11-20T12:00:00Z", "responsible": "ObjectId(usuario)" },
    { "status": "SHIPPED", "date": "2026-11-21T12:00:00Z", "responsible": "ObjectId(usuario)" }
  ]
}
```

Se as mudanças de status passarem a ser ilimitadas, o histórico deve migrar para uma coleção `orderEvents` referenciada pelo pedido. A modelagem detalhada está em [Tarefa-1-modelagem.md](docs/Tarefa-1-modelagem.md).

<a id="tarefa-3"></a>

## Tarefa 3 — Diagnóstico e otimização

Consulta-alvo equivalente à instrução: cidade e status são igualdades; `createdAt` delimita o período recente e define a ordem descendente.

```js
db.orders.find({shippingCity:'São Paulo',status:'DELIVERED',createdAt:{$gte:new Date(Date.now()-30*86400000)}}).sort({createdAt:-1})
```

Índice composto pela regra ESR: `{shippingCity: 1, status: 1, createdAt: -1}`. As duas igualdades vêm antes do campo usado para ordenação e intervalo; a direção descendente permite atender o sort sem ordenar todos os documentos em memória.

Rode `npm run report:explain` antes/depois do índice. O script imprime `executionTimeMillis`, estágio do plano vencedor e `totalDocsExamined` nos dois casos. Após criar o índice, o plano esperado inclui `IXSCAN` em vez de `COLLSCAN`; com seletividade adequada, documentos examinados caem para os resultados correspondentes. O MongoDB pode escolher `COLLSCAN` em coleções pequenas ou quando a consulta retorna grande parte dos documentos.

## Resultado medido

O teste executou a consulta no MongoDB temporário com 100.000 pedidos, mediu o plano antes e depois do índice e verificou `COLLSCAN` → `IXSCAN`:

| Métrica | Antes | Depois |
|---|---:|---:|
| `executionTimeMillis` | 135 ms | 6 ms |
| Estágio do plano | `COLLSCAN` | `IXSCAN` |
| `totalDocsExamined` | 100.000 | 489 |

Os tempos variam conforme máquina e distribuição aleatória do seed; a execução reduziu documentos examinados em 99,5% nesta amostra. Os dados brutos estão em [Tarefa-3-explain.json](docs/Tarefa-3-explain.json). O script `scripts/explain.js` reproduz a comparação em uma base local populada.
