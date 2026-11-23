require('dotenv').config();
const { MongoClient } = require('mongodb');
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marketplace';
const since = new Date(Date.now() - 30 * 86400000);
const query = { shippingCity: 'São Paulo', status: 'DELIVERED', createdAt: { $gte: since } };

async function main() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const orders = client.db(process.env.MONGO_DB || 'marketplace').collection('orders');
    const before = await orders.find(query).sort({ createdAt: -1 }).explain('executionStats');
    console.log('ANTES', JSON.stringify({ executionTimeMillis: before.executionStats.executionTimeMillis, stage: before.queryPlanner.winningPlan, totalDocsExamined: before.executionStats.totalDocsExamined }, null, 2));
    await orders.createIndex({ shippingCity: 1, status: 1, createdAt: -1 });
    const after = await orders.find(query).sort({ createdAt: -1 }).explain('executionStats');
    console.log('DEPOIS', JSON.stringify({ executionTimeMillis: after.executionStats.executionTimeMillis, stage: after.queryPlanner.winningPlan, totalDocsExamined: after.executionStats.totalDocsExamined }, null, 2));
  } finally { await client.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
