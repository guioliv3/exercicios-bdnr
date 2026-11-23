# Parte 2 — Teste da API

Suba MongoDB com replica set ativo, configure `.env` copiando `.env.example`, rode `npm install` e `npm start`. Teste com Postman/Insomnia ou `curl` em `http://localhost:3000` na sequência:

1. `POST /usuarios` com `{"nome":"Loja Tech","tipo":"vendedor"}` e guarde `_id`.
2. `POST /usuarios` com `{"nome":"João Silva","tipo":"comprador"}` e guarde `_id`. Para a compra da Parte 2, o saldo inicial deve ser pelo menos R$ 500; o schema começa com zero, então use MongoDB Compass para definir `walletBalance: 1000` neste comprador.
3. `POST /produtos` com `{"vendedorId":"<id vendedor>","nome":"Teclado Mecânico","preco":250,"estoque":5}`.
4. `GET /produtos` confirma o produto disponível e vendedor populado.
5. `POST /pedidos` com `{"compradorId":"<id comprador>","produtoId":"<id produto>","quantidade":2}` cria pedido pago e reduz estoque para três.

O teste automatizado reproduz o fluxo completo e verifica as respostas HTTP, estoque e carteira após a compra, assim como falha sem alterações para quantidade indisponível.
