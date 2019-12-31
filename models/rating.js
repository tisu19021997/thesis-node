// const mongoose = require('mongoose');
//
// const Schema = new mongoose.Schema({
//   userID: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Users',
//     autopopulate: true,
//   },
//   ratings: [
//     {
//       asin: mongoose.Schema.Types.ObjectId,
//       ref: 'Products',
//       autopopulate: true,
//     },
//   ],
// });
//
// Schema.plugin(require('mongoose-autopopulate'));
//
// const Ratings = mongoose.model('Ratings', Schema);
//
// module.exports = Ratings;
