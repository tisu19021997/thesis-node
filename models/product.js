const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
  asin: String,
  imUrl: String,
  description: String,
  price: Number,
  title: String,
  brand: String,
  categories: {
    type: [[String]],
    // autopopulate: true,
  },
  related: {
    also_viewed: [String],
    also_bought: [String],
    buy_after_viewing: [String],
    bought_together: [String],
  },
});

Schema.plugin(mongoosePaginate);
Schema.plugin(require('mongoose-autopopulate'));

const Products = mongoose.model('Products', Schema);

module.exports = Products;
