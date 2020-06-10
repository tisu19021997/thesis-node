const express = require('express');

const router = express.Router();
const controller = require('../controllers/transaction');

router.delete('/:transactionId', controller.cancelTransaction);

router.get('/:username', controller.getAllTransactions);

router.post('/:username', controller.createTransaction);


module.exports = router;
