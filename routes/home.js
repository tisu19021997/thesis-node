const express = require('express');
const controller = require('../controllers/home');

const router = express.Router();

// home page
router.get('/home/:username', controller.getPromotion, controller.getRecommendation, controller.getHistory, controller.getDeal, controller.getRelatedItems);

module.exports = router;
