const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'stackup/posts',
      resource_type: isImage ? 'image' : 'raw',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'zip'],
      transformation: isImage ? [{ width: 1200, crop: 'limit', quality: 'auto' }] : undefined,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg','image/png','image/gif','image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

module.exports = { cloudinary, upload };
