import axios from 'axios';
import { findIndex, sortBy } from 'lodash';
import local from './localStorage';

/**
 * Update user history handler:
 * == 1. Check user logged-in status:
 * ==== a. Logged-in: make a PUT request to update the database
 * ==== b. Guess user: Save history to localStorage
 *
 * @param {object} product
 * @param  {string} user
 * @param {string} token
 * @returns {boolean}
 */
export const saveHistory = (token, product, user = local.get('user') || '') => {
  if (user !== '') {
    axios.put(`/user/${user}/updateHistory`, product)
      .then(() => true)
      .catch((error) => {
        throw new Error(error.message);
      });
  } else {
    let localHistory = local.get('history') || [];

    const historyModel = {
      product,
      time: Date.now(),
    };

    if (findIndex(localHistory, (o) => o.product.asin === product.asin) !== -1) {
      // if the item is already in history, re-order it to the first position
      localHistory = sortBy(localHistory, (item) => item.product._id.toString() !== product._id);
    } else {
      localHistory = [historyModel, ...localHistory];
    }

    local.save('history', localHistory);
  }

  return true;
};
