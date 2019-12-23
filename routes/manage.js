const express = require('express');
const controller = require('../controllers/store-management');

const router = express.Router();

// product management
router.patch('/products/:id', controller.editProduct);

router.post('/products', controller.validate, controller.createProduct);

router.delete('/products/:id', controller.deleteProduct);

module.exports = router;
