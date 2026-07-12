const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  actionType: {
    type: String,
    enum: ['increase', 'decrease', 'manual-adjustment'],
    required: true,
  },
  quantityChanged: {
    type: Number,
    required: true,
  },
  remainingStock: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
