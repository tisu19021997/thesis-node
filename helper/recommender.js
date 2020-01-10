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
 * Calculate magnitude of a vector
 *
 * @param vector {array}
 * @returns {number}
 */
const magnitude = (vector) => Math.sqrt(
  vector.reduce((acc, current) => acc + current ** 2, 0),
);

/**
 * Calculate the Cosine Similarity between two items
 *
 * @param item1
 * @param item2
 * @returns {number}
 */
const cosineSimilarity = (item1, item2) => {
  const rating1 = Object.keys(item1)
    .map((key) => item1[key]);
  const rating2 = Object.keys(item2)
    .map((key) => item2[key]);

  const dotProduct = rating1.reduce((acc, current, index) => {
    const currentValue = current || 0;
    const otherRatingValue = rating2[index] || 0;
    return acc + currentValue * otherRatingValue;
  }, 0);

  // magnitude multiplication
  const magMul = magnitude(rating1) * magnitude(rating2);

  return dotProduct / magMul;
};

/**
 * Calculate the Euclidean Distance between two users
 *
 * @param user1 {object}
 * @param user2 {object}
 * @param products {array} Array of all products
 * @returns {number} Distance between two user
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
  try {
    const knn = findKNN(user, data, k);
    const { products } = data;
    const userWithPredictions = user;

    for (let i = 0; i < products.length; i += 1) {
      const product = products[i];

      // if the product hasn't been rated by the current user
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

        userWithPredictions.ratings[product] = weightedSum / (1 + distSum);
      }
    }

    return userWithPredictions;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  cosineSimilarity,
  findKNN,
  normalizeData,
  predictRating,
};
