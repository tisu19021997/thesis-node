const express = require('express');
const passport = require('passport');
const controller = require('../controllers/admin');
const Products = require('../models/product');

const router = express.Router();

// product management

router.get('/products', controller.getProducts);

router.post('/products', controller.validateProduct, controller.createProduct);

router.patch('/products/:id', controller.editProduct);

router.post('/products/batch', controller.importProducts);

router.patch('/products/batch/related', controller.bulkUpdateRelatedProducts);

router.get('/products/batch', controller.exportProducts);

router.delete('/products/:id', controller.deleteProduct);

// user management
router.get('/users', controller.getUsers);

// router.post('/users', controller.validateUser, controller.createUser);
router.post('/users', passport.authenticate('local-signup', { session: false }), controller.createUser);

router.patch('/users/:username', controller.editUser);

router.post('/users/batch', controller.importUsers);

router.patch('/users/batch/recommendations', controller.bulkUpdateRecommendations);

router.get('/users/batch', controller.exportUsers);

router.delete('/users/:username', controller.deleteUser);


// categories management
router.get('/cats', controller.getCats);

router.post('/cats', controller.addCat);

router.patch('/cats/:id', controller.editCat);

router.delete('/cats/:id', controller.deleteCat);

router.post('/cats/batch', controller.importCat);

router.get('/cats/batch', controller.exportCat);

module.exports = router;
