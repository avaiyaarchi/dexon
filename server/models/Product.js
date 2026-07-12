const mongoose = require('mongoose');

const SpecificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subcategory: {
    type: String,
    trim: true,
    default: '',
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  specifications: [SpecificationSchema],
  dimensions: {
    type: String,
    trim: true,
    default: '',
  },
  material: {
    type: String,
    trim: true,
    default: '',
  },
  color: {
    type: String,
    trim: true,
    default: '',
  },
  features: [String],
  applications: [String],
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
  availability: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock'],
    default: 'in-stock',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  isBestSeller: {
    type: Boolean,
    default: false,
  },
  images: [ImageSchema],
  seoTitle: {
    type: String,
    trim: true,
    default: '',
  },
  seoDescription: {
    type: String,
    trim: true,
    default: '',
  },
  seoKeywords: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto adjust availability based on stockQuantity before saving
ProductSchema.pre('save', function (next) {
  if (this.stockQuantity <= 0) {
    this.availability = 'out-of-stock';
  } else if (this.stockQuantity <= 10) {
    this.availability = 'low-stock';
  } else {
    this.availability = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
