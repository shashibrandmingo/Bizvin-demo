import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subject: { type: String, required: true },
        type: {
            type: String,
            enum: ['HTML', 'Image', 'ZIP'],
            required: true,
        },
        fileUrl: { type: String, required: true }, // link to the HTML/Image/Zip
        recipientCount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
            default: 'PENDING',
        },
        // Scheduling Support
        isScheduled: { type: Boolean, default: false },
        scheduledAt: { type: Date },

        // Email Configs used (supports sender rotation)
        emailConfigIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EmailConfig',
        }],
        delay: { type: Number, default: 0 },

        // Data needed to send the email later
        fromName: { type: String },
        fromEmail: { type: String },
        replyTo: { type: String },
        toName: { type: String },
        toEmails: { type: [String] },
        disclaimer: { type: String },
        linkOnImage: { type: String },

        // Analytics Tracking
        opens: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        uniqueOpens: { type: [String], default: [] },
        uniqueClicks: { type: [String], default: [] }
    },
    { timestamps: true }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
