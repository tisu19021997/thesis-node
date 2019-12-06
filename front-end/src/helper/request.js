import axios from 'axios';
import { findIndex } from 'lodash';
import local from './localStorage';

/**
 * Save user browsing history either to localStorage or database.
 *
 * @param {object} product
 * @param  {string} user
 * @returns {boolean}
 */
export const saveHistory = (product, user = local.get('user') || '') => {
  if (user !== '') {
    axios.put(`/user/${user}/updateHistory`, product)
      .then((res) => {
        // do something here
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  } else {
    let localHistory = local.get('history') || [];

    const historyModel = {
      product,
      time: Date.now(),
    };

    if (localHistory.length) {
      if (findIndex(localHistory, (o) => o.product.asin === product.asin) !== -1) {
        return false;
      }
      localHistory = [historyModel, ...localHistory];
    } else {
      localHistory = [historyModel, ...localHistory];
    }

    local.save('history', localHistory);
  }

  return true;
};
