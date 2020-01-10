const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
  asin: String,
  imUrl: String,
  description: String,
  price: Number,
  discountPrice: Number,
  title: String,
  brand: String,
  categories: {
    type: [[String]],
  },
  related: {
    also_viewed: [String],
    also_bought: [String],
    buy_after_viewing: [String],
    bought_together: [String],
    also_rated: [String], // using item-to-item collaborative filtering
  },
});

Schema.plugin(mongoosePaginate);
Schema.plugin(require('mongoose-autopopulate'));

const Products = mongoose.model('Products', Schema);

module.exports = Products;
