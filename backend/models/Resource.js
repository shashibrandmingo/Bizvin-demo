import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
    {
        uploaderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileType: {
            type: String,
            enum: ['HTML', 'IMAGE', 'ZIP'],
            required: true,
        },
        fileUrl: { type: String, required: true },
        fileName: { type: String, required: true },
        cloudinaryId: { type: String }, // optional, for deleting later
    },
    { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
