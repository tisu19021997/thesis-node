const Products = require('../models/product');
const Transactions = require('../models/transaction');
const Users = require('../models/user');

// *========== PRODUCT DETAIL PAGE ==========* //

module.exports.createTransaction = async (req, res) => {
  const { username } = req.params;
  const { products } = req.body;
  const user = await Users.findOne({ username });

  try {
    await Transactions.create({
      user: user._id,
      products,
    });

    return res.status(200)
      .send({ message: 'OK' });
  } catch (error) {
    return res.status(400)
      .send({ message: error.message });
  }
};
