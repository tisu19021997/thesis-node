const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = new mongoose.Schema({
  name: {
    type: [String],
    required: true,
  },
  iconClass: String,
  imUrl: String,
});

Schema.plugin(mongoosePaginate);

const Category = mongoose.model('Categories', Schema);

module.exports = Category;
