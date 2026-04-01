import Resource from '../models/Resource.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Upload file and save to MongoDB
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let fileType = 'OTHER';
        if (req.file.mimetype === 'text/html') fileType = 'HTML';
        if (req.file.mimetype.startsWith('image/')) fileType = 'IMAGE'; // JPEG or PNG
        if (req.file.mimetype === 'application/zip' || req.file.mimetype === 'application/x-zip-compressed') fileType = 'ZIP';

        const newResource = await Resource.create({
            uploaderId: req.user._id,
            fileType: fileType,
            fileName: req.file.originalname,
            fileUrl: req.file.path, // Cloudinary provides the URL in 'path'
            cloudinaryId: req.file.filename, // Cloudinary public_id
        });

        res.status(201).json(newResource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all uploaded files with pagination
// @route   GET /api/upload?page=1&limit=10
// @access  Private
export const getFiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Resource.countDocuments({});
        const files = await Resource.find({})
            .populate('uploaderId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            files,
            totalFiles: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a file
// @route   DELETE /api/upload/:id
// @access  Private
export const deleteFile = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check ownership or admin status
        if (resource.uploaderId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this file' });
        }

        // Delete from Cloudinary
        if (resource.cloudinaryId) {
            await cloudinary.uploader.destroy(resource.cloudinaryId, {
                resource_type: resource.fileType === 'HTML' || resource.fileType === 'ZIP' ? 'raw' : 'image'
            });
        }

        await Resource.deleteOne({ _id: resource._id });
        res.json({ message: 'File removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
