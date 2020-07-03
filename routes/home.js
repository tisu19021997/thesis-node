const express = require('express');
const passport = require('passport');
const controller = require('../controllers/home');

const router = express.Router();

// home page guess
router.get('/home', controller.getPromotion, controller.getProductsByCat, controller.guessRender);

// home page user
router.get('/home/users/:username',
  passport.authenticate('jwt-user', { session: false }),
  controller.getPromotion,
  controller.getRecommendation,
  controller.getHistory,
  controller.getProductsByCat,
  controller.getRelatedItems);

// authentication
router.post('/login', controller.loginAuthenticate);
router.post('/register', passport.authenticate('local-signup', { session: false }), controller.registerAuthenticate);

module.exports = router;
