const express = require('express');
const controller = require('../controllers/rating');

const router = express.Router();

router.get('/batch', controller.createBatch);

router.post('/', controller.createRating, controller.updateUserRating);

router.get('/:asin', controller.getRatings);

module.exports = router;
