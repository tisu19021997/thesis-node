const express = require('express');

const router = express.Router();
const controller = require('../controllers/transaction');

router.post('/:username', controller.createTransaction);

module.exports = router;
