import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Generate an organized folder structure
        let folder = 'email_marketing/others';
        let resource_type = 'auto';

        if (file.mimetype === 'text/html') {
            folder = 'email_marketing/html';
            resource_type = 'raw';
        } else if (file.mimetype.startsWith('image/')) {
            folder = 'email_marketing/images';
            resource_type = 'image';
        } else if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
            folder = 'email_marketing/zips';
            resource_type = 'raw';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`,
        };
    },
});

export const upload = multer({ storage: storage });
export { cloudinary };
