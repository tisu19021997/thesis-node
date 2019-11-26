const express = require('express');
const Products = require('../models/product');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  Products.find({})
    .then((products) => {
      res.json({
        products,
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
