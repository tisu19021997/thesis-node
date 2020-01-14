const { isEmpty } = require('lodash');
const { escapeString } = require('../helper/string');
const Products = require('../models/product');
const Categories = require('../models/category');
const { categoryQuery } = require('../helper/query');

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

    if (!product) {
      return res.status(404)
        .send({
          product: {},
        });
    }

    res.locals.product = product;
    res.locals.related = product.related;

    next();
  });
};

module.exports.getBundleProducts = (req, res, next) => {
  if (!res.locals.related) {
    return next();
  }
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
      products.map((product) => {
        totalPrice += parseFloat(product.price);

        return true;
      });
    }

    res.locals.bundleProducts = {
      products,
      totalPrice: (totalPrice + parseFloat(res.locals.product.price)).toFixed(2),
    };

    next();
  });
};

module.exports.getAlsoProducts = (req, res, next) => {
  const { related } = res.locals;

  if (!related) {
    return next();
  }

  // eslint-disable-next-line camelcase
  const { also_viewed, also_bought, also_rated } = related;

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

  const alsoRatedPromise = Products.aggregate([
    { $match: { asin: { $in: also_rated } } },
    { $addFields: { __order: { $indexOfArray: [also_rated, '$asin'] } } },
    { $sort: { __order: 1 } },
    { $limit: 20 },
  ]);

  // const alsoRatedPromise = Products.find({
  //   asin: {
  //     $in: also_rated,
  //   },
  // }).limit(20);

  Promise.all([alsoViewedPromise, alsoBoughtPromise, alsoRatedPromise])
    .then((products) => {
      const [alsoViewed, alsoBought, alsoRated] = products;
      res.locals.alsoViewed = alsoViewed;
      res.locals.alsoBought = alsoBought;
      res.locals.alsoRated = alsoRated;
      next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getSameCatProducts = (req, res, next) => {
  const { product } = res.locals;

  if (!product) {
    next();
    return false;
  }

  const catQuery = categoryQuery(product.categories[0]);

  Products.find(catQuery)
    .limit(50)
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
    product, sameCategory, alsoViewed, alsoBought, alsoRated, bundleProducts, categories,
  } = res.locals;

  res.json(
    {
      product,
      categories,
      bundleProducts,
      alsoViewed,
      alsoBought,
      alsoRated,
      sameCategory,
    },
  );
};


// *========== SEARCH ==========* //

module.exports.searchByName = (req, res, next) => {
  if (isEmpty(req.query)) {
    return res.status(404);
  }

  const {
    s, page, sort, limit,
  } = req.query;

  const options = {
    page,
    limit: limit || 20,
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
  const searchRegex = escapeString(s);


  Products.paginate(
    {
      title: {
        $regex: searchRegex,
        $options: 'i',
      },
    },
    options,
  )
    .then((products) => {
      const {
        totalDocs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages,
      } = products;

      const { docs } = products;

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

module.exports.test = (req, res, next) => {
  // fs.readFile('./data-dev/cat.json', 'utf8', async (err, batch) => {
  //   //   if (err) {
  //   //     next(err);
  //   //   }
  //   //
  //   //   const data = await JSON.parse(batch);
  //   //
  //   //   data.map((cat) => {
  //   //     Categories.create({
  //   //       name: cat,
  //   //       iconClass: 'headphones-alt',
  //   //       imUrl: 'https://s3.us-west-2.amazonaws.com/secure.notion-static.com/286377a8-da87-4186-9978-cc9d0e75ab32/banner.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAT73L2G45B2RM2F5P%2F20200107%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200107T105657Z&X-Amz-Expires=86400&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECcaCXVzLXdlc3QtMiJIMEYCIQCVZ50UgyXQB2%2B9CJ1cykMk61WLxzTD0jKd8fxIFspCXQIhALpdIPM0XZE0jd3D%2BtQF0XGjXe0Y6p2BHlakkxynP4bBKr0DCKD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMMjc0NTY3MTQ5MzcwIgyJl8%2F7E0taHbFmO24qkQONpLHEoJw5U6%2FcMBj8lJK490yNYKQI%2BLZUJJUNzQgrCj9Ugb5DqJQuPJ4vjFaosxIO9pXbWIVPmx17K9aOnG%2FIqZRYtP8jh1Mc5ZBXTE%2BylNeSKjK6%2Fj6yxDJgMsie61k9jrthoSiapoGmAHlOyAwIQiktQbbjmd3SczkIH8dmHPztpzdM4NVf0g2lsBlYTzGWXjPEGonjkRo92FSHQhzlvpIc29YN%2Fcgw%2BhjBzfqwTodjC6afujszCvczngz8LVlO0iROHAtX92J4yq9jPF1zXu2DEULOmSmtXDpGgFRrk9R4MvNqnvTBLaTSe6jdFOTLR2WFgrV4cLNjlSctsF4ONmNb%2Fz8Vav0PhASzP5AHBcGWO2N9Puo%2BWdmL4ukHbC7GKxTYe08VOf9O67p9b%2Bbdq5Y%2Ba6JVkpuGy9DgBaURO4dwuWZHg5vrkgdayo5tSgMTkWrc4HMSUGe%2BKV5743aaYOrLveOlhqd0fGAlBmNuOprPfCuhvW8%2Be%2Bnvk06px4BrHqgsVp12OaEa%2BjMx%2BjFGHjCIz9DwBTrqAVkRMa6pzPhsiOizTgA68%2B8GTYHQ9WbqV7HuDn4HQzSSg9PMnqJHemydvRQtJrN%2BKdHg6LzE0Ucy3nIzhF%2Bs8shqrEbd4u3OkDACV%2FoGabfLGmK1jSKmlbiwdTq6MIEMS5b04IEdP9Z8kmkB5tYEgprx1Lml5VKr%2BXM85ngoWjtjj%2Br6mzGS8SJEPOQh8bAPK8%2FcKShz2VTu09tdQ%2BYixCvN26JtdOSrBsObPXL71caV5UmPR%2B2ZILfRBbvfezIIUYWVOVtrowbVYvJCtV%2Bj0UDK3AZM6p48yptGwl0PrNho2EzN63UNfCEOeg%3D%3D&X-Amz-Signature=55a501816478ab3d2d82f2cd6f04534b9db4ad7e7bd659aebcd5d6f1b439223a&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22banner.png%22',
  //   //     })
  //   //       .then(() => true)
  //   //       .catch((error) => next(error));
  //   //
  //   //     return true;
  //   //   });
  //   // });


  // const isArrayInArray = (arr, item) => {
  //   const str = JSON.stringify(item);
  //
  //   return arr.some((ele) => {
  //     return JSON.stringify(ele) === str;
  //   });
  // };
  //
  // Products.find({})
  //   .then(async (products) => {
  //     let result = [];
  //     const test = await products.map((product) => {
  //       const { categories } = product;
  //
  //       if (!product.categories) {
  //         return false;
  //       }
  //
  //       categories.map((category) => {
  //         console.log(isArrayInArray(result, category));
  //         if (!isArrayInArray(result, category)) {
  //           result = [...result, category];
  //           return true;
  //         }
  //
  //         return false;
  //       });
  //
  //     });
  //
  //     Promise.all(test)
  //       .then(() => {
  //         res.send(result);
  //       })
  //       .catch((e) => {
  //         next(e);
  //       });
  //   });

  Products.find({})
    .then(async (products) => {
      let max = 0;
      const process = await products.map((product) => {
        const { categories } = product;

        console.log(categories);

        if (categories.length > max) {
          max = categories.length;
          console.log(max);
        }
      });

      Promise.all(process)
        .then(() => {
          console.log(max);
        })
        .catch((e) => next(e));
    })
    .catch((e) => next(e));
};
