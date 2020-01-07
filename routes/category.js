const express = require('express');

const router = express.Router();
const Categories = require('../models/category');

router.get('/', (req, res, next) => {
  Categories.find({})
    .limit(8)
    .then((categories) => {
      res.json({
        categories,
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
