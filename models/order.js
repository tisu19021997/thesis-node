const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  coupon_id: Number,
  order_date: { type: String, required: true },
  total: { type: Number, required: true },
  session_id: { type: String, required: true },
  user_id: { type: Number, require: true },
  transaction_id: { type: Number, require: true },
  order_products: { type: Number, require: true },
});

const Orders = mongoose.model('Orders', Schema);

module.exports = Orders;
