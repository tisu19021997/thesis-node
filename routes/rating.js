const express = require('express');
const controller = require('../controllers/rating');

const router = express.Router();

router.get('/batch', controller.createBatch);

router.post('/', controller.createRatings);

router.get('/:asin', controller.getRatings);

module.exports = router;
