const Users = require('../models/user');
const Products = require('../models/product');

module.exports.index = (req, res, next) => {
  Products.find({}, (err, users) => {
    if (err) next(err);

    res.render('user/index', {
      users,
    });
  });
};
