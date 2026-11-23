const mongoose = require('mongoose');
const { User, Product, Order } = require('./models');

function createApp() {
  const app = require('express')();
  app.use(require('express').json());

  app.post('/usuarios', async (req, res) => {
    try {
      const user = await User.create({ name: req.body.nome, type: req.body.tipo });
      res.status(201).json(user);
    } catch (e) { res.status(400).json({ erro: 'Dados inválidos para cadastro.', detalhes: e.message }); }
  });

  app.post('/produtos', async (req, res) => {
    try {
      const { vendedorId, nome, preco, estoque } = req.body;
      const seller = await User.findOne({ _id: vendedorId, type: 'vendedor' });
      if (!seller) return res.status(403).json({ erro: 'Vendedor não encontrado ou sem permissão.' });
      res.status(201).json(await Product.create({ sellerId: vendedorId, name: nome, price: preco, stock: estoque }));
    } catch (e) { res.status(400).json({ erro: 'Erro ao cadastrar produto.', detalhes: e.message }); }
  });

  app.get('/produtos', async (_req, res) => {
    try {
      res.json(await Product.find({ stock: { $gt: 0 }, active: true }).populate('sellerId', 'name'));
    } catch (e) { res.status(500).json({ erro: 'Erro ao buscar produtos.', detalhes: e.message }); }
  });

  app.post('/pedidos', async (req, res) => {
    const { compradorId, produtoId, quantidade } = req.body;
    if (!Number.isInteger(quantidade) || quantidade < 1) return res.status(400).json({ erro: 'Quantidade deve ser um inteiro positivo.' });
    const session = await mongoose.startSession();
    try {
      let created;
      await session.withTransaction(async () => {
        const buyer = await User.findOne({ _id: compradorId, type: 'comprador' }).session(session);
        if (!buyer) { const e = new Error('Comprador inválido.'); e.status = 403; throw e; }
        const product = await Product.findOneAndUpdate(
          { _id: produtoId, stock: { $gte: quantidade }, active: true },
          { $inc: { stock: -quantidade } }, { new: true, session }
        );
        if (!product) { const e = new Error('Produto indisponível ou estoque insuficiente.'); e.status = 400; throw e; }
        const total = Number((product.price * quantidade).toFixed(2));
        if (buyer.walletBalance < total) { const e = new Error('Saldo insuficiente.'); e.status = 400; throw e; }
        const debit = await User.updateOne({ _id: buyer._id, walletBalance: { $gte: total } }, { $inc: { walletBalance: -total } }, { session });
        if (debit.modifiedCount !== 1) { const e = new Error('Saldo insuficiente.'); e.status = 400; throw e; }
        [created] = await Order.create([{
          buyerId: buyer._id, productId: product._id, quantity: quantidade, total, status: 'PAID',
          statusHistory: [{ status: 'PAID', responsible: buyer._id }]
        }], { session });
      }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
      res.status(201).json(created);
    } catch (e) { res.status(e.status || 400).json({ erro: e.message }); }
    finally { await session.endSession(); }
  });

  return app;
}

module.exports = { createApp };
