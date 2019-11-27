const express = require('express');
const router = express.Router();

// authentication
const passport = require('passport');
const { Strategy } = require('passport-local');

// users model
const Users = require('../models/user');


passport.use(new Strategy(
  ((username, password, cb) => {
    Users.findOne({ username }, (err, user) => {
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

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  });

module.exports = router;
