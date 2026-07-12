const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');

// @desc    Get all inventory adjustment logs
// @route   GET /api/inventory/logs
// @access  Private (Admin)
const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find({})
      .populate('product', 'name sku images')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick adjust product stock
// @route   POST /api/inventory/adjust
// @access  Private (Admin)
const adjustStock = async (req, res) => {
  try {
    const { productId, actionType, quantity, notes } = req.body;

    if (!productId || !actionType || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide productId, actionType, and quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qty = parseInt(quantity);
    let originalStock = product.stockQuantity;
    let newStock = originalStock;

    if (actionType === 'increase') {
      newStock += qty;
    } else if (actionType === 'decrease') {
      newStock = Math.max(0, newStock - qty);
    } else if (actionType === 'manual-adjustment') { // matches schema
      newStock = qty;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid actionType. Must be increase, decrease, or manual-adjustment' });
    }

    product.stockQuantity = newStock;
    await product.save();

    const change = newStock - originalStock;
    const log = await InventoryLog.create({
      product: product._id,
      actionType: change >= 0 ? 'increase' : 'decrease',
      quantityChanged: Math.abs(change),
      remainingStock: newStock,
      notes: notes || 'Quick adjustment',
      performedBy: req.user._id
    });

    res.json({
      success: true,
      product,
      log
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventoryLogs,
  adjustStock
};
