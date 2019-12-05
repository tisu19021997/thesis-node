/**
 * Convert product object to product model to fit with some usages
 * when saving products to localStorage, e.g save products to carts,
 * save browsing history.
 *
 * @param product The product object retrieve from database
 * @param quantity Product's quantity
 * @returns {{product: *, quantity: *}}
 */

export const toProductModel = (product, quantity = 1) => {
  if (typeof product !== 'object') {
    throw new Error('Type Error: The product type must be object');
  }

  return {
    product,
    quantity,
  };
};
