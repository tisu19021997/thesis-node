const passport = require('passport');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const Products = require('../models/product');
const Categories = require('../models/category');
const { categoryQuery } = require('../helper/query');

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

module.exports.registerAuthenticate = (req, res) => {
  const { user } = req;

  if (user.message) {
    return res.json({ message: user.message });
  }
  const { username, password } = user;

  return Users.create({
    username,
    password,
  })
    .then((u) => res.status(201)
      .json({
        message: 'Your account has been created.',
        user: u.username,
      }))
    .catch((error) => res.send(400)
      .json({ message: error.message }));
};

module.exports.getPromotion = async (req, res, next) => {
  res.locals.promotion = await Products.aggregate([
    { $sample: { size: 20 } }, // shuffle the products order
  ]);

  return next();
};

module.exports.getRecommendation = async (req, res, next) => {
  const numProductToShow = 25;

  const { username } = req.params;

  const user = await Users.findOne({ username })
    .populate('ratings.asin')
    .exec();

  res.locals.user = user;

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
  if (!res.locals.user) {
    return next();
  }

  Users.findOne({ username: res.locals.user.username })
    .populate('history.product')
    .sort({ time: 1 })
    .exec()
    .then((user) => {
      res.locals.history = user.history.slice(0, 20) || [];
      next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getProductsByCat = async (req, res, next) => {
  if (!res.locals.user || res.locals.user.ratings.length === 0) {
    try {
      res.locals.cats = await Categories.aggregate([
        { $sample: { size: 12 } }, // shuffle the products order
      ]);
      return next();
    } catch (e) {
      console.log(e);
      return next();
    }
  }

  const { ratings } = res.locals.user;
  const cats = [];

  ratings.map((product) => product.asin.categories.map((cat) => cats.push(cat)));

  try {
    res.locals.cats = await Categories.aggregate([
      { $match: { name: { $in: cats } } },
      { $sample: { size: 12 } },
    ]);
  } catch (e) {
    // console.log(e);
  }

  return next();
};

module.exports.getRelatedItems = (req, res) => {
  const {
    history, svd, promotion, cats,
  } = res.locals;

  res.json({
    history,
    svd,
    promotion,
    cats,
  });
};

module.exports.guessRender = (req, res) => {
  const { promotion, cats } = res.locals;

  res.json({
    promotion,
    cats,
  });
};
