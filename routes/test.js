const express = require('express');
const { cosineSimilarity } = require('../helper/recommender');
const math = require('mathjs');

const router = express.Router();

router.get('/func', (req, res, next) => {
  const a = [1, 1, 4, 2];
  const b = [1, 1, 1, 2];
  const dot = math.dot(a, b);
});

module.exports = router;
