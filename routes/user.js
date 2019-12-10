const express = require('express');

const router = express.Router();
const controller = require('../controllers/user');

// user-related requests

router.get('/:username/cart', controller.getCart);

router.put('/:username/purchaseOne', controller.purchase);

router.put('/:username/purchaseAll', controller.purchaseAll);

router.put('/:username/deleteCartItem', controller.deleteCartItem);

router.put('/:username/updateHistory', controller.updateHistory);

module.exports = router;
