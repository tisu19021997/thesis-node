const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/admin',
  passport.authenticate('jwt-admin', { session: false }),
  (req, res) => res.status(200)
    .json({
      authenticated: true,
    }));

module.exports = router;
