import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadImageMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) callback(null, true);
    else callback(new Error('Only image files are allowed'));
  },
});