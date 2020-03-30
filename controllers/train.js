const fs = require('fs');
const {
  cosineSimilarity, normalizeData, knnPredict, meanSquaredError,
} = require('../helper/recommender');
const Users = require('../models/user');
const Products = require('../models/product');

// Collaborative Filtering
module.exports.getLocalSimilarityTable = async (req, res, next) => {
  fs.readFile('./data-dev/simTable.json', 'utf8', async (err, stringData) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return next();
      }
    }

    res.locals.similarTable = await JSON.parse(stringData);
    return next();
  });
};

module.exports.generateSimilarityTable = async (req, res, next) => {
  // if the local similarity table existed, skip this step
  if (res.locals.similarTable) {
    return next();
  }

  const productCatalog = await Products.find({});

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

      console.log(`Build similarity table ${(index * 100) / productCatalog.length}%...`);
    });

    Promise.all(mapping)
      .then(() => {
        res.locals.similarTable = similarTable;
        return next();
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

module.exports.writeSimilarTable = async (req, res, next) => {
  const { similarTable } = res.local;

  fs.writeFile('simTable.json', JSON.stringify(similarTable), 'utf8', (err, string) => {
    if (err) {
      return next(err);
    }
    console.log('Similarity Table has been written as a JSON file.');
    return res.send(similarTable);
  });
};

module.exports.getCfPredictionAndSave = async (req, res, next) => {
  const { asin } = req.params;
  const { similarTable } = res.locals;
  const curItem = similarTable[asin];

  let simScore = {};

  if (!curItem) {
    await res.status(404)
      .send('Product not found.');
    return false;
  }

  const constructSimScore = Object.keys(similarTable)
    .map(async (otherKey) => {
      const other = similarTable[otherKey];

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
      const recommendations = await Object.keys(simScore)
        .sort((a, b) => simScore[b] - simScore[a])
        .filter((item) => item !== asin);

      // save generated recommendations to database
      Products.findOneAndUpdate(
        { asin }, { $set: { 'related.also_rated': recommendations } }, { new: true },
      )
        .then((product) => {
          return res.json(product);
        })
        .catch((e) => {
          next(e);
        });
    })
    .catch((error) => {
      next(error);
    });
};

/* ///////////////////////////////////////////////////////////////////////////// */

// K-Nearest Neighbors
module.exports.getUserData = async (req, res, next) => {
  const { username: name } = req.body;

  Users.findOne({ username: name })
    .then(async (userModel) => {
      if (!userModel) {
        res.status(404)
          .send('User not found');
      }

      res.locals.userModel = await userModel;
      await next();
    });
};

module.exports.normalizeRating = async (req, res, next) => {
  const { userModel } = res.locals;
  const { username, ratings } = userModel;
  const user = {
    username,
    ratings: {},
  };

  const mapping = await ratings.map((rating) => {
    user.ratings[rating.asin] = normalizeData(rating.overall, 1, 5);

    res.locals.actual = {
      ...res.locals.actual,
      [rating.asin]: rating.overall,
    };

    return true;
  });

  Promise.all(mapping)
    .then(() => {
      res.locals.user = user;
      next();
    })
    .catch((e) => {
      next(e);
    });
};

module.exports.getLocalTrainingData = async (req, res, next) => {
  fs.readFile('./data-dev/knnTable.json', 'utf8', async (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return next();
      }
    }

    const users = JSON.parse(data);

    // store the rated product
    let products = [];

    // take only the rated products
    // O(u * r) with `u` is users and `r` is users' ratings
    const mapping = users.map((user) => {
      const { ratings } = user;

      return Object.keys(ratings)
        .map((key) => {
          // prevent duplication
          if (products.indexOf(key) === -1) {
            products = [...products, key];
          }

          return true;
        });
    });

    Promise.all(mapping)
      .then(() => {
        res.locals.data = {
          users,
          products,
        };

        return next();
      })
      .catch((e) => {
        next(e);
      });
  });
};

module.exports.generateTrainingData = async (req, res, next) => {
  // if the local training data exists, skip this middleware
  if (res.locals.data) {
    return next();
  }

  let products = [];
  let userList = [];

  // query for all users in database
  const users = await Users.find({});

  // generate the data needed to do prediction on by iterating through
  // each user, map the ratings extracted from the JSON file to that user
  // O(u * r)
  const mapping = users.map((user) => {
    const { ratings, username } = user;
    const ratingObject = {};

    ratings.map((rating) => {
      const { asin, overall } = rating;
      ratingObject[asin] = normalizeData(overall, 1, 5);

      // only get the rated products to minimize run time
      // this may cause the problem of not yet rated products would never be recommended
      if (products.indexOf(asin) === -1) {
        products = [...products, asin];
      }

      return true;
    });

    userList = [...userList, {
      username,
      ratings: ratingObject,
    }];

    return true;
  });

  Promise.all(mapping)
    .then(() => {
      res.locals.data = {
        users: userList,
        products,
      };
      return next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getKnnPredictionAndSave = async (req, res, next) => {
  const { user, data } = res.locals;
  const prediction = await knnPredict(user, data);
  const { ratings: predictedRatings } = await prediction;

  // save recommendations to database
  Users.findOne({ username: user.username })
    .then((currentUser) => {
      // sorted by rating score
      currentUser.recommendation.knn = Object.keys(predictedRatings)
        .sort((a, b) => predictedRatings[b] - predictedRatings[a]);
      currentUser.save((error) => {
        if (error) {
          next(error);
        }
      });
    })
    .catch((error) => {
      next(error);
    });

  res.locals.prediction = await predictedRatings;
  await next();
};

module.exports.writeTrainingData = async (req, res, next) => {
  const { data } = res.locals;
  const { users } = data;

  await fs.writeFile('./data-dev/knnTable.json', JSON.stringify(users), 'utf8', (err) => {
    if (err) {
      next(err);
    }
    res.status(200)
      .json(data);
  });
};

module.exports.knnEvaluate = async (req, res) => {
  const { prediction, actual } = await res.locals;

  await res.status(200)
    .json({
      mse: meanSquaredError(actual, prediction),
      prediction,
      actual,
    });
};
