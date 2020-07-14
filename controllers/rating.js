const fs = require('fs');
const mongoose = require('mongoose');
const Ratings = require('../models/rating');
const Users = require('../models/user');
const Products = require('../models/product');

module.exports.getRatings = async (req, res, next) => {
  const { asin } = req.params;
  const { page } = req.query;
  const product = await Products.findOne({ asin });
  const productId = product._id;

  Ratings.paginate({
    product: productId,
  }, {
    limit: 10,
    page,
    sort: {
      unixReviewTime: -1,
    },
    lean: true,
  })
    .then((data) => {
      const {
        docs, totalDocs, totalPages,
      } = data;
      // res.locals.ratings = ratings;
      // return next();
      res.status(200)
        .json({
          ratings: docs,
          totalDocs,
          totalPages,
          page,
        });
    })
    .catch((e) => {
      next(e);
    });
};

module.exports.getRaters = async (req, res) => {
  const { ratings } = res.locals;
  const userList = await ratings.map((rating) => rating.reviewerID);
  const users = await Users.find({
    username: {
      $in: userList,
    },
  });

  Promise.all(users)
    .then((data) => {
      res.status(200)
        .json(data);
    })
    .catch((error) => {
      res.status(404)
        .send(error.message);
    });
};

module.exports.createRating = async (req, res, next) => {
  const data = req.body;
  const { rating, user } = data;

  // parse rating score to integer
  rating.overall = parseInt(rating.overall, 10);
  // convert product `_id` to `ObjectId`
  rating.product = mongoose.Types.ObjectId(rating.product);

  const userDoc = await Users.findOne({ username: user });
  rating.reviewer = userDoc._id;

  Ratings.create(rating)
    .then((newRating) => {
      res.locals.rating = newRating;
      res.locals.username = user;

      return next();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.updateUserRating = (req, res, next) => {
  const { rating, username } = res.locals;

  Users.findOneAndUpdate(
    { username },
    {
      $push: {
        ratings: {
          asin: rating.product,
          overall: rating.overall,
        },
      },
    },
    { new: true },
  )
    .then((user) => {
      res.status(200)
        .json({
          rating,
          user,
        });
    })
    .catch((e) => next(e));
};

module.exports.createBatch = (req, res, next) => {
  // TODO: implement this route as a ImportRating section.
  fs.readFile('./data-dev/ratings_xah.json', 'utf8', async (err, file) => {
    if (err) {
      next(err);
    }

    console.log('Parsing JSON file...');
    const ratingBatch = await JSON.parse(file);
    await console.log('Done parsing');
    let count = 0;

    await Promise.all(
      ratingBatch.map(async (rating) => {
        const {
          username, asin, reviewText, summary, helpful, overall, unixReviewTime, reviewTime,
        } = rating;

        const [product, user] = await Promise.all([
          Products.findOne({ asin })
            .exec(),
          Users.findOne({ username })
            .exec(),
        ]);

        // if (await Ratings.exists({reviewer: user._id, product: product._id})) {
        //   return false;
        // }

        Ratings.create({
          reviewer: user._id,
          product: product._id,
          reviewText,
          summary,
          helpful,
          overall,
          unixReviewTime,
        })
          .catch((error) => {
            next(error);
          });

        count += 1;
      }),
    );

    res.status(200)
      .json({ message: `Done importing. Total imported: ${count}` });
  });
};
