const express = require('express');

const router = express.Router();
const controller = require('../controllers/user');

router.get('/:username/cart', controller.getCart);

router.patch('/:username/cart', controller.updateCart);

router.patch('/:username/cart/products/:productId/quantity', controller.updateProductQuantity);

router.delete('/:username/cart/products/:productId', controller.deleteCartItem);

router.patch('/:username/history', controller.updateHistory);

router.get('/:username/generate_recommendations', controller.generate_recommendations);

module.exports = router;
