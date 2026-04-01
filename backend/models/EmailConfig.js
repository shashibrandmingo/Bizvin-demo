import mongoose from 'mongoose';

const emailConfigSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        appPassword: {
            type: String,
            required: true,
        },
        host: {
            type: String,
            default: 'smtp.gmail.com',
        },
        port: {
            type: Number,
            default: 465,
        },
        secure: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const EmailConfig = mongoose.model('EmailConfig', emailConfigSchema);

export default EmailConfig;
