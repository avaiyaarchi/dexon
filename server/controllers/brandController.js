const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ name: 1 });
    res.json({ success: true, count: brands.length, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get brand by ID
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private (Admin)
const createBrand = async (req, res) => {
  try {
    const { name, description, website } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide brand name' });
    }

    const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingBrand) {
      return res.status(400).json({ success: false, message: 'Brand with this name already exists' });
    }

    let logoUrl = '';
    let publicId = '';

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'brands');
      logoUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    const brand = await Brand.create({
      name,
      logo: logoUrl,
      description,
      website: website || '',
    });

    res.status(201).json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private (Admin)
const updateBrand = async (req, res) => {
  try {
    const { name, description, website } = req.body;
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    const updateFields = {
      description,
      website: website !== undefined ? website : brand.website,
    };

    if (name && name !== brand.name) {
      // Ensure unique name
      const existing = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another brand with this name already exists' });
      }
      updateFields.name = name;
    }

    if (req.file) {
      // Delete old logo from Cloudinary
      if (brand.logo && brand.logo.includes('cloudinary')) {
        const parts = brand.logo.split('/');
        const fileNameWithExt = parts[parts.length - 1];
        const publicId = 'brands/' + fileNameWithExt.split('.')[0];
        await deleteFromCloudinary(publicId);
      }
      // Upload new logo
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'brands');
      updateFields.logo = uploadResult.url;
    }

    brand = await Brand.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private (Admin)
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // Check if brand has associated products
    const productsCount = await Product.countDocuments({ brand: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. It is associated with ${productsCount} products. Please reassign or delete the products first.`
      });
    }

    // Delete logo from Cloudinary
    if (brand.logo && brand.logo.includes('cloudinary')) {
      const parts = brand.logo.split('/');
      const fileNameWithExt = parts[parts.length - 1];
      const publicId = 'brands/' + fileNameWithExt.split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    await brand.deleteOne();

    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
