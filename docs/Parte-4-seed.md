# Parte 4 — Script de seed

`scripts/seed.js` insere com `insertMany`: 1.000 produtos, 5.000 usuários e 100.000 pedidos em dez lotes de 10.000. Não cria índices adicionais, conforme pedido; índices automáticos do MongoDB em `_id` permanecem. A amostra gerada deve conter:

```js
db.products.findOne()
db.users.findOne()
db.orders.findOne()
```

Após executar, valide com `db.products.countDocuments()`, `db.users.countDocuments()` e `db.orders.countDocuments()` (esperados: 1.000, 5.000 e 100.000). Uma amostra real dos três tipos de documento está em [Parte-4-amostra.json](../exercicios/Parte-4-amostra.json). **Atenção:** o script executa `dropDatabase()` no banco configurado antes de semear; use uma base de exercícios descartável.
