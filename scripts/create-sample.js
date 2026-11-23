const fs = require('node:fs/promises');
const path = require('node:path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const { seed } = require('./seed');

async function main() {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();
  const client = new MongoClient(uri);
  try {
    await seed({ uri, dbName: 'marketplace', log: () => {} });
    await client.connect();
    const db = client.db('marketplace');
    const sample = {};
    for (const name of ['products', 'users', 'orders']) sample[name] = await db.collection(name).findOne();
    const output = path.resolve(__dirname, '../exercicios/Parte-4-amostra.json');
    await fs.writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), counts: { products: 1000, users: 5000, orders: 100000 }, sample }, null, 2));
    console.log(output);
  } finally { await client.close(); await server.stop(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
