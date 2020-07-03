const express = require('express');

const router = express.Router();
const fs = require('fs');
const Categories = require('../models/category');
const controller = require('../controllers/category');

router.get('/', controller.getCategories);

// test
router.get('/utils', (req, res, next) => {
  // const isArrayInArray = (arr, item) => {
  //   const str = JSON.stringify(item);
  //
  //   return arr.some((ele) => {
  //     return JSON.stringify(ele) === str;
  //   });
  // };
  //
  // Products.find({})
  //   .then(async (products) => {
  //     let result = [];
  //     const test = await products.map((product) => {
  //       const { categories } = product;
  //
  //       if (!product.categories) {
  //         return false;
  //       }
  //
  //       categories.map((category) => {
  //         if (!isArrayInArray(result, category)) {
  //           result = [...result, category];
  //           return true;
  //         }
  //
  //         return false;
  //       });
  //     });
  //
  //     Promise.all(test)
  //       .then(() => {
  //         res.send(result);
  //       })
  //       .catch((e) => {
  //         next(e);
  //       });
  //   })
  //   .catch((e) => next(e));

  fs.readFile('./data-dev/cat-new.json', 'utf8', async (err, batch) => {
    if (err) {
      next(err);
    }

    const data = await JSON.parse(batch);

    data.map((cat) => {
      Categories.create({
        name: cat,
        iconClass: 'headphones-alt',
        imUrl: 'https://images-na.ssl-images-amazon.com/images/G/01/US-hq/2017/img/PC_Hardware/XCM_1091025_Manual_750x375_1091025_pcgg_post_desktop_cg_750x375_jpg_PC147_Post_PCGG_creative.jpg',
      });
      return true;
    });
  });
});

router.get('/:id', controller.getProductsInCategories);


module.exports = router;
