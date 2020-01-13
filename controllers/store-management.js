const { isEmpty } = require('lodash');
const Products = require('../models/product');
const Users = require('../models/user');
const Cats = require('../models/category');
const { isNumber } = require('../helper/boolean');
const { escapeString } = require('../helper/string');

// products
module.exports.validateProduct = (req, res, next) => {
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

module.exports.getProducts = (req, res, next) => {
  if (isEmpty(req.query)) {
    return res.status(404);
  }

  const {
    s, page, sort, limit,
  } = req.query;

  const data = req.body;
  let { cat } = data;

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

  const query = {
    title: {
      $regex: searchRegex,
      $options: 'i',
    },
  };

  if (cat) {
    cat = JSON.parse(cat).cat;
    query.$or = [];

    // hard code the maximum length of categories array
    // will fix when a better solution
    for (let i = 0; i < 8; i += 1) {
      const object = {};
      object[`categories.${i}`] = cat;

      query.$or = [...query.$or, object];
    }
  }

  Products.paginate(
    query,
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
}

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

module.exports.importProducts = (req, res, next) => {
  const productBatch = req.body;

  Products.insertMany(productBatch)
    .then(() => {
      res.status(200)
        .json({
          message: 'Successfully imported products.',
        });
    })
    .catch((error) => {
      throw new Error(error);
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

module.exports.editProduct = (req, res, next) => {
  const { id } = req.params;

  Products.findByIdAndUpdate(id, req.body, { new: true })
    .then((updatedProduct) => {
      res.status(200)
        .json({
          message: 'Successfully updated the product.',
          product: updatedProduct,
        });
    })
    .catch((error) => {
      next(error);
    });
};


// users
module.exports.validateUser = async (req, res, next) => {
  const { username, email } = req.body;

  const user = await Users.find({
    $or: [
      { username },
      { email },
    ],
  });

  if (user.length > 0) {
    return res.status(409)
      .send({
        message: 'User already existed.',
      });
  }

  return next();
};

module.exports.getUsers = async (req, res, next) => {
  if (isEmpty(req.query)) {
    return res.status(404)
      .send('Not Found');
  }

  const {
    s, page, sort, limit,
  } = req.query;

  const options = {
    page,
    limit: limit || 4,
  };

  switch (sort) {
    case 'oldest':
      options.sort = { createAt: 1 };
      break;

    case 'role':
      options.sort = { role: 1 };
      break;

    default:
      options.sort = { createdAt: -1 };
  }

  const searchRegex = escapeString(s);

  try {
    const data = await Users.paginate({
      username: {
        $regex: searchRegex,
        $options: 'i',
      },
    }, options);

    const {
      docs, totalDocs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages,
    } = await data;

    await res.json({
      docs,
      totalDocs,
      hasPrevPage,
      hasNextPage,
      nextPage,
      prevPage,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }

  return false;
};

module.exports.deleteUser = (req, res) => {
  const { id } = req.params;

  Users.findByIdAndDelete(id, {})
    .then((user) => {
      res.status(202)
        .json({
          id,
          message: `Deleted ${user.name}`,
        });
    })
    .catch((error) => {
      res.status(400)
        .json({
          message: error.message,
        });
    });
};

module.exports.editUser = (req, res, next) => {
  const { id } = req.params;

  Users.findByIdAndUpdate(id, req.body, { new: true })
    .then((updatedUser) => {
      res.status(200)
        .json({
          message: 'Successfully updated the product.',
          product: updatedUser,
        });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.createUser = (req, res, next) => {
  Users.create(req.body)
    .then((product) => res.status(201)
      .send({
        product,
        message: 'Successfully create new product.',
      }))
    .catch((error) => {
      next(error);
    });
};


// categories
module.exports.getCats = async (req, res, next) => {
  if (isEmpty(req.query)) {
    return res.status(404)
      .send('Not Found');
  }

  const {
    s, page, limit,
  } = req.query;

  const options = {
    page,
    limit: limit || 4,
  };

  const searchRegex = escapeString(s);

  try {
    const data = await Cats.paginate({
      name: {
        $regex: searchRegex,
        $options: 'i',
      },
    }, options);

    const {
      docs, totalDocs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages,
    } = await data;

    await res.json({
      docs,
      totalDocs,
      hasPrevPage,
      hasNextPage,
      nextPage,
      prevPage,
      totalPages,
      page,
    });
  } catch (error) {
    next(error);
  }

  return false;
};

module.exports.addCat = (req, res, next) => {
  Cats.create(req.body)
    .then((cat) => res.status(201)
      .send({
        cat,
        message: 'Successfully create new category.',
      }))
    .catch((error) => {
      next(error);
    });
};

module.exports.deleteCat = (req, res, next) => {
  const { id } = req.params;

  Cats.findByIdAndDelete(id, {})
    .then((cat) => {
      res.status(202)
        .json({
          id,
          message: `Deleted ${cat.name}`,
        });
    })
    .catch((error) => {
      res.status(400)
        .json({
          message: error.message,
        });
    });
};

module.exports.importCat = (req, res, next) => {

};

module.exports.editCat = (req, res, next) => {
  const { id } = req.params;

  Cats.findByIdAndUpdate(id, req.body, { new: true })
    .then((updatedCat) => {
      res.status(200)
        .json({
          message: 'Successfully updated the category.',
          product: updatedCat,
        });
    })
    .catch((error) => {
      next(error);
    });
};
