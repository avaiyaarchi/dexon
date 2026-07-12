const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public (filtered by isVisible if query says so)
const getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.visibleOnly === 'true') {
      filter.isVisible = true;
    }
    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, description, displayOrder, isVisible } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide category name' });
    }

    const slug = generateSlug(name);
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with a similar name already exists' });
    }

    let imageUrl = '';
    let publicId = '';

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'categories');
      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image: imageUrl,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      isVisible: isVisible === 'false' ? false : true,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, description, displayOrder, isVisible } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updateFields = {
      description,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : category.displayOrder,
      isVisible: isVisible !== undefined ? (isVisible === 'false' ? false : true) : category.isVisible,
    };

    if (name && name !== category.name) {
      updateFields.name = name;
      updateFields.slug = generateSlug(name);
      // Ensure new slug is unique
      const existing = await Category.findOne({ slug: updateFields.slug, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another category with this name already exists' });
      }
    }

    if (req.file) {
      // Delete old image if exists
      if (category.image && category.image.includes('cloudinary')) {
        const parts = category.image.split('/');
        const fileNameWithExt = parts[parts.length - 1];
        const publicId = 'categories/' + fileNameWithExt.split('.')[0];
        await deleteFromCloudinary(publicId);
      }
      // Upload new image
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'categories');
      updateFields.image = uploadResult.url;
    }

    category = await Category.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if category has associated products
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is associated with ${productsCount} products. Please reassign or delete the products first.`
      });
    }

    // Delete image from Cloudinary
    if (category.image && category.image.includes('cloudinary')) {
      const parts = category.image.split('/');
      const fileNameWithExt = parts[parts.length - 1];
      const publicId = 'categories/' + fileNameWithExt.split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
