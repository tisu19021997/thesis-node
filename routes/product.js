const express = require('express');
const controller = require('../controllers/product');

const router = express.Router();

// products search
router.get('/', controller.searchByName);

// product detail page
router.get('/:asin',
  controller.getCategories,
  controller.getProductInfo,
  controller.getBundleProducts,
  controller.getAlsoProducts,
  controller.getSameCatProducts,
  controller.renderProducts);


module.exports = router;
