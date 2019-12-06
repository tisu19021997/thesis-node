const express = require('express');

const router = express.Router();
const controller = require('../controllers/product');

router.get('/:asin', controller.getCategories, controller.getProductInfo, controller.getBundleProducts, controller.getAlsoProducts, controller.getSameCatProducts, controller.mount);

module.exports = router;
