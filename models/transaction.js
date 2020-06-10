const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    autopopulate: true,
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
        default: 0,
      },
    },
  ],
  total: Number,
  name: String,
  email: String,
  address: String,
  message: String,
  unixCreateTime: {
    type: Number,
    default: Date.now(),
  },
  status: {
    type: String,
    default: 'pending',
  },
});

Schema.plugin(mongoosePaginate);
Schema.plugin(require('mongoose-autopopulate'));

const Transactions = mongoose.model('Transactions', Schema);

module.exports = Transactions;
