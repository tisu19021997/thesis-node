const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  data: String,
});

const Sessions = mongoose.model('Sessions', Schema);

module.exports = Sessions;
