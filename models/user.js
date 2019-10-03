const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  username: String,
  email: String,
  name: {
    first: String,
    last: String,
  },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }],
});

const Users = mongoose.model('Users', Schema);

module.exports = Users;
