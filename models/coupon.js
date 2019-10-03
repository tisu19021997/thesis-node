const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  code: String,
  description: String,
  active: { type: Boolean, default: '' },
  value: Number,
  date: {
    start: Date,
    end: Date,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }],
});

const Coupons = mongoose.model('Coupon', Schema);

module.exports = Coupons;
