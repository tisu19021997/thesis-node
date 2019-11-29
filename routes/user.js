const express = require('express');

const router = express.Router();

// authentication
const passport = require('passport');
const { Strategy } = require('passport-local');

// users model
const User = require('../models/user');

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

      if (user.password !== password) {
        return cb(null, false);
      }

      return cb(null, user);
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

      return cb(null, username, password);
    });
  }),
));


// routes request

router.get('/:username/cart', (req, res, next) => {
  const { username } = req.params;

  User.findOne({ username })
    .populate('cart')
    .exec((err, user) => {
      if (err) {
        return next(err);
      }

      const { cart } = user;

      return res.json({
        username,
        cart,
      });
    });
});

router.get('/login', (req, res) => {
  res.render('login');
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
      return res.status(200)
        .json({
          status: 200,
          user: req.user.username,
          message: 'You are signed-in',
        });
    });

    return false;
  })(req, res, next);
});

router.get('/register', (req, res) => {
  res.render('signup');
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
