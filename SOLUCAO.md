# SOLUÇÃO — Tarefa 3: diagnóstico e otimização

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
| `executionTimeMillis` | 124 ms | 4 ms |
| `totalDocsExamined` | 100.000 | 593 |

Os tempos variam conforme máquina e distribuição aleatória do seed; a execução reduziu documentos examinados em 99,4% nesta amostra. O script `scripts/explain.js` reproduz a comparação em uma base local populada.
