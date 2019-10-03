const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }],
  date: {
    start: Date,
    end: Date,
  },
});

const Coupons = mongoose.model('Coupon', Schema);

module.exports = Coupons;
