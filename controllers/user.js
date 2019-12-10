const mongoose = require('mongoose');
const { sortBy, findIndex } = require('lodash');
const User = require('../models/user');

module.exports.getCart = (req, res, next) => {
  const { username } = req.params;

  User.findOne({ username })
    .populate('product')
    .exec((err, user) => {
      if (err) {
        return next(err);
      }

      return res.json({
        cart: user.products,
        username,
      });
    });
};

module.exports.purchase = (req, res, next) => {
  const { username } = req.params;
  const product = req.body;

  // create a valid product model using the product from the request
  const productModel = {
    product: product._id,
  };

  User.findOne({ username })
    .populate('product')
    .exec()
    .then((userToUpdate) => {
      const { products } = userToUpdate;

      // get the sub-array that doesn't include the current product
      // if the length of that array equals to the original array
      // then the product wasn't in the cart (i.e it's a new product)
      const notCurrentProduct = products.filter(
        (item) => item.product._id.toString() !== product._id,
      );
      const noDuplicated = notCurrentProduct.length === products.length;

      if (noDuplicated) {
        User.findOneAndUpdate({ username }, { $push: { products: productModel } }, { new: true })
          .exec()
          .then((updatedUser) => {
            res.send(updatedUser.products);
          })
          .catch((error) => {
            next(error);
          });
      } else {
        // if the product is already in cart, update the quantity only
        User.findOneAndUpdate({
          username,
          'products.product': product._id,
        }, { $inc: { 'products.$.quantity': 1 } }, { new: true })
          .exec()
          .then((updatedUser) => {
            res.send(updatedUser.products);
          })
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.purchaseAll = (req, res, next) => {
  const { username } = req.params;
  const products = req.body;

  User.findOne({ username })
    .populate('product')
    .exec()
    .then((userToUpdate) => {
      products.map((product) => {
        const productModel = {
          product,
          quantity: 1,
        };

        const productIndex = findIndex(userToUpdate.products,
          (o) => o.product.asin === product.asin);

        if (productIndex !== -1) {
          userToUpdate.products[productIndex].quantity += 1;
        } else {
          userToUpdate.products = [...userToUpdate.products, productModel];
        }

        return true;
      });
      userToUpdate.save((err) => {
        if (err) {
          next(err);
        }
      });
      res.send(userToUpdate.products);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.deleteCartItem = (req, res, next) => {
  const { username } = req.params;
  const newCart = req.body;

  User.findOne({ username })
    .populate('product')
    .exec()
    .then((userToUpdate) => {
      userToUpdate.products = newCart;
      userToUpdate.save((err) => {
        if (err) {
          next(err);
        }
      });

      return res.status(200);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.updateHistory = (req, res, next) => {
  const { username } = req.params;
  const product = req.body;

  // create a valid product model using the product from the request
  const productModel = {
    product: product._id,
    _id: mongoose.Types.ObjectId(),
  };

  User.findOne({ username })
    .populate('product')
    .exec()
    .then((userToUpdate) => {
      const { history } = userToUpdate;
      // const isDuplicated = history.filter(
      //   (item) => item.product._id.toString() === product._id,
      // ).length > 0;

      const isDuplicated = findIndex(history, (o) => o.product._id.toString() === product._id) !== -1;

      if (!isDuplicated) {
        User.updateOne({ username }, {
          $push: {
            history: {
              $each: [productModel],
              $position: 0,
            },
          },
        }, { new: true })
          .exec()
          .then((updatedUser) => res.send(updatedUser.history))
          .catch((error) => {
            next(error);
          });
      } else {
        // if the item is already in history, re-order it to the first position
        const sortedHistory = sortBy(history, (item) => {
          return item.product._id.toString() !== product._id;
        });

        User.updateOne({ username }, { history: sortedHistory }, { new: true })
          .exec()
          .then((updatedUser) => res.send(updatedUser.history))
          .catch((error) => {
            next(error);
          });
      }

      return false;
    });
};
