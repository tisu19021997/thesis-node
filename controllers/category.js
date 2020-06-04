const Products = require('../models/product');
const Categories = require('../models/category');
const { categoryQuery } = require('../helper/query');

module.exports.getCategories = (req, res, next) => {
  Categories.aggregate()
    .sample(8) // randomly pick 8 categories
    .then((categories) => {
      res.json({
        categories,
      });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getProductsInCategories = async (req, res) => {
  const { id } = req.params;
  const { page, sort, limit } = req.query;
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

  // Get categories name using id.
  const cat = await Categories.findById(id);
  const catName = cat.name;

  // Get products in these categories.
  // Build category query from given categories name.
  const catQuery = categoryQuery(catName);

  Products.paginate(catQuery, options)
    .then((products) => {
      const {
        docs, totalDocs, totalPages,
      } = products;

      // Send response in JSON format.
      res.json({
        category: catName,
        products: docs,
        totalDocs,
        totalPages,
        page,
      });
    })
    .catch((error) => {
      res.status(404)
        .send(error.message);
    });
};
