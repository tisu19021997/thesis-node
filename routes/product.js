const express = require('express');

const router = express.Router();
const controller = require('../controllers/product');

router.get('/:asin', controller.getCategories, controller.index);

module.exports = router;
