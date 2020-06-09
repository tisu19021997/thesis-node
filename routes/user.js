const express = require('express');

const router = express.Router();
const controller = require('../controllers/user');

router.get('/:username/cart', controller.getCart);

router.patch('/:username/cart', controller.updateCart);

router.patch('/:username/cart/products/:productId/quantity', controller.updateProductQuantity);

router.delete('/:username/cart/products/:productId', controller.deleteCartItem);

router.patch('/:username/history', controller.updateHistory);

router.patch('/:username/recommendations', controller.generateRecommendations);

router.post('/:username/checkout', controller.sendConfirmationMail, controller.cleanCart);

module.exports = router;
