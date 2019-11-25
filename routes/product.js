const express = require('express');

const router = express.Router();
const controller = require('../controllers/product');

router.get('/:asin', controller.getCategories, controller.getProductInfo, controller.getBundleProducts, controller.getAlsoViewProducts, controller.getAlsoBoughtProducts, controller.getSameCatProducts);

router.post('/:asin/addBundleToCart', (req, res, next) => {
  console.log(req.body);
  res.redirect(`/product/${req.params.asin}`);
});

module.exports = router;
