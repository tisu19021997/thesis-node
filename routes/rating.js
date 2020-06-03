const express = require('express');
const controller = require('../controllers/rating');

const router = express.Router();

router.get('/batch', controller.createBatch);

// Create new rating in Ratings collection and also push new rating to Users' profile
router.post('/', controller.createRating, controller.updateUserRating);

router.get('/:asin', controller.getRatings);

module.exports = router;
