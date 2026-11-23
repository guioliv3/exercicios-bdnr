const express = require('express');

function createApp() {
  const app = express();
  app.use(express.json());
  const users = [], products = [], orders = [];

  app.post('/usuarios', (req, res) => {
    const { nome, tipo } = req.body;
    if (typeof nome !== 'string' || !nome.trim() || !['vendedor', 'comprador'].includes(tipo)) {
      return res.status(400).json({ erro: 'Informe nome e tipo válido (vendedor/comprador).' });
    }
    const user = { id: users.length + 1, nome: nome.trim(), tipo };
    users.push(user);
    res.status(201).json(user);
  });

  app.post('/produtos', (req, res) => {
    const { vendedorId, nome, preco, estoque } = req.body;
    if (!users.some(user => user.id === vendedorId && user.tipo === 'vendedor')) {
      return res.status(403).json({ erro: 'Vendedor não encontrado ou sem permissão.' });
    }
    if (typeof nome !== 'string' || !nome.trim() || !Number.isFinite(preco) || preco < 0 || !Number.isInteger(estoque) || estoque < 0) {
      return res.status(400).json({ erro: 'Informe nome, preço e estoque válidos.' });
    }
    const product = { id: products.length + 1, vendedorId, nome: nome.trim(), preco, estoque };
    products.push(product);
    res.status(201).json(product);
  });

  app.get('/produtos', (_req, res) => res.json(products.filter(product => product.estoque > 0)));

  app.post('/pedidos', (req, res) => {
    const { compradorId, produtoId, quantidade } = req.body;
    if (!users.some(user => user.id === compradorId && user.tipo === 'comprador')) {
      return res.status(403).json({ erro: 'Comprador inválido.' });
    }
    if (!Number.isInteger(quantidade) || quantidade < 1) {
      return res.status(400).json({ erro: 'Quantidade deve ser um inteiro positivo.' });
    }
    const product = products.find(item => item.id === produtoId);
    if (!product || product.estoque < quantidade) {
      return res.status(400).json({ erro: 'Produto indisponível ou estoque insuficiente.' });
    }
    product.estoque -= quantidade;
    const order = { id: orders.length + 1, compradorId, produtoId, quantidade, valorTotal: Number((product.preco * quantidade).toFixed(2)), data: new Date().toISOString() };
    orders.push(order);
    res.status(201).json(order);
  });
  return app;
}

if (require.main === module) createApp().listen(3000, () => console.log('Marketplace em memória em http://localhost:3000'));
module.exports = { createApp };
