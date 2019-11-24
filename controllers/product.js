const MobileDetect = require('mobile-detect');
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

module.exports.index = (req, res, next) => {
  const md = new MobileDetect(req.headers['user-agent']);
  const { asin } = req.params;
  const { categories } = res.locals;

  Products.findOne({ asin }, (err, product) => {
    if (err) {
      next(err);
    }

    const { related } = product;
    const { also_bought, bought_together, buy_after_viewing } = related;

    Products.find({
      asin: {
        $in: bought_together,
      },
    }, (error, products) => {
      if (error) {
        next(error);
      }

      res.render('page/product-desktop', {
        product,
        categories,
        boughtTogether: products,
      });
    });

    // also_bought.map((current, index, array) => {
    //   Products.findOne
    //   alsoBought.push()
    // });

    // if (!md.mobile()) {
    //   res.render('page/product-desktop', {
    //     product,
    //     categories,
    //     boughtTogether,
    //   });
    // }
  });
};
