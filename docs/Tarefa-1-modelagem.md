# Tarefa 1 — Modelagem e evolução de schema

## Coleções e exemplos

`products` mantém as avaliações recentes incorporadas ao produto. A leitura do produto e suas dez avaliações mais recentes é uma única leitura; o array é limitado a dez por atualização, evitando o array ilimitado e o teto BSON de 16 MiB.

```json
{"_id":"ObjectId","name":"Teclado","reviews":[{"rating":5,"comment":"Ótimo","date":"2026-11-23T12:00:00Z","author":"ObjectId"}]}
```

```js
db.products.updateOne({_id: productId}, {$push: {reviews: {$each: [review], $sort: {date: -1}, $slice: 10}}})
```

`orders.statusHistory` é incorporado porque o histórico pertence ao pedido e costuma ser lido junto com ele. O tamanho cresce com as transições do pedido, que são naturalmente poucas; se isso deixar de ser verdade, deve migrar para `orderEvents` referenciados.

```json
{"_id":"ObjectId","status":"SHIPPED","statusHistory":[{"status":"PAID","date":"2026-11-20T12:00:00Z","responsible":"ObjectId"},{"status":"SHIPPED","date":"2026-11-21T12:00:00Z","responsible":"ObjectId"}]}
```

Dados do usuário e produto continuam referenciados pelos pedidos: são entidades compartilhadas e atualizáveis. Dados necessários para relatórios de vendas (categoria e preço unitário) são fotografados em cada item do pedido para preservar a história e evitar consultas adicionais.

## Decisões

- `reviews`: embedding limitado a 10; otimiza a tela do produto sem risco de crescimento ilimitado.
- `statusHistory`: embedding; histórico curto e agregado ao ciclo de vida do pedido.
- `buyerId`, `productId`, `author`, `responsible`: referências a entidades compartilhadas.
- itens do pedido: snapshot de categoria/preço e referência ao produto; preserva dados de venda.

Os schemas Mongoose correspondentes estão em `src/models.js`.
