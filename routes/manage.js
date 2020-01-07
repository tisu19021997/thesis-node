const express = require('express');
const controller = require('../controllers/store-management');

const router = express.Router();

// product management
router.patch('/products/:id', controller.editProduct);

router.post('/products', controller.validateProduct, controller.createProduct);

router.post('/products/batch', controller.importProducts);

router.delete('/products/:id', controller.deleteProduct);

// user management
router.get('/users', controller.getUsers);

router.post('/users', controller.validateUser, controller.createUser);

router.patch('/users/:id', controller.editUser);

router.delete('/users/:id', controller.deleteUser);


// categories management
router.get('/cats', controller.getCats);

router.post('/cats', controller.addCat);

router.patch('/cats/:id', controller.editCat);

router.delete('/cats/:id', controller.deleteCat);

router.get('/cats/batch', controller.importCat);

module.exports = router;
