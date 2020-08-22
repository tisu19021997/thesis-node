const { isEmpty } = require('lodash');
const Types = require('mongoose').Types;
const Products = require('../models/product');
const Users = require('../models/user');
const Cats = require('../models/category');
const { isNumber } = require('../helper/boolean');
const { escapeString } = require('../helper/string');
const { categoryQuery } = require('../helper/query');
const { createDataStreamResponse } = require('../helper/data');

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

  const { cat } = req.query;

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
    $and: [
      {
        $or: [
          // query by name
          {
            title: {
              $regex: searchRegex,
              $options: 'i',
            },
          },
          // or by asin
          {
            asin: {
              $regex: searchRegex,
              $options: 'i',
            },
          },
          // or by brand
          {
            brand: {
              $regex: searchRegex,
              $options: 'i',
            },
          },
          // or by id
          {
            _id: Types.ObjectId.isValid(searchRegex) ? Types.ObjectId(searchRegex) : null,
          },
        ],
      },
    ],
  };

  if (cat) {
    const catList = JSON.parse(cat).cat;

    const catQuery = categoryQuery(catList);

    // push new $or query to current query
    query.$and = [...query.$and, catQuery];
  }

  return Products.paginate(
    query,
    options,
  )
    .then((products) => {
      const {
        totalDocs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages,
      } = products;

      const { docs } = products;

      res.json({
        docs,
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

module.exports.createProduct = (req, res, next) => {
  Products.create(req.body)
    .then((error, product) => {
      if (error) {
        next(error);
      }

      return res.status(201)
        .send({
          product,
          message: 'Successfully create new product.',
        });
    });
};

module.exports.importProducts = async (req, res, next) => {
  const productBatch = req.body;
  let createdCounter = 0;

  try {
    await Promise.all(
      productBatch.map(async (product) => {
        if (!await Products.exists({ asin: product.asin })) {
          createdCounter += 1;
          return Products.create(product)
            .catch((error) => {
              next(error);
            });
        }
      }),
    );

    await res.status(200)
      .json({ message: `Successfully imported products. Imported ${createdCounter}/${req.body.length} products.` });
  } catch (error) {
    res.status(400)
      .send({ message: error.message });
  }
};

module.exports.exportProducts = (req, res) => {
  const { type } = req.query;
  const cursor = Products.find();

  const dataTransformer = (doc) => ({
    id: doc._id,
    asin: doc.asin,
    imUrl: doc.imUrl,
    description: doc.description,
    price: doc.price,
    discountPrice: doc.discountPrice,
    title: doc.title,
    brand: doc.brand,
    categories: doc.categories,
  });

  return createDataStreamResponse(cursor, res, dataTransformer, type);
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

module.exports.bulkUpdateRelatedProducts = async (req, res) => {
  const { recommendations } = req.body;

  // Bulk-write operations.
  const bulkOps = [];

  await recommendations.map(async (item) => {
    const { product, recommendation } = item;
    // Only take the first element of the recommendation (which is the product asin).

    await bulkOps.push({
      updateOne: {
        filter: { asin: product },
        update: {
          'related.also_rated': recommendation,
        },
      },
    });
  });

  await Products.bulkWrite(bulkOps)
    .then((result) => res.status(200)
      .send({
        message: `${result.modifiedCount} products' neighbors has been re-newed.`,
      }))
    .catch((e) => res.send({ message: e.message }));
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
      $and: [
        {
          $or: [
            // query by username
            {
              username: {
                $regex: searchRegex,
                $options: 'i',
              },
            },
            // or by email
            {
              email: {
                $regex: searchRegex,
                $options: 'i',
              },
            },
            // or by id
            {
              _id: Types.ObjectId.isValid(searchRegex) ? Types.ObjectId(searchRegex) : null,
            },
          ],
        }
      ]
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
  const { username } = req.params;

  Users.findOneAndDelete({ username })
    .then((user) => {
      res.status(202)
        .json({
          username,
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
  const { username } = req.params;

  Users.findOneAndUpdate({ username }, req.body, { new: true })
    .then((updatedUser) => {
      res.status(200)
        .send(updatedUser);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.createUser = (req, res) => {
  const { user } = req;

  if (user.message) {
    return res.json({ message: user.message });
  }
  const { username, password } = user;

  return Users.create({
    ...user.others,
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

module.exports.importUsers = async (req, res) => {
  const userBatch = req.body;
  let usersCreated = 0;
  try {
    await Promise.all(
      userBatch.map(async (user) => {
        const {
          username, name, password, ratings,
        } = user;

        if (await Users.exists({ username })) {
          return false;
        }

        // Convert ratings' asin to Mongoose-friendly `_id` field.
        const mappedRatings = await Promise.all(ratings.map(async (rating) => {
          const { asin, overall } = rating;
          const product = await Products.findOne({ asin });
          const productID = product._id;

          return {
            asin: productID,
            overall,
          };
        }));

        Users.create({
          username,
          name,
          password,
          ratings: mappedRatings,
        })
          .catch((error) => {
            console.log(error);
          });

        usersCreated += 1;
      }),
    );

    await res.status(200)
      .json({ message: `Successfully imported users data. Total users created: ${usersCreated} / ${userBatch.length}.` });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

module.exports.exportUsers = (req, res) => {
  const { type } = req.query;
  const cursor = Users.find();

  const transformer = (doc) => ({
    id: doc._id,
    username: doc.username,
    name: doc.name,
    password: doc.password,
    role: doc.role,
    email: doc.email,
    createdAt: doc.createdAt,
  });

  return createDataStreamResponse(cursor, res, transformer, type);
};

module.exports.bulkUpdateRecommendations = async (req, res) => {
  const { recommendations } = req.body;

  // Bulk-write operations.
  const bulkOps = [];

  await recommendations.map(async (item) => {
    const { user } = item;
    // Only take the first element of the recommendation (which is the product asin).
    const recommendation = item.recommendation.map((r) => r[0]);

    await bulkOps.push({
      updateOne: {
        filter: { username: user },
        update: {
          'recommendation.svd': recommendation,
          // $set: {
          //   recommendation: {
          //     svd: recommendation,
          //   },
          // },
        },
      },
    });
  });

  await Users.bulkWrite(bulkOps)
    .then((result) => res.status(200)
      .send({
        message: `${result.modifiedCount} users recommendations has been re-newed.`,
      }))
    .catch((e) => res.send({ message: e.message }));
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
      $and: [
        {
          $or: [
            {
              _id: Types.ObjectId.isValid(searchRegex) ? Types.ObjectId(searchRegex) : null,
            },
            {
              name: {
                $regex: searchRegex,
                $options: 'i',
              },
            },
          ],
        },
      ],
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

module.exports.importCat = async (req, res) => {
  const catBatch = req.body;
  let created = 0;

  try {
    await Promise.all(
      catBatch.map(async (cat) => {
        const { name } = cat;

        if (await Cats.exists({ name })) {
          return false;
        }

        try {
          await Cats.create(cat);
          created += 1;
        } catch (e) {
          return console.log(e.message);
        }
        return true;
      }),
    );

    await res.status(200)
      .json({ message: `Successfully imported categories data. Total categories created: ${created} / ${catBatch.length}.` });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

module.exports.exportCat = async (req, res) => {
  const { type } = req.query;
  const cursor = Cats.find();

  const transformer = (doc) => ({
    _id: doc._id,
    name: doc.name,
    imUrl: doc.imUrl,
    iconClass: doc.iconClass,
  });

  return createDataStreamResponse(cursor, res, transformer, type);
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
