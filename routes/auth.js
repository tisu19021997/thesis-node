const express = require('express');
const passport = require('passport');
const controller = require('../controllers/auth');

const router = express.Router();

router.get('/admin', passport.authenticate('jwt-admin', { session: false }),
  (req, res) => res.status(200)
    .send('Authorized'));

module.exports = router;
