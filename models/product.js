const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  sku: String,
  name: String,
  description: String,
  quantity: Number,
  category_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  price: {
    regular: Number,
    discount: Number,
  },
});

const Products = mongoose.model('Products', Schema);

module.exports = Products;
