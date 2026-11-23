# Tarefa 1 — Modelagem e evolução de schema

## Avaliações de produtos

`products` guarda o resumo e apenas as dez avaliações mais recentes. A tela lê um documento e calcula a média por `reviewSummary.sum / reviewSummary.count`. A coleção `reviews` guarda o histórico completo, referenciando produto e autor. Assim, dezenas de milhares de avaliações não aumentam indefinidamente o documento do produto.

```json
{
  "products": {
    "_id": "ObjectId(produto)", "name": "Teclado", "price": 250,
    "reviewSummary": { "count": 12345, "sum": 55555 },
    "reviews": [{ "rating": 5, "comment": "Ótimo", "date": "2026-11-23T12:00:00Z", "author": "ObjectId(usuario)" }]
  },
  "reviews": {
    "_id": "ObjectId(avaliacao)", "productId": "ObjectId(produto)",
    "author": "ObjectId(usuario)", "rating": 5, "comment": "Ótimo", "date": "2026-11-23T12:00:00Z"
  }
}
```

Ao inserir uma avaliação na coleção completa, a atualização do produto incrementa `reviewSummary.count` e `sum` e mantém a lista incorporada limitada a dez:

```js
db.products.updateOne({_id: productId}, {
  $inc: {'reviewSummary.count': 1, 'reviewSummary.sum': rating},
  $push: {reviews: {$each: [review], $sort: {date: -1}, $slice: 10}}
})
```

Se as duas gravações precisarem ser indivisíveis, devem ocorrer na mesma transação. O índice de `reviews` em `{productId: 1, date: -1}` permite consultar o histórico completo por produto.

## Auditoria de pedidos

`orders` incorpora `statusHistory`, porque cada mudança pertence ao pedido e o fluxo normal tem poucas transições. O documento contém status, data e responsável; `buyerId` e `productId` são referências a entidades compartilhadas. Se o processo passar a permitir transições ilimitadas, o histórico deve sair para uma coleção `orderEvents` com índice por pedido e data.

```json
{
  "_id": "ObjectId(pedido)", "buyerId": "ObjectId(usuario)",
  "productId": "ObjectId(produto)", "status": "SHIPPED",
  "statusHistory": [
    { "status": "PAID", "date": "2026-11-20T12:00:00Z", "responsible": "ObjectId(usuario)" },
    { "status": "SHIPPED", "date": "2026-11-21T12:00:00Z", "responsible": "ObjectId(usuario)" }
  ]
}
```

Preço e categoria no item do pedido são fotografados no momento da compra para preservar o valor histórico dos relatórios. Os schemas Mongoose correspondentes estão em `src/models.js`.
