const categoryQuery = (category, max = 10) => {
  let newQuery = [];

  // hard code the maximum length of categories array
  // will fix when a better solution
  for (let i = 0; i < max; i += 1) {
    const object = {};
    object[`categories.${i}`] = category;

    newQuery = [...newQuery, object];
  }

  // return new query with $or operator
  return { $or: newQuery };
};

module.exports = {
  categoryQuery,
};
