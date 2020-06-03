const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
    default: '',
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
    svd: [String],
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
      asin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        autopopulate: true,
      },
      overall: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

Schema.plugin(mongoosePaginate);
Schema.plugin(require('mongoose-autopopulate'));

const Users = mongoose.model('Users', Schema);

module.exports = Users;
