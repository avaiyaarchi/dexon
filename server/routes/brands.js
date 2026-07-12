const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getBrands)
  .post(protect, upload.single('logo'), createBrand);

router.route('/:id')
  .get(getBrandById)
  .put(protect, upload.single('logo'), updateBrand)
  .delete(protect, deleteBrand);

module.exports = router;
