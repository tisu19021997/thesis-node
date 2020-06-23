const passport = require('passport');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const Products = require('../models/product');

module.exports.loginAuthenticate = (req, res, next) => {
  passport.authenticate('local-login', (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res
        .json({
          status: 401,
          message: 'Incorrect password or username. Please try again!',
        });
    }

    req.logIn(user, { session: false }, (error) => {
      if (error) {
        next(error);
      }

      const {
        username, products, history, role, ratings,
      } = user;

      const token = jwt.sign({
        username,
        role,
      }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

      return res.status(200)
        .json({
          status: 200,
          user: {
            role,
            username,
            products,
            history,
            ratings,
          },
          token,
          message: 'You are signed-in',
        });
    });

    return false;
  })(req, res, next);
};

module.exports.registerAuthenticate = (req, res, next) => {
  passport.authenticate('local-signup', (err, username, password) => {
    if (err) {
      return next(err);
    }

    if (username && !password) {
      return res.json({
        status: 200,
        message: `The username '${username}' you registered is already taken`,
        user: username,
      });
    }

    Users.create({
      username,
      password,
    }, (error, user) => {
      if (error) {
        return next(error);
      }

      return res.status(201)
        .json({
          message: 'Your account has been created.',
          username: user.username,
        });
    });

    return true;
  })(req, res, next);
};

module.exports.getPromotion = async (req, res, next) => {
  // find all the products - for demo only
  await Products.find({})
    .limit(20)
    .then((products) => {
      res.locals.promotion = products;
      next();
    })
    .catch((e) => {
      next(e);
    });
};

module.exports.getRecommendation = async (req, res, next) => {
  const numProductToShow = 25;

  const { username } = req.params;

  const user = await Users.findOne({ username })
    .exec();

  try {
    const { svd } = user.recommendation;

    // aggregate to keep the order
    let recomProducts = await Products.aggregate([
      { $match: { asin: { $in: svd } } },
      // { $sample: { size: numProductToShow } }, // shuffle the products order
      { $addFields: { __order: { $indexOfArray: [svd, '$asin'] } } },
      { $sort: { __order: 1 } },
      { $limit: numProductToShow },
    ]);

    res.locals.svd = recomProducts || [];
    next();
  } catch (error) {
    next(error);
  }
};

module.exports.getHistory = (req, res, next) => {
  const { username } = req.params;

  if (!username) {
    next();
  }

  Users.findOne({ username })
  Users.findOne({ username })
    .populate('history.product')
    .sort({ time: 1 })
    .exec()
    .then((user) => {
      res.locals.history = user.history || [];
      next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getDeal = (req, res, next) => {
  next();
};

module.exports.getRelatedItems = (req, res) => {
  const { history, svd, promotion } = res.locals;

  res.json({
    history,
    svd,
    promotion,
  });
};

module.exports.guessRender = (req, res) => {
  const { promotion } = res.locals;

  res.json({
    promotion,
  });
};
