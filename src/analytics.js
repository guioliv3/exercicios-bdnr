const revenueByCategoryPipeline = (since = new Date(Date.now() - 90 * 86400000)) => [
  { $match: { status: { $in: ['PAID', 'SHIPPED', 'DELIVERED'] }, createdAt: { $gte: since } } },
  { $unwind: '$items' },
  { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } }, itemsSold: { $sum: '$items.quantity' } } },
  { $sort: { revenue: -1 } }
];

const vipCustomersPipeline = (city = 'São Paulo', page = 1, pageSize = 10) => [
  { $match: { shippingCity: city, status: { $in: ['PAID', 'SHIPPED', 'DELIVERED'] } } },
  { $group: { _id: '$userId', totalSpent: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
  { $sort: { totalSpent: -1, _id: 1 } },
  { $facet: {
    data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }, { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }, { $unwind: '$user' }, { $project: { _id: 0, userId: '$_id', name: '$user.name', email: '$user.email', totalSpent: 1, orderCount: 1 } }],
    metadata: [{ $count: 'eligibleCustomers' }]
  } }
];

module.exports = { revenueByCategoryPipeline, vipCustomersPipeline };
