const express = require('express');
const fs = require('fs');
const { findIndex } = require('lodash');
const User = require('../models/user');
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

      User.findOne({ username: reviwerID })
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

router.get('/ml', async (req, res, next) => {
  const getProducts = await Products.find({})
    .limit(2000)
    .select('asin -_id') // select only asin field, also exclude id
    .then((products) => products.map((product) => product.asin))
    .catch((error) => {
      next(error);
    });

  const getUsers = await Users.find({})
    .then((users) => {
      let ratingList = [];
      users.map((user) => {
        const { ratings, username } = user;
        const ratingObject = {};

        ratings.map((rating) => {
          const { asin, overall } = rating;
          ratingObject[asin] = normalizeData(overall, 1, 5);

          return true;
        });

        ratingList = [...ratingList, {
          username,
          ratings: ratingObject,
        }];

        return true;
      });

      return ratingList;
    })
    .catch((error) => {
      next(error);
    });

  Promise.all([getProducts, getUsers])
    .then((result) => {
      const [products, users] = result;

      const data = {
        products,
        users,
      };

      const ratings = predictRating({
        username: 'tisu666',
        ratings: {
          B000001OL3: 1,
          B000001OL6: 1,
          B000001OL2: 1,
          '0972683275': 0,
        },
      }, data);

      Promise.resolve(ratings)
        .then((response) => {
          res.status(200)
            .send(response);
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
