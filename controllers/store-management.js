const Products = require('../models/product');

module.exports.getProducts = (req, res, next) => {
  const { page, sort } = req.query;

  const options = {
    page,
    limit: 100,
  };

  Products.paginate({}, options)
    .then((data) => {
      const {
        doc, totalDocs,
      } = data;

      res.json({
        doc,
        totalDocs,
      });
    });
};

module.exports.newProduct = (req, res, next) => {
  Products.create(req.body)
    .then((error, products) => {
      if (error) {
        next(error);
      }

      res.status(201)
        .send('Created');
    });
};
