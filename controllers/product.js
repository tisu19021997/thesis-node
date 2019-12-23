const { isEmpty } = require('lodash');
const Products = require('../models/product');
const Categories = require('../models/category');

// *========== PRODUCT DETAIL PAGE ==========* //

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

    // calculate initial total price of the bundle
    let totalPrice = 0;

    if (products.length) {
      totalPrice = products.reduce((acc, current) => (
        parseFloat(acc.price) + parseFloat(current.price)
      ));
    }

    res.locals.bundleProducts = {
      products,
      totalPrice: totalPrice + parseFloat(res.locals.product.price),
    };

    next();
  });
};

module.exports.getAlsoProducts = (req, res, next) => {
  const { related } = res.locals;
  // eslint-disable-next-line camelcase
  const { also_viewed, also_bought } = related;

  const alsoViewedPromise = Products.find({
    asin: {
      $in: also_viewed,
    },
  });

  const alsoBoughtPromise = Products.find({
    asin: {
      $in: also_bought,
    },
  });

  Promise.all([alsoViewedPromise, alsoBoughtPromise])
    .then((products) => {
      const [alsoViewed, alsoBought] = products;
      res.locals.alsoViewed = alsoViewed;
      res.locals.alsoBought = alsoBought;
      next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getSameCatProducts = (req, res, next) => {
  const { product } = res.locals;

  Products.find({
    categories: {
      $in: product.categories[0],
    },
  })
    .then((products) => {
      res.locals.sameCategory = products;
      next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.renderProducts = (req, res) => {
  const {
    product, sameCategory, alsoViewed, alsoBought, bundleProducts, categories,
  } = res.locals;

  res.json(
    {
      product,
      categories,
      bundleProducts,
      alsoViewed,
      alsoBought,
      sameCategory,
    },
  );
};


// *========== SEARCH ==========* //

module.exports.searchByName = (req, res, next) => {
  if (isEmpty(req.query)) {
    return res.status(404);
  }

  const { s, page, sort, limit } = req.query;

  const options = {
    page,
    limit: limit || 4,
  };

  switch (sort) {
    case 'price-desc':
      options.sort = { price: -1 };
      break;

    case 'price-asc':
      options.sort = { price: 1 };
      break;

    default:
      options.sort = {};
  }

  // escape search string
  const searchRegex = s.replace(new RegExp('\\\\', 'g'), '\\\\');

  Products.paginate(
    {
      title: {
        $regex: searchRegex,
        $options: 'i',
      },
    },
    options,
  )
    .then((data) => {
      const {
        docs, totalDocs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages,
      } = data;
      res.json({
        products: docs,
        totalDocs,
        hasPrevPage,
        hasNextPage,
        nextPage,
        prevPage,
        totalPages,
        page,
      });
    })
    .catch((error) => {
      next(error);
    });
};
