const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
  reviewerID: String,
  asin: String,
  reviewerName: String,
  reviewText: String,
  summary: String,
  helpful: [Number],
  overall: Number,
  unixReviewTime: Number,
  reviewTime: String,
});

Schema.plugin(mongoosePaginate);

const Rating = mongoose.model('Rating', Schema);

module.exports = Rating;
