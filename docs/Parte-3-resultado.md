# Parte 3 — Persistência MongoDB/Mongoose

A API em `src/` foi iniciada com `npm run dev`, que sobe um MongoDB temporário em replica set. O mesmo código pode ser iniciado com `npm start` apontando `MONGO_URI` para um servidor persistente.

Teste HTTP real: foram cadastrados vendedor, comprador com `saldoInicial: 1000` e produto com preço R$ 250 e estoque 5. `GET /produtos` retornou o produto; `POST /pedidos` com quantidade 2 criou pedido `PAID` de R$ 500. Um segundo `GET /produtos` mostrou estoque **3**. O teste automatizado confirmou que a carteira passou de R$ 1.000 para R$ 500.

O modo `dev` descarta os dados ao encerrar. Para persistência entre execuções, copie `.env.example` para `.env`, informe a URI do MongoDB local ou Atlas e use `npm start`. A URI não é publicada no repositório.
