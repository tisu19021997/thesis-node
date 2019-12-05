const express = require('express');
const Products = require('../models/product');
const Users = require('../models/user');

module.exports.getPromotion = (req, res, next) => {
  next();
};

module.exports.getRecommendation = (req, res, next) => {
  next();
};

module.exports.getHistory = (req, res, next) => {
  const { username } = req.params;

  if (!username) {
    next();
  }

  Users.findOne({ username })
    .populate('product')
    .sort({ time: 1 })
    .exec()
    .then((user) => {
      res.locals.history = user.history || [];
      next();
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.getDeal = (req, res, next) => {
  next();
};

module.exports.getRelatedItems = (req, res) => {
  const { history } = res.locals;

  res.json({
    history,
  });
};
