const fs = require('fs');
const Ratings = require('../models/rating');
const Users = require('../models/user');

module.exports.getRatings = (req, res, next) => {
  const { asin } = req.params;

  Ratings.paginate({
    asin,
  }, {
    limit: 10,
  })
    .then((data) => {
      const {
        docs, totalDocs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages,
      } = data;
      // res.locals.ratings = ratings;
      // return next();
      res.status(200)
        .json({ ratings: docs });
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

module.exports.createRatings = (req, res, next) => {

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
