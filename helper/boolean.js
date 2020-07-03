const isNumber = (maybeNumber) => typeof maybeNumber === 'number';

const isArrayInArray = (arr, item) => {
  const str = JSON.stringify(item);

  return arr.some((ele) => JSON.stringify(ele) === str);
};

module.exports = {
  isNumber,
  isArrayInArray,
};
