const express = require('express');
const Products = require('../models/product');
const controller = require('../controllers/home');

const router = express.Router();

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

router.get('/home/:username', controller.getPromotion, controller.getRecommendation, controller.getHistory, controller.getDeal, controller.getRelatedItems);

module.exports = router;
