const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    autopopulate: true,
  },
  asin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    autopopulate: true,
  },
  reviewText: String,
  summary: String,
  helpful: {
    type: [Number],
    default: [0, 0],
  },
  overall: Number,
  unixReviewTime: {
    type: Number,
    default: Date.now(),
  },
  reviewTime: String,
});

Schema.plugin(mongoosePaginate);

const Rating = mongoose.model('Rating', Schema);

module.exports = Rating;
