const express = require('express');

const router = express.Router();

// third-party
const passport = require('passport');
const { Strategy } = require('passport-local');
const bcrypt = require('bcrypt');

// users model
const User = require('../models/user');
const controller = require('../controllers/user');

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


// user-related requests

router.get('/:username/cart', controller.getCart);

router.put('/:username/purchaseOne', controller.purchase);

router.put('/:username/purchaseAll', controller.purchaseAll);

router.put('/:username/deleteCartItem', controller.deleteCartItem);

router.put('/:username/updateHistory', controller.updateHistory);

router.post('/login', controller.loginAuthenticate);

router.post('/register', controller.registerAuthenticate);

module.exports = router;
