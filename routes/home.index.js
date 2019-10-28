const express = require('express');
const MobileDetect = require('mobile-detect');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const md = new MobileDetect(req.headers['user-agent']);
  res.render('page/home', {
    mobile: !!md.mobile(),
    n: 0, // variable for development usage
  });
});

module.exports = router;
