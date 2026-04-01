import express from 'express';
import { uploadFile, getFiles, deleteFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
    .post(protect, upload.single('file'), uploadFile)
    .get(protect, getFiles);

router.route('/:id')
    .delete(protect, deleteFile);

export default router;
