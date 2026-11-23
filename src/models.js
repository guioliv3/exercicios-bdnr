const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['vendedor', 'comprador'], required: true },
  email: { type: String, trim: true, lowercase: true },
  city: { type: String, trim: true },
  walletBalance: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: 'Geral' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },
  reviewSummary: {
    count: { type: Number, default: 0, min: 0 },
    sum: { type: Number, default: 0, min: 0 }
  },
  reviews: [{
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 2000 },
    date: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }]
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 2000 },
  date: { type: Date, default: Date.now }
});
reviewSchema.index({ productId: 1, date: -1 });

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED'], default: 'PAID' },
  statusHistory: [{
    status: { type: String, enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED'], required: true },
    date: { type: Date, default: Date.now },
    responsible: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }]
}, { timestamps: true });

productSchema.index({ active: 1, category: 1 });
orderSchema.index({ 'statusHistory.date': -1 });

module.exports = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Product: mongoose.models.Product || mongoose.model('Product', productSchema),
  Review: mongoose.models.Review || mongoose.model('Review', reviewSchema),
  Order: mongoose.models.Order || mongoose.model('Order', orderSchema)
};
