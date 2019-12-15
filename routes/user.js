const express = require('express');

const router = express.Router();
const controller = require('../controllers/user');

router.get('/:username/cart', controller.getCart);

router.patch('/:username/cart', controller.updateCart);

router.patch('/:username/history', controller.updateHistory);

module.exports = router;
