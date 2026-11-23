const { ObjectId } = require('mongodb');

async function checkout({ client, dbName = 'marketplace', userId, productId, quantity }) {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId) || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error('IDs e quantidade devem ser válidos.');
  }
  const userKey = new ObjectId(userId), productKey = new ObjectId(productId);
  const db = client.db(dbName);
  const session = client.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const product = await db.collection('products').findOne({ _id: productKey, active: true }, { session });
      if (!product || product.stock < quantity) throw new Error('Produto indisponível ou estoque insuficiente.');
      const user = await db.collection('users').findOne({ _id: userKey }, { session });
      const totalAmount = Number((product.price * quantity).toFixed(2));
      if (!user || user.walletBalance < totalAmount) throw new Error('Usuário inexistente ou saldo insuficiente.');
      const stock = await db.collection('products').updateOne(
        { _id: productKey, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { session }
      );
      if (stock.modifiedCount !== 1) throw new Error('Estoque insuficiente.');
      const wallet = await db.collection('users').updateOne(
        { _id: userKey, walletBalance: { $gte: totalAmount } }, { $inc: { walletBalance: -totalAmount } }, { session }
      );
      if (wallet.modifiedCount !== 1) throw new Error('Saldo insuficiente.');
      order = {
        userId: userKey, shippingCity: user.city, status: 'PAID',
        items: [{ productId: productKey, sku: product.sku, category: product.category, unitPrice: product.price, quantity }],
        totalAmount, createdAt: new Date(),
        statusHistory: [{ status: 'PAID', date: new Date(), responsible: userKey }]
      };
      const result = await db.collection('orders').insertOne(order, { session });
      order._id = result.insertedId;
    }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
    return order;
  } finally { await session.endSession(); }
}

module.exports = { checkout };
