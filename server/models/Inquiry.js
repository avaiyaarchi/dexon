const mongoose = require('mongoose');

const SelectedProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: false });

const InquirySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true,
  },
  gstNumber: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
    default: '',
  },
  selectedProducts: [SelectedProductSchema],
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed', 'cancelled'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inquiry', InquirySchema);
