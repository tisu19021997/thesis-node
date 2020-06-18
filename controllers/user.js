const mongoose = require('mongoose');
const axios = require('axios');
const mailer = require('nodemailer');
const { sortBy, findIndex } = require('lodash');
const User = require('../models/user');

module.exports.getCart = (req, res, next) => {
  const { username } = req.params;

  User.findOne({ username })
    .populate('product')
    .exec((err, user) => {
      if (err) {
        return next(err);
      }

      return res.json({
        cart: user.products,
        username,
      });
    });
};

module.exports.updateCart = (req, res, next) => {
  const { username } = req.params;
  const { single, cartProducts, quantity } = req.body;

  // bundle product purchase
  if (!single) {
    User.findOne({ username })
      .populate('product')
      .exec()
      .then((userToUpdate) => {
        cartProducts.map((product) => {
          const productModel = {
            product,
            quantity: 1,
          };

          const productIndex = findIndex(userToUpdate.products,
            (o) => o.product.asin === product.asin);

          if (productIndex !== -1) {
            userToUpdate.products[productIndex].quantity += 1;
          } else {
            userToUpdate.products = [...userToUpdate.products, productModel];
          }

          return true;
        });
        userToUpdate.save((err) => {
          if (err) {
            next(err);
          }
        });
        res.send(userToUpdate.products);
      })
      .catch((error) => {
        next(error);
      });
  } else {
    const product = cartProducts;
    // create a valid product model using the product from the request
    const productModel = {
      product: product._id,
      quantity,
    };

    User.findOne({ username })
      .populate('product')
      .exec()
      .then((userToUpdate) => {
        const { products } = userToUpdate;

        // get the sub-array that doesn't include the current product
        // if the length of that array equals to the original array
        // then the product wasn't in the cart (i.e it's a new product)
        const notCurrentProduct = products.filter(
          (item) => item.product._id.toString() !== product._id,
        );
        const noDuplicated = notCurrentProduct.length === products.length;

        if (noDuplicated) {
          User.findOneAndUpdate(
            { username },
            { $push: { products: productModel } },
            { new: true },
          )
            .exec()
            .then((updatedUser) => {
              res.send(updatedUser.products);
            })
            .catch((error) => {
              next(error);
            });
        } else {
          // if the product is already in cart, update the quantity only
          User.findOneAndUpdate({
            username,
            'products.product': product._id,
          }, { $inc: { 'products.$.quantity': quantity } }, { new: true })
            .exec()
            .then((updatedUser) => {
              res.send(updatedUser.products);
            })
            .catch((error) => {
              next(error);
            });
        }
      })
      .catch((error) => {
        next(error);
      });
  }
};

module.exports.updateProductQuantity = (req, res, next) => {
  const { username, productId } = req.params;
  const { quantity } = req.body;

  User.findOneAndUpdate({
    username,
    'products._id': productId,
  }, { $set: { 'products.$.quantity': quantity } }, { new: true })
    .populate('product')
    .exec()
    .then((updatedUser) => {
      res.send(updatedUser.products);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.updateHistory = (req, res, next) => {
  const { username } = req.params;
  const product = req.body;

  // create a valid product model using the product from the request
  const productModel = {
    product: product._id,
    _id: mongoose.Types.ObjectId(),
  };

  User.findOne({ username })
    .populate('product')
    .exec()
    .then((userToUpdate) => {
      const { history } = userToUpdate;
      // const isDuplicated = history.filter(
      //   (item) => item.product._id.toString() === product._id,
      // ).length > 0;

      const isDuplicated = findIndex(history,
        (o) => o.product._id.toString() === product._id) !== -1;

      if (!isDuplicated) {
        User.updateOne({ username }, {
          $push: {
            history: {
              $each: [productModel],
              $position: 0,
            },
          },
        }, { new: true })
          .exec()
          .then((updatedUser) => res.send(updatedUser.history))
          .catch((error) => {
            next(error);
          });
      } else {
        // if the item is already in history, re-order it to the first position
        const sortedHistory = sortBy(history, (item) => {
          return item.product._id.toString() !== product._id;
        });

        User.updateOne({ username }, { history: sortedHistory }, { new: true })
          .exec()
          .then((updatedUser) => res.send(updatedUser.history))
          .catch((error) => {
            next(error);
          });
      }

      return false;
    });
};

module.exports.deleteCartItem = (req, res, next) => {
  const { username, productId } = req.params;

  User.findOneAndUpdate({
    username,
    'products._id': productId,
  }, {
    $pull: {
      products: { _id: productId },
    },
  }, { new: true })
    .populate('product')
    .exec()
    .then((updatedUser) => {
      res.send(updatedUser.products);
    })
    .catch((error) => {
      next(error);
    });

};

module.exports.generateRecommendations = (req, res, next) => {
  const { username } = req.params;

  axios.post(`http://127.0.0.1:8000/reviewers/${username}/get_recommendations/`, req.body)
    .then((response) => {
      const { recommendations } = response.data;
      const recommendationsAsin = [];

      // Only take the products' asin, exclude the predicted rating score.
      recommendations.map((rec) => {
        recommendationsAsin.push(rec[0]);
      });

      // Save recommendations to database.
      User.findOne({ username })
        .then((currentUser) => {
          currentUser.recommendation.svd = recommendationsAsin;
          currentUser.save((error) => {
            if (error) {
              return res.send(error.message);
            }
          });
          res.json({ recommendations });
        })
        .catch((error) => {
          res.send(error.message);
        });
    })
    .catch((error) => {
      res.send(error.message);
    });
};

/**
 * Shipping cart validation. Send check-out confirmation mail using NodeMailer.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
module.exports.sendConfirmationMail = async (req, res, next) => {
  const { username } = req.params;
  const {
    cart, name, address, email, shippingMessage,
  } = req.body;
  let productsDOM = '';

  // build the products DOM list
  cart.map((item) => {
    productsDOM += `<li>${item.product.title} (Qty: ${item.quantity})</li>`;
    return true;
  });

  // if any information is missing, return
  if (!cart.length || !name || !email || !address) {
    return res.status(400)
      .send({ message: 'Please make sure you have correctly filled all the required information.' });
  }

  // save User document for the next route
  res.locals.user = await User.findOne({ username });

  const transporter = mailer.createTransport({
    service: 'Gmail',
    auth: {
      user: `${process.env.GMAIL_USERNAME}@gmail.com`,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mainOptions = {
    from: 'EComExpress',
    to: email,
    subject: 'Your order has been confirmed.',
    text: `Thanks for choosing us. + ${req.body.email}`,
    html: `<p>Hi <b>${name},</b></p>
    <p>Your order is confirmed! Thanks for shopping! The order will be delivered to your address at <b>${address}</b> with the message "${shippingMessage}"</p>
    <h1>Order Summary</h1>
    <ul>${productsDOM}</ul>`,
  };

  // send mail
  await transporter.sendMail(mainOptions, (err, _) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

/**
 * Clean the cart object in User document.
 *
 * @param req
 * @param res
 * @returns {*}
 */
module.exports.cleanCart = (req, res) => {
  const { user } = res.locals;

  // Clear user's cart.
  user.products = [];
  user.save((error) => {
    if (error) {
      return res.send(error.message);
    }
  });
  return res.status(200)
    .json({ cart: user.products });
};
