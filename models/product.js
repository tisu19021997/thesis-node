const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  /*
  sku: String,
  name: String,
  description: String,
  quantity: Number,
  category_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  price: {
    regular: Number,
    discount: Number,
  },
  */
  asin: String,
  imUrl: String,
  description: String,
  price: String,
  title: String,
  brand: String,
  categories: [[String]],
  related: {
    also_viewed: [String],
    also_bought: [String],
    buy_after_viewing: [String],
    bought_together: [String],
  },
});

const Products = mongoose.model('Products', Schema);

module.exports = Products;
