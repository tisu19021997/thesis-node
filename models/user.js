const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  email: String,
  name: {
    first: String,
    last: String,
  },
  history: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        autopopulate: true,
      },
      time: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  recommendation: {
    knn: [String],
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        autopopulate: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  ratings: [
    {
      asin: String,
      overall: Number,
    },
  ],
});

Schema.plugin(require('mongoose-autopopulate'));

const User = mongoose.model('User', Schema);

module.exports = User;
