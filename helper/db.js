module.exports.find = (modelInstance, conditions = {}) => modelInstance.find(conditions);

module.exports.findOne = (modelInstance, conditions = {}) => modelInstance.findOne(conditions);

module.exports.saveToLocals = (res, label, value) => {
  res.locals[label] = value;
};
