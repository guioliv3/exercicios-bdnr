# Tarefa 4 — Checkout transacional

Teste em 2026-11-23T22:10:46.377Z no MongoDB com replica set e base do seed.

- Pedido criado: `6b04b9e6ecec63e09e6bce2e`, status **PAID**, quantidade **2**, total **R$ 364.40**.
- Estoque: **259 → 257**. Carteira: **R$ 1314.33 → R$ 949.93**.
- Tentativas com estoque insuficiente e saldo insuficiente falharam; estoque, carteira e contagem de pedidos permaneceram inalterados.
- Pedidos no banco: **100.000 antes; 100.001 após a compra; 100.001 após as duas falhas**.

Implementação: [`src/checkout.js`](../src/checkout.js).
