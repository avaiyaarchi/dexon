const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  downloadPDF,
  exportCSV,
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(createInquiry)
  .get(protect, getInquiries);

router.get('/export/csv', protect, exportCSV);

router.route('/:id')
  .get(protect, getInquiryById)
  .delete(protect, deleteInquiry);

router.put('/:id/status', protect, updateInquiryStatus);
router.get('/:id/pdf', protect, downloadPDF);

module.exports = router;
