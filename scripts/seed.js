require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marketplace';
const DB = process.env.MONGO_DB || 'marketplace';
const categories = ['Eletrônicos', 'Livros', 'Casa e Cozinha', 'Esportes', 'Moda'];
const statuses = ['PAID', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELED'];
const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Recife'];
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = list => list[int(0, list.length - 1)];

async function seed({ uri = URI, dbName = DB, log = console.log } = {}) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.dropDatabase();
    const products = Array.from({ length: 1000 }, (_, i) => ({
      _id: new ObjectId(), sku: `SKU-${String(i + 1).padStart(5, '0')}`, name: `Produto Exemplo ${i + 1}`,
      category: pick(categories), price: Number((Math.random() * 500 + 20).toFixed(2)), stock: int(10, 500),
      sellerId: `SELLER-${int(1, 50)}`, active: Math.random() > 0.1
    }));
    const users = Array.from({ length: 5000 }, (_, i) => ({
      _id: new ObjectId(), name: `Cliente ${i + 1}`, email: `cliente${i + 1}@exemplo.com`, city: pick(cities),
      walletBalance: Number((Math.random() * 2000 + 100).toFixed(2)), createdAt: new Date(Date.now() - int(0, 365) * 86400000)
    }));
    await db.collection('products').insertMany(products, { ordered: false });
    await db.collection('users').insertMany(users, { ordered: false });
    for (let batch = 0; batch < 10; batch++) {
      const orders = Array.from({ length: 10000 }, () => {
        const user = pick(users), items = Array.from({ length: int(1, 4) }, () => {
          const p = pick(products), quantity = int(1, 3);
          return { productId: p._id, sku: p.sku, category: p.category, unitPrice: p.price, quantity };
        });
        return {
          userId: user._id, shippingCity: user.city, status: pick(statuses), items,
          totalAmount: Number(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)),
          createdAt: new Date(Date.now() - int(0, 180) * 86400000)
        };
      });
      await db.collection('orders').insertMany(orders, { ordered: false });
      log(`Inseridos ${(batch + 1) * 10000} pedidos`);
    }
    const counts = Object.fromEntries(await Promise.all(['products', 'users', 'orders'].map(async name => [name, await db.collection(name).countDocuments()])));
    log(JSON.stringify(counts));
    return counts;
  } finally { await client.close(); }
}

if (require.main === module) seed().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { seed };
