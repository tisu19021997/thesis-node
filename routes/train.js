const express = require('express');
const fs = require('fs');
const { findIndex } = require('lodash');
const Users = require('../models/user');
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

// generate recommendation for a user using KNN
router.post('/knn',
  controller.getUserData,
  controller.normalizeRating,
  controller.getLocalTrainingData,
  controller.generateTrainingData,
  controller.getKnnPredictionAndSave,
  controller.knnEvaluate);

// generate training set for KNN
router.post('/knn/trainingSet', controller.generateTrainingData, controller.writeTrainingData);

// item-based collaborative filtering (CF)
router.get('/cf/:asin',
  controller.getLocalSimilarityTable,
  controller.generateSimilarityTable,
  controller.getCfPredictionAndSave);

// generate training set for CF
router.post('/cf/trainingSet', controller.generateSimilarityTable, controller.writeSimilarTable);


module.exports = router;
