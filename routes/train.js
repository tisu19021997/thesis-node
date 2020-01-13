const express = require('express');
const fs = require('fs');
const { findIndex } = require('lodash');
const Users = require('../models/user');
const Products = require('../models/product');
const controller = require('../controllers/train');

const router = express.Router();

// generate user from ratings JSON file
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

            return Users.updateOne({ username }, {
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
          return Users.create({
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

// knn
router.post('/knn', controller.knnPrediction, controller.knnEvaluate);

// item-based collaborative filtering
router.get('/cf', async (req, res, next) => {
  const productCatalog = await Products.find({})
    .limit(6000);

  try {
    const similarTable = {};
    // for each item in product catalog I1
    const mapping = await productCatalog.map(async (product, index) => {
      // for each customer who rated product I1
      const customers = await Users.find({
        'ratings.asin': product.asin,
      });

      await customers.map((customer) => {
        const { ratings } = customer;

        // for each item I2 rated by customer, record that
        // a customer purchased both I1 and I2
        return ratings.map((rating) => {
          if (product.asin === rating.asin) {
            return false;
          }

          // init an empty object for the product if that product is not in the similar table yet
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

      await console.log(`Writing ${(index * 100) / productCatalog.length}%...`);
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

router.get('/cf/:asin', controller.cfPrediction);

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

module.exports = router;
