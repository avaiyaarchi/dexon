const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getProducts)
  .post(protect, upload.array('images', 10), createProduct);

router.route('/slug/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .get(getProductById)
  .put(protect, upload.array('images', 10), updateProduct)
  .delete(protect, deleteProduct);

router.route('/:id/duplicate')
  .post(protect, duplicateProduct);

module.exports = router;
