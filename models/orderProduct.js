const mongoose = require('mongoose');

const orderProduct = new mongoose.Schema({
  order_id: Number,
  description: String,
  price: { type: Number, require: true },
  quantity: { type: Number, require: true },
  subtotal: { type: Number, require: true },
  sku: { type: String, require: true },
  name: { type: String, require: true },
});

const OrderProducts = mongoose.model('orderProducts', orderProduct);

module.exports = OrderProducts;
