const express = require('express');
const controller = require('../controllers/product');

const router = express.Router();

// search product by name
router.get('/search/:title', controller.searchByName);

// product detail page
router.get('/:asin', controller.getCategories, controller.getProductInfo, controller.getBundleProducts, controller.getAlsoProducts, controller.getSameCatProducts, controller.renderProducts);

module.exports = router;
