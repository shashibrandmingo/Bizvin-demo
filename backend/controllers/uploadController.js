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

        // Determine folder and resource_type based on mimetype
        let folder = 'email_marketing/others';
        let resource_type = 'auto';

        if (req.file.mimetype === 'text/html') {
            folder = 'email_marketing/html';
            resource_type = 'raw';
        } else if (req.file.mimetype.startsWith('image/')) {
            folder = 'email_marketing/images';
            resource_type = 'image';
        } else if (req.file.mimetype === 'application/zip' || req.file.mimetype === 'application/x-zip-compressed') {
            folder = 'email_marketing/zips';
            resource_type = 'raw';
        }

        // Upload to Cloudinary using upload_stream (buffer to cloud)
        const uploadResponse = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: resource_type,
                    public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        let fileType = 'OTHER';
        if (req.file.mimetype === 'text/html') fileType = 'HTML';
        if (req.file.mimetype === 'image/gif') fileType = 'GIF';
        if (req.file.mimetype.startsWith('image/') && req.file.mimetype !== 'image/gif') fileType = 'IMAGE';
        if (req.file.mimetype === 'application/zip' || req.file.mimetype === 'application/x-zip-compressed') fileType = 'ZIP';

        const newResource = await Resource.create({
            uploaderId: req.user._id,
            fileType: fileType,
            fileName: req.file.originalname,
            fileUrl: uploadResponse.secure_url,
            cloudinaryId: uploadResponse.public_id,
        });

        res.status(201).json(newResource);
    } catch (error) {
        console.error('Upload Error:', error);
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
