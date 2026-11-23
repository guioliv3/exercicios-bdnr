# Tarefa 2 — Aggregation Framework

Os dois pipelines ficam em `src/analytics.js` e rodam no servidor com `collection.aggregate(...)`.

1. **Faturamento por categoria**: filtra `PAID`, `SHIPPED`, `DELIVERED` e os últimos 90 dias; abre os itens com `$unwind`; agrupa por categoria para somar preço × quantidade e unidades; ordena receita decrescente.
2. **Clientes VIP**: filtra pedidos elegíveis de São Paulo; agrupa por usuário somando total gasto e pedidos; ordena; usa `$facet` para buscar a página com `$lookup` de nome/e-mail e retornar a contagem total na mesma consulta.

Execução em `mongosh` com a base preenchida pelo seed:

```js
db.orders.aggregate([
  {$match:{status:{$in:['PAID','SHIPPED','DELIVERED']},createdAt:{$gte:new Date(Date.now()-90*86400000)}}},
  {$unwind:'$items'},
  {$group:{_id:'$items.category',revenue:{$sum:{$multiply:['$items.unitPrice','$items.quantity']}},itemsSold:{$sum:'$items.quantity'}}},
  {$sort:{revenue:-1}}
])
db.orders.aggregate([
  {$match:{shippingCity:'São Paulo',status:{$in:['PAID','SHIPPED','DELIVERED']}}},
  {$group:{_id:'$userId',totalSpent:{$sum:'$totalAmount'},orderCount:{$sum:1}}},
  {$sort:{totalSpent:-1,_id:1}},
  {$facet:{data:[{$skip:0},{$limit:10},{$lookup:{from:'users',localField:'_id',foreignField:'_id',as:'user'}},{$unwind:'$user'},{$project:{_id:0,userId:'$_id',name:'$user.name',email:'$user.email',totalSpent:1,orderCount:1}}],metadata:[{$count:'eligibleCustomers'}]}}
])
```

Os pipelines foram executados no MongoDB sobre a base completa do seed. As tabelas de faturamento, os dez clientes da primeira página e a contagem total de clientes elegíveis estão em [Tarefa-2-resultados.md](Tarefa-2-resultados.md). Para gerar uma nova amostra, rode `npm run report:all`.
