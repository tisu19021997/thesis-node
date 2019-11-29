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
  email: String,
  name: {
    first: String,
    last: String,
  },
  history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
  }],
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
  }],
});

const User = mongoose.model('User', Schema);

module.exports = User;
