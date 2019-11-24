const express = require('express');
const MobileDetect = require('mobile-detect');
const Products = require('../models/product');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const md = new MobileDetect(req.headers['user-agent']);

  if (!md.mobile()) {
    Products.find({}, (err, products) => {
      if (err) {
        throw new Error(err);
      }

      res.render('page/home-desktop', {
        products,
      });
    });
  }
});

module.exports = router;
