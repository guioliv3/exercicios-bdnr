const test = require('node:test');
const assert = require('node:assert/strict');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const { seed } = require('../scripts/seed');

test('seed popula as quantidades e campos solicitados em MongoDB', async t => {
  const server = await MongoMemoryServer.create();
  t.after(() => server.stop());
  const counts = await seed({ uri: server.getUri(), dbName: 'seed_test', log: () => {} });
  assert.deepEqual(counts, { products: 1000, users: 5000, orders: 100000 });
  const client = new MongoClient(server.getUri());
  await client.connect();
  t.after(() => client.close());
  const db = client.db('seed_test');
  const order = await db.collection('orders').findOne();
  assert.ok(order.items.length >= 1 && order.items.length <= 4);
  assert.ok(order.items.every(item => item.productId && item.sku && item.category && item.quantity));
  assert.deepEqual(await db.collection('orders').listIndexes().toArray().then(rows => rows.map(row => row.name)), ['_id_']);
  const collection = db.collection('orders');
  const query = { shippingCity: 'São Paulo', status: 'DELIVERED', createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } };
  const before = await collection.find(query).sort({ createdAt: -1 }).explain('executionStats');
  await collection.createIndex({ shippingCity: 1, status: 1, createdAt: -1 });
  const after = await collection.find(query).sort({ createdAt: -1 }).explain('executionStats');
  assert.match(JSON.stringify(before.queryPlanner.winningPlan), /COLLSCAN/);
  assert.match(JSON.stringify(after.queryPlanner.winningPlan), /IXSCAN/);
  console.log('T3_EXPLAIN', JSON.stringify({ before: { executionTimeMillis: before.executionStats.executionTimeMillis, totalDocsExamined: before.executionStats.totalDocsExamined }, after: { executionTimeMillis: after.executionStats.executionTimeMillis, totalDocsExamined: after.executionStats.totalDocsExamined } }));
});
