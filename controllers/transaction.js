const Transactions = require('../models/transaction');
const Users = require('../models/user');


/**
 * Create a new transaction.
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createTransaction = async (req, res) => {
  const { username } = req.params;
  const {
    products, name, address, email, message, total,
  } = req.body;
  const user = await Users.findOne({ username });

  try {
    await Transactions.create({
      user: user._id,
      products,
      name,
      address,
      message,
      email,
      total,
    });

    return res.status(200)
      .send({ message: 'OK' });
  } catch (error) {
    return res.status(400)
      .send({ message: error.message });
  }
};

/**
 * Get all (both pending and delivered) transactions of a user.
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getAllTransactions = async (req, res) => {
  const { username } = req.params;
  const user = await Users.findOne({ username });

  try {
    const transactions = await Transactions.find({
      user: user._id,
    });

    return res.status(200)
      .json(transactions);
  } catch (error) {
    return res.status(400)
      .send({ message: error.message });
  }
};

/**
 * Cancel a transaction.
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.cancelTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    await Transactions.findByIdAndDelete(transactionId, {});

    return res.status(200)
      .send('OK');
  } catch (error) {
    return res.status(400)
      .send({ message: error.message });
  }
};
