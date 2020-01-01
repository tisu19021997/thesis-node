const express = require('express');
const fs = require('fs');
const { findIndex } = require('lodash');
const Products = require('../models/product');
const Users = require('../models/user');
const { normalizeData, predictRating } = require('../recommender/knn');


const router = express.Router();

router.get('/', async (req, res, next) => {
  fs.readFile('./data-dev/ratings-small.json', 'utf8', async (err, stringData) => {
    if (err) {
      next(err);
    }

    const data = await JSON.parse(stringData);

    await data.map((rating) => {
      const { reviwerID, asin, overall } = rating;

      const ratingObject = {
        asin,
        overall,
      };

      Users.findOne({ username: reviwerID })
        .exec()
        .then((reviewer) => {
          if (reviewer) {
            const { ratings, username } = reviewer;

            const isDuplicated = findIndex(ratings,
              (o) => o.asin === asin) !== -1;

            if (isDuplicated) {
              return false;
            }

            return User.updateOne({ username }, {
              $push: {
                ratings: {
                  $each: [ratingObject],
                  $position: 0,
                },
              },
            })
              .then(() => true)
              .catch((e) => {
                next(e);
              });
          }

          // new user
          return User.create({
            username: reviwerID,
            password: '123',
          })
            .then(() => true)
            .catch((e) => {
              next(e);
            });
        })
        .catch((error) => {
          next(error);
        });

      return false;
    });
  });

  res.status(200)
    .send('Done');
});

// router.get('/products', async (req, res, next) => {
//   let productList = [];
//
//   Products.find({})
//     .exec()
//     .then(async (products) => {
//       const productLists = await products.map((item) => item.asin);
//
//       Promise.all(productLists)
//         .then((data) => {
//           res.send(data);
//
//           fs.writeFile('productsAsin.json', JSON.stringify(productLists), 'utf8', (err, string) => {
//             if (err) {
//               return next(err);
//             }
//           });
//         });
//     });
// });

router.get('/ml/:username', async (req, res, next) => {
  const { username: name } = req.params;

  Users.findOne({ username: name })
    .then(async (currentUser) => {
      const { ratings: userRatings } = currentUser;
      const formattedUser = {
        username: name,
        ratings: {},
      };
      userRatings.map((rating) => {
        formattedUser.ratings[rating.asin] = rating.overall;
        return true;
      });

      const users = await Users.find({});
      let ratingList = [];
      let ratedProducts = [];

      // form the data object to perform prediction on
      users.map((user) => {
        const { ratings, username } = user;
        const ratingObject = {};

        ratings.map((rating) => {
          const { asin, overall } = rating;
          ratingObject[asin] = normalizeData(overall, 1, 5);

          // only get the rated products to minimize run time
          // this may cause the problem of not yet rated products would never be recommended`
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

      const prediction = await predictRating(formattedUser, {
        users: ratingList,
        products: ratedProducts,
      });

      const { ratings: predictedRatings } = await prediction;

      // save recommendations to database
      currentUser.recommendation.knn = Object.keys(predictedRatings)
        .sort((a, b) => predictedRatings[b] - predictedRatings[a]);
      currentUser.save((err) => {
        if (err) {
          next(err);
        }
      });

      res.send(currentUser);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
