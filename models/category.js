const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  name: { type: String, required: true },
  parent_id: [Number],
});

const Category = mongoose.model('Categories', Schema);

module.exports = Category;
