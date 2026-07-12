const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder_secret',
});

// Configure Multer memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer 
 * @param {string} folder 
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'dexon') => {
  return new Promise((resolve, reject) => {
    // If credentials are placeholders (not configured yet), return a fake URL
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'placeholder_cloud'
    ) {
      console.warn('Cloudinary not configured. Returning placeholder image.');
      return resolve({
        url: `https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600`,
        publicId: `placeholder_${Date.now()}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId 
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('placeholder_')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
