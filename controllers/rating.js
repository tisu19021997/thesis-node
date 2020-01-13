const fs = require('fs');
const Ratings = require('../models/rating');
const Users = require('../models/user');

module.exports.getRatings = (req, res, next) => {
  const { asin } = req.params;
  const { page } = req.query;

  Ratings.paginate({
    asin,
  }, {
    limit: 10,
    page,
    sort: {
      unixReviewTime: -1,
    },
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

module.exports.createRating = (req, res, next) => {
  const data = req.body;
  const { rating, user } = data;

  // parse rating score to integer
  rating.overall = parseInt(rating.overall, 10);

  return Ratings.create(rating)
    .then((newRating) => {
      res.locals.rating = newRating;
      res.locals.username = user;

      next();
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
          asin: rating.asin,
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
    });
};

module.exports.createBatch = (req, res, next) => {
  fs.readFile('./data-dev/ratings-small.json', 'utf8', async (err, batch) => {
    if (err) {
      next(err);
    }

    let status = 409;

    const jsonData = await JSON.parse(batch);
    const loop = await jsonData.map((item) => Ratings.create(item)
      .then(() => {
        status = 200;
      })
      .catch((error) => {
        throw new Error(error);
      }));


    Promise.all(loop)
      .then(() => {
        res.status(status)
          .send('Done');
      })
      .catch((error) => {
        next(error);
      });
  });
};
