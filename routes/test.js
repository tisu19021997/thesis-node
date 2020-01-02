const express = require('express');
const fs = require('fs');
const { findIndex } = require('lodash');
const Users = require('../models/user');
const Products = require('../models/product');
const { normalizeData, predictRating, cosineSimilarity } = require('../helper/recommender');


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

router.get('/cf', async (req, res, next) => {
  const productCatalog = await Products.find({})
    .limit(5000);

  try {
    const similarTable = {};
    // for each item in product catalog I1
    const mapping = await productCatalog.map(async (product, index) => {
      // for each customer who rated product I1
      const customers = await Users.find({
        'ratings.asin': product.asin,
      });

      customers.map((customer) => {
        const { ratings } = customer;

        // for each item I2 rated by customer, record that
        // a customer purchased both I1 and I2
        return ratings.map((rating) => {
          if (product.asin === rating.asin) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(similarTable, product.asin)) {
            similarTable[product.asin] = {};
          }

          if (!similarTable[product.asin][rating.asin]) {
            similarTable[product.asin][rating.asin] = 1;
          } else {
            similarTable[product.asin][rating.asin] += 1;
          }

          return true;
        });
      });

      console.log(`Writing ${(index * 100) / productCatalog.length}%...`);
    });

    Promise.all(mapping)
      .then(() => {
        fs.writeFile('simTable.json', JSON.stringify(similarTable), 'utf8', (err, string) => {
          console.log('Done Writing');


          // });
        });
        res.send(similarTable);
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
});

router.get('/cf/do/:asin', async (req, res, next) => {
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
        // then push the similarity to database
        simScore = {
          ...simScore,
          [otherKey]: cosineSimilarity(curItem, other),
        };

        return true;
      });

    Promise.all(constructSimScore)
      .then(async () => {
        // sort the similarity score table
        simScore = await Object.keys(simScore)
          .sort((a, b) => simScore[b] - simScore[a]);

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
});

module.exports = router;
