/**
 * Min-Max Normalization
 *
 * @param v {number} Instance value of attribute A
 * @param minA {number} Maximum value of attribute A
 * @param maxA {number} Minimum value of attribute A
 * @returns {number}
 */
const normalizeData = (v, minA, maxA) => ((v - minA) / (maxA - minA));

const compareDistance = (user1, user2) => user1.distance - user2.distance;

/**
 * Calculate the Euclidean Distance between two users
 *
 * @param user1 {object}
 * @param user2 {object}
 * @param products {array} Array of all products
 * @returns {number} Distance between two usersr
 */
const euclideanDistance = (user1, user2, products) => {
  const { ratings: ratingsList1 } = user1;
  const { ratings: ratingsList2 } = user2;
  let sumSquare = 0;

  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];
    const rating1 = ratingsList1[product];
    const rating2 = ratingsList2[product];
    let difference = 0;

    if (!rating1 && !rating2) {
      // if both ratings are missing, the difference equals to 1
      difference = 1;
    } else if (!rating1 || !rating2) {
      const ratingValue = rating1 || rating2;

      // if one of the values is missing, the difference equals the greater of
      // | 1 - value | and | 0 - value |
      difference = Math.abs(1 - ratingValue) > Math.abs(0 - ratingValue)
        ? Math.abs(1 - ratingValue) : Math.abs(0 - ratingValue);
    } else {
      difference = rating1 - rating2;
    }

    // square the difference
    sumSquare += difference ** 2;
  }

  const distance = Math.sqrt(sumSquare);

  // normalize the distance
  return distance / products.length;
};

/**
 * Find the K-th Nearest Neighbors of a given user
 *
 * @param user {object}
 * @param data {object}
 * @param k {number} Number of neighbors to return, default 5
 * @returns {* || object}
 */
const findKNN = (user, data, k = 5) => {
  const { users, products } = data;

  if (users.length === -1) {
    throw new Error('Empty users data.');
  }

  return users.map((otherUser) => (
    {
      ...otherUser,
      distance: euclideanDistance(user, otherUser, products),
    }))
    .sort(compareDistance)
    .slice(0, k);
};

const predictRating = async (user, data, k = 5) => {
  const knn = findKNN(user, data, k);
  const { products } = data;
  const userWithPredictions = user;

  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];

    if (!user.ratings[product]) {
      let weightedSum = 0;
      let distSum = 0;

      knn.map((neighbor) => {
        const { distance, ratings } = neighbor;
        const neighborRating = ratings[product];

        if (!neighborRating) {
          return false;
        }

        weightedSum += neighborRating * distance;
        distSum += distance;

        return true;
      });

      userWithPredictions.ratings[product] = weightedSum !== 0 && distSum !== 0
        ? weightedSum / distSum
        : 0;
    }
  }

  return userWithPredictions;
};

module.exports = {
  findKNN,
  normalizeData,
  predictRating,
};
