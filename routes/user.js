const express = require('express');

const router = express.Router();
const { sortBy } = require('lodash');

// authentication
const passport = require('passport');
const { Strategy } = require('passport-local');
const bcrypt = require('bcrypt');

// users model
const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product');

// passport configuration methods
passport.serializeUser((user, cb) => {
  cb(null, user.username);
});

passport.deserializeUser((username, cb) => {
  User.find({ username }, (err, user) => {
    if (err) {
      return cb(err);
    }

    return cb(null, user);
  });
});


// passport strategies
passport.use('local-login', new Strategy(
  ((username, password, cb) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return cb(err);
      }

      if (!user) {
        return cb(null, false);
      }

      bcrypt.compare(password, user.password, (error, res) => {
        if (error) {
          cb(error);
        }
        if (res === true) {
          return cb(null, user);
        }
      });
    });
  }),
));

passport.use('local-signup', new Strategy(
  ((username, password, cb) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return cb(err);
      }

      if (user) {
        return cb(null, username);
      }

      // using bcrypt to hash the password
      bcrypt.hash(password, 10, (error, hash) => {
        if (error) {
          return cb(err);
        }

        return cb(null, username, hash);
      });
    });
  }),
));


// routes request

router.get('/:username/cart', (req, res, next) => {
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
});

router.put('/:username/purchaseOne', (req, res, next) => {
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
});

router.put('/:username/purchaseAll', (req, res, next) => {
  const { username } = req.params;
  const products = req.body;

  User.findOne({ username })
    .populate('product')
    .exec()
    .then((userToUpdate) => {
      // iterate through array of product ids and save to database
      for (const product of products) {
        userToUpdate.products.push(product);
      }
      userToUpdate.save((err) => {
        if (err) {
          next(err);
        }
      });
      res.json(`Added selected items to your cart.`);
    })
    .catch((error) => {
      next(error);
    });
});

router.put('/:username/deleteCartItem', (req, res, next) => {
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
});

router.put('/:username/updateHistory', (req, res, next) => {
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
      const isDuplicated = history.filter(
        (item) => item.product._id.toString() === product._id,
      ).length > 0;

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
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({
        status: 404,
        message: 'We are not able to find your account. Are you new?',
      });
    }

    req.logIn(user, (error) => {
      if (error) {
        return next(error);
      }

      const { username, products, history } = user;

      return res.status(200)
        .json({
          status: 200,
          user: {
            username,
            products,
            history,
          },
          message: 'You are signed-in',
        });
    });

    return false;
  })(req, res, next);
});

router.post('/register', (req, res, next) => {
  passport.authenticate('local-signup', (err, username, password) => {
    if (err) {
      return next(err);
    }

    if (username && !password) {
      return res.json({
        status: 200,
        message: 'The username you registered is already taken',
        user: username,
      });
    }

    User.create({
      username,
      password,
    }, (error, user) => {
      if (error) {
        return next(error);
      }

      return res.json({
        message: 'Your account has been created.',
        username: user.username,
      });
    });

    return true;
  })(req, res, next);
});

module.exports = router;
