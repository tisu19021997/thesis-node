// const MobileDetect = require('mobile-detect');
const Products = require('../models/product');
const Categories = require('../models/category');

module.exports.getCategories = (req, res, next) => {
  Categories.find({}, (err, categories) => {
    if (err) {
      next(err);
    }
    res.locals.categories = categories;
    next();
  });
};

module.exports.getProductInfo = (req, res, next) => {
  // const md = new MobileDetect(req.headers['user-agent']);
  const { asin } = req.params;

  Products.findOne({ asin }, (err, product) => {
    if (err) {
      next(err);
    }

    res.locals.product = product;
    res.locals.related = product.related;
    next();
  });
};

module.exports.getBundleProducts = (req, res, next) => {
  // eslint-disable-next-line camelcase
  const { bought_together } = res.locals.related;

  Products.find({
    asin: {
      $in: bought_together,
    },
  }, (err, products) => {
    if (err) {
      next(err);
    }

    // Calculate initial total price of the bundle
    let totalPrice = 0;

    if (products.length) {
      totalPrice = products.reduce((acc, current) => (
        parseFloat(acc.price) + parseFloat(current.price)
      ));
    }

    // Store bundle object in `res.locals`
    res.locals.bundleProducts = {
      products,
      totalPrice: totalPrice + parseFloat(res.locals.product.price),
    };

    next();
  });
};

module.exports.getAlsoViewProducts = (req, res, next) => {
  const { related } = res.locals;
  // eslint-disable-next-line camelcase
  const { also_viewed } = related;

  Products.find({
    asin: {
      $in: also_viewed,
    },
  })
    .then((products) => {
      res.locals.alsoViewed = products;
      next();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getAlsoBoughtProducts = (req, res, next) => {
  const { related } = res.locals;
  // eslint-disable-next-line camelcase
  const { also_bought } = related;

  Products.find({
    asin: {
      $in: also_bought,
    },
  })
    .then((products) => {
      res.locals.alsoBought = products;
      next();
    })
    .catch((err) => {
      next(err);
    })
  ;
};

module.exports.getSameCatProducts = (req, res, next) => {
  const {
    product, alsoViewed, alsoBought, bundleProducts, categories,
  } = res.locals;

  Products.find({
    categories: {
      $in: product.categories[0],
    },
  })
    .then((products) => {
      console.log(product.categories[0]);

      res.json(
        {
          product,
          categories,
          bundleProducts,
          alsoViewed,
          alsoBought,
          sameCategory: products,
        },
      );
    })
    .catch((err) => {
      next(err);
    });
};
