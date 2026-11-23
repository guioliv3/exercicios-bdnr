const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { User, Product, Order } = require('../src/models');
const { createApp } = require('../src/marketplace');
const { revenueByCategoryPipeline, vipCustomersPipeline } = require('../src/analytics');

test('fluxo do marketplace, agregaÃ§Ãµes, rollback e Ã­ndice', async t => {
  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(repl.getUri());
  const server = createApp().listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (path, body) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  t.after(async () => { server.close(); await mongoose.disconnect(); await repl.stop(); });

  const sellerRes = await post('/usuarios', { nome: 'Loja Tech', tipo: 'vendedor' });
  const buyerRes = await post('/usuarios', { nome: 'JoÃ£o Silva', tipo: 'comprador' });
  assert.equal(sellerRes.status, 201); assert.equal(buyerRes.status, 201);
  const seller = await sellerRes.json(), buyer = await buyerRes.json();
  await User.updateOne({ _id: buyer._id }, { $set: { walletBalance: 1000 } });
  const productRes = await post('/produtos', { vendedorId: seller._id, nome: 'Teclado MecÃ¢nico', preco: 250, estoque: 5 });
  assert.equal(productRes.status, 201);
  const product = await productRes.json();
  assert.equal((await (await fetch(base + '/produtos')).json()).length, 1);
  const badPurchase = await post('/pedidos', { compradorId: buyer._id, produtoId: product._id, quantidade: 99 });
  assert.equal(badPurchase.status, 400);
  assert.equal((await Product.findById(product._id)).stock, 5);
  const purchase = await post('/pedidos', { compradorId: buyer._id, produtoId: product._id, quantidade: 2 });
  assert.equal(purchase.status, 201, JSON.stringify(await purchase.clone().json()));
  assert.equal((await Product.findById(product._id)).stock, 3);
  assert.equal((await User.findById(buyer._id)).walletBalance, 500);
  assert.equal(await Order.countDocuments(), 1);

  const now = new Date(), old = new Date(Date.now() - 100 * 86400000);
  await mongoose.connection.collection('users').insertOne({ _id: new mongoose.Types.ObjectId(), name: 'Cliente SP', email: 'sp@example.com' });
  const [sp] = await mongoose.connection.collection('users').find({ name: 'Cliente SP' }).toArray();
  await mongoose.connection.collection('orders').insertMany([
    { userId: sp._id, shippingCity: 'SP', status: 'PAID', totalAmount: 120, createdAt: now, items: [{ category: 'Livros', unitPrice: 20, quantity: 6 }] },
    { userId: sp._id, shippingCity: 'SP', status: 'DELIVERED', totalAmount: 50, createdAt: old, items: [{ category: 'Livros', unitPrice: 10, quantity: 5 }] }
  ]);
  const orders = mongoose.connection.collection('orders');
  const revenue = await orders.aggregate(revenueByCategoryPipeline(new Date(Date.now() - 90 * 86400000))).toArray();
  assert.equal(revenue.find(row => row._id === 'Livros').revenue, 120);
  const vip = (await orders.aggregate(vipCustomersPipeline('SP')).toArray())[0];
  assert.equal(vip.metadata[0].eligibleCustomers, 1);
  assert.equal(vip.data[0].totalSpent, 170);
  await orders.createIndex({ shippingCity: 1, status: 1, createdAt: -1 });
  const plan = await orders.find({ shippingCity: 'SP', status: 'DELIVERED', createdAt: { $gte: old } }).sort({ createdAt: -1 }).explain('executionStats');
  assert.match(JSON.stringify(plan.queryPlanner.winningPlan), /IXSCAN/);
});
