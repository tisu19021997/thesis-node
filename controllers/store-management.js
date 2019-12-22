const Products = require('../models/product');
const { isNumber } = require('../helper/boolean');

module.exports.getProducts = (req, res, next) => {
  const { page, sort } = req.query;

  const options = {
    page,
    limit: 4,
  };

  Products.paginate({}, options)
    .then((data) => {
      const {
        docs, totalDocs, totalPages, page: paging,
      } = data;

      res.json({
        docs,
        totalDocs,
        totalPages,
        page: paging,
      });
    });
};

module.exports.validate = (req, res, next) => {
  const {
    asin, title, imUrl, price, description,
  } = req.body;

  req.body.asin = parseInt(req.body.asin, 10);
  req.body.price = parseFloat(req.body.price);

  if (!isNumber(req.body.asin) || !isNumber(req.body.price)) {
    return res.status(400)
      .json({
        message: 'ASIN and price have to a valid number.',
      });
  }

  // check if all the required fields are filled
  if (!asin || !title || !imUrl || !price || !description) {
    return res.status(400)
      .json({
        message: 'All the required fields have to be filled.',
      });
  }

  // check duplicate
  Products.findOne({ asin })
    .then((product) => {
      if (product) {
        return res.status(409)
          .json({
            message: 'Product already existed.',
          });
      }

      // all validated, direct to the next middleware
      return next();
    })
    .catch((error) => {
      next(error);
    });

  return false;
};

module.exports.createProduct = (req, res, next) => {
  Products.create(req.body)
    .then((error, product) => {
      if (error) {
        next(error);
      }

      res.status(201)
        .send({
          product,
          message: 'Successfully create new product.',
        });
    });
};

module.exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  Products.findByIdAndDelete(id, {})
    .then((product) => {
      res.status(202)
        .json({
          id,
          message: `Deleted ${product.title}`,
        });
    })
    .catch((error) => {
      res.status(400)
        .json({
          message: error.message,
        });
    });
};
