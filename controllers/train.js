const fs = require('fs');
const { cosineSimilarity, normalizeData, knnPredict } = require('../helper/recommender');
const Users = require('../models/user');
const Products = require('../models/product');
const knnTrainSet = fs.existsSync('../data-dev/knnTable.json') ? require('../data-dev/knnTable') : [];

module.exports.cfPrediction = async (req, res, next) => {
  const { asin } = req.params;

  fs.readFile('./data-dev/simTable.json', 'utf8', async (err, stringData) => {
    if (err) {
      next(err);
    }

    const data = await JSON.parse(stringData);
    const curItem = data[asin];
    let simScore = {};

    if (!curItem) {
      await res.status(404)
        .send('Product not found.');
      return false;
    }

    const constructSimScore = Object.keys(data)
      .map(async (otherKey) => {
        const other = data[otherKey];

        if (otherKey === asin) {
          return false;
        }

        // compute cosine similarity between current product and the other,
        // then push the similarity to origin data
        simScore = {
          ...simScore,
          [otherKey]: cosineSimilarity(curItem, other),
        };

        return true;
      });

    Promise.all(constructSimScore)
      .then(async () => {
        // sort the similarity score table and also exclude the current item
        // from the recommendation list
        simScore = await Object.keys(simScore)
          .sort((a, b) => simScore[b] - simScore[a])
          .filter((item) => item !== asin);

        // save generated recommendations to database
        Products.findOneAndUpdate(
          { asin }, { $set: { 'related.also_rated': simScore } }, { new: true },
        )
          .then((product) => {
            res.json(product);
          })
          .catch((e) => {
            next(e);
          });
      })
      .catch((error) => {
        next(error);
      });
  });
};

module.exports.knnPrediction = async (req, res, next) => {
  const { username: name } = req.body;

  Users.findOne({ username: name })
    .then(async (currentUser) => {
      if (!currentUser) {
        res.status(404)
          .send('User not found');
      }
      const { ratings: userRatings } = currentUser;
      const formattedUser = {
        username: name,
        ratings: {},
      };

      userRatings.map((rating) => {
        formattedUser.ratings[rating.asin] = normalizeData(rating.overall, 1, 5);
        return true;
      });

      res.locals.actual = await userRatings;

      const users = await Users.find({});
      let ratingList = [];
      let ratedProducts = [];

      // if the training set is already generated, use it
      if (knnTrainSet.length > 0) {
        ratingList = knnTrainSet;

        knnTrainSet.map((user) => {
          const { ratings } = user;

          return Object.keys(ratings)
            .map((key) => {
              if (ratedProducts.indexOf(key) === -1) {
                ratedProducts = [...ratedProducts, key];
              }

              return true;
            });
        });
      } else {
        // generate the data needed to do prediction on by iterate through
        // each user, map the ratings extracted from the JSON file to each user
        users.map((user) => {
          const { ratings, username } = user;
          const ratingObject = {};

          ratings.map((rating) => {
            const { asin, overall } = rating;
            ratingObject[asin] = normalizeData(overall, 1, 5);

            // only get the rated products to minimize run time
            // this may cause the problem of not yet rated products would never be recommended
            if (ratedProducts.indexOf(asin) === -1) {
              ratedProducts = [...ratedProducts, asin];
            }

            return true;
          });

          ratingList = [...ratingList, {
            username,
            ratings: ratingObject,
          }];

          return true;
        });
      }

      // un-comment these lines to write ratingList to a file
      //
      // fs.writeFile('knnTable.json', JSON.stringify(ratingList), 'utf8', (err, string) => {
      //   if (err) {
      //     next(err);
      //   }
      //   console.log('Done Writing');
      // });

      const prediction = await knnPredict(formattedUser, {
        users: ratingList,
        products: ratedProducts,
      });
      const { ratings: predictedRatings } = await prediction;

      // save recommendations to database, sorted by rating score
      currentUser.recommendation.knn = Object.keys(predictedRatings)
        .sort((a, b) => predictedRatings[b] - predictedRatings[a]);

      currentUser.save((err) => {
        if (err) {
          next(err);
        }
      });

      res.locals.prediction = await predictedRatings;

      await next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.knnEvaluate = async (req, res) => {
  const { prediction, actual } = await res.locals;

  await res.status(200).json({
    prediction,
    actual,
  });
};
