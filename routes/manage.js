const express = require('express');
const controller = require('../controllers/store-management');

const router = express.Router();

// product management
router.get('/products', controller.getProducts);

router.post('/products', controller.newProduct);

module.exports = router;
