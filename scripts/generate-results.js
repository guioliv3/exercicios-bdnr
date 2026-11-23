const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { MongoClient } = require('mongodb');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { seed } = require('./seed');
const { revenueByCategoryPipeline, vipCustomersPipeline } = require('../src/analytics');
const { checkout } = require('../src/checkout');

const root = path.resolve(__dirname, '..');
const write = (file, value) => fs.writeFile(path.join(root, file), value);

async function main() {
  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const client = new MongoClient(repl.getUri());
  try {
    const counts = await seed({ uri: repl.getUri(), dbName: 'marketplace', log: () => {} });
    assert.deepEqual(counts, { products: 1000, users: 5000, orders: 100000 });
    await client.connect();
    const db = client.db('marketplace'), orders = db.collection('orders');
    const sample = {};
    for (const name of ['products', 'users', 'orders']) sample[name] = await db.collection(name).findOne();
    await write('exercicios/Parte-4-amostra.json', JSON.stringify({ generatedAt: new Date().toISOString(), counts, sample }, null, 2) + '\n');

    const since90 = new Date(Date.now() - 90 * 86400000);
    const revenue = await orders.aggregate(revenueByCategoryPipeline(since90)).toArray();
    const vip = (await orders.aggregate(vipCustomersPipeline('São Paulo')).toArray())[0];
    assert.equal(revenue.length, 5);
    assert.equal(vip.data.length, 10);
    assert.ok(vip.metadata[0].eligibleCustomers >= 10);
    const result = [
      '# Tarefa 2 — Resultados das agregações',
      '',
      `Executado em ${new Date().toISOString()} sobre **100.000 pedidos, 5.000 usuários e 1.000 produtos** no MongoDB. A data de corte do faturamento é ${since90.toISOString()}. Os valores variam a cada seed, pois os dados são aleatórios.`,
      '',
      '## Faturamento por categoria nos últimos 90 dias',
      '',
      '| Categoria | Faturamento (R$) | Itens vendidos |',
      '|---|---:|---:|',
      ...revenue.map(row => `| ${row._id} | ${row.revenue.toFixed(2)} | ${row.itemsSold} |`),
      '',
      '## Clientes VIP de São Paulo — página 1',
      '',
      `Clientes elegíveis: **${vip.metadata[0].eligibleCustomers}**. Pedidos com status PAID, SHIPPED ou DELIVERED.`,
      '',
      '| Cliente | E-mail | Total gasto (R$) | Pedidos |',
      '|---|---|---:|---:|',
      ...vip.data.map(row => `| ${row.name} | ${row.email} | ${row.totalSpent.toFixed(2)} | ${row.orderCount} |`),
      ''
    ].join('\n');
    await write('docs/Tarefa-2-resultados.md', result);

    const query = { shippingCity: 'São Paulo', status: 'DELIVERED', createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } };
    const before = await orders.find(query).sort({ createdAt: -1 }).explain('executionStats');
    await orders.createIndex({ shippingCity: 1, status: 1, createdAt: -1 });
    const after = await orders.find(query).sort({ createdAt: -1 }).explain('executionStats');
    const metrics = {
      before: { executionTimeMillis: before.executionStats.executionTimeMillis, stage: 'COLLSCAN', totalDocsExamined: before.executionStats.totalDocsExamined },
      after: { executionTimeMillis: after.executionStats.executionTimeMillis, stage: 'IXSCAN', totalDocsExamined: after.executionStats.totalDocsExamined }
    };
    assert.match(JSON.stringify(before.queryPlanner.winningPlan), /COLLSCAN/);
    assert.match(JSON.stringify(after.queryPlanner.winningPlan), /IXSCAN/);
    assert.ok(metrics.after.totalDocsExamined < metrics.before.totalDocsExamined);
    await write('docs/Tarefa-3-explain.json', JSON.stringify({ generatedAt: new Date().toISOString(), documents: 100000, index: { shippingCity: 1, status: 1, createdAt: -1 }, metrics }, null, 2) + '\n');

    const user = await db.collection('users').findOne({ walletBalance: { $gte: 1000 } });
    const product = await db.collection('products').findOne({ active: true, price: { $gte: 150, $lte: 200 }, stock: { $gte: 2 } });
    assert.ok(user && product);
    const paid = await checkout({ client, userId: user._id, productId: product._id, quantity: 2 });
    const stockAfter = (await db.collection('products').findOne({ _id: product._id })).stock;
    const balanceAfter = (await db.collection('users').findOne({ _id: user._id })).walletBalance;
    assert.equal(stockAfter, product.stock - 2);
    assert.ok(Math.abs(balanceAfter - (user.walletBalance - paid.totalAmount)) < 0.001);
    assert.equal(paid.status, 'PAID');
    assert.equal(await orders.countDocuments(), 100001);
    await assert.rejects(checkout({ client, userId: user._id, productId: product._id, quantity: product.stock + 1 }), /estoque/i);
    const lowBalanceUser = await db.collection('users').findOne({ walletBalance: { $lt: product.price } });
    assert.ok(lowBalanceUser);
    await assert.rejects(checkout({ client, userId: lowBalanceUser._id, productId: product._id, quantity: 1 }), /saldo/);
    assert.equal((await db.collection('products').findOne({ _id: product._id })).stock, stockAfter);
    assert.equal((await db.collection('users').findOne({ _id: user._id })).walletBalance, balanceAfter);
    assert.equal(await orders.countDocuments(), 100001);
    await write('docs/Tarefa-4-resultado.md', [
      '# Tarefa 4 — Checkout transacional', '',
      `Teste em ${new Date().toISOString()} no MongoDB com replica set e base do seed.`, '',
      `- Pedido criado: \`${paid._id}\`, status **${paid.status}**, quantidade **2**, total **R$ ${paid.totalAmount.toFixed(2)}**.`,
      `- Estoque: **${product.stock} → ${stockAfter}**. Carteira: **R$ ${user.walletBalance.toFixed(2)} → R$ ${balanceAfter.toFixed(2)}**.`,
      '- Tentativas com estoque insuficiente e saldo insuficiente falharam; estoque, carteira e contagem de pedidos permaneceram inalterados.',
      '- Pedidos no banco: **100.000 antes; 100.001 após a compra; 100.001 após as duas falhas**.', '',
      'Implementação: [`src/checkout.js`](../src/checkout.js).', ''
    ].join('\n'));
    console.log(JSON.stringify({ counts, revenueCategories: revenue.length, vipCustomers: vip.metadata[0].eligibleCustomers, explain: metrics, checkoutOrderId: paid._id.toString() }, null, 2));
  } finally { await client.close(); await repl.stop(); }
}

if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { main };
