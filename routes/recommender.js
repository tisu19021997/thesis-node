const express = require('express');
const controller = require('../controllers/recommender');

const router = express.Router();

// Dataset.
router.post('/dataset', controller.uploadDataset);
router.get('/dataset', controller.backupDataset);

// Model.
router.post('/models', controller.trainModel);

module.exports = router;
