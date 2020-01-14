const express = require('express');
const passport = require('passport');
const controller = require('../controllers/home');

const router = express.Router();

// home page guess
router.get('/home', controller.getPromotion, controller.guessRender);

// home page user
router.get('/home/users/:username',
  passport.authenticate('jwt-user', { session: false }),
  controller.getPromotion,
  controller.getRecommendation,
  controller.getHistory,
  controller.getDeal,
  controller.getRelatedItems);

// authentication
router.post('/login', controller.loginAuthenticate);
router.post('/register', controller.registerAuthenticate);

module.exports = router;
