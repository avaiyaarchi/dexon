const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getCategories)
  .post(protect, upload.single('image'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, upload.single('image'), updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;
