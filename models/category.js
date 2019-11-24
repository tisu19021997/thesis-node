const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  name: { type: String, required: true },
  iconClass: String,
  parent: String,
});

const Category = mongoose.model('Categories', Schema);

module.exports = Category;
