const express = require('express');
const MobileDetect = require('mobile-detect');
const Products = require('../models/product');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const md = new MobileDetect(req.headers['user-agent']);

  if (!md.mobile()) {
    Products.find({})
      .then((products) => {
        res.json({
          products,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
});

module.exports = router;
