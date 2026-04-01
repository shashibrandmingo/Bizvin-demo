import sendEmail from '../utils/sendEmail.js';
import Campaign from '../models/Campaign.js';
import Resource from '../models/Resource.js';
import EmailConfig from '../models/EmailConfig.js';
import axios from 'axios';
import AdmZip from 'adm-zip';

// Reusable function to actually send the emails
export const processCampaignEmails = async (campaignData) => {
    // We now expect campaignId to be passed down so we can track it
    const { _id: campaignId, type, fromName, fromEmail, replyTo, toName, toEmails, subject, disclaimer, fileUrl, linkOnImage, emailConfigIds, delay } = campaignData;

    // Base URL for the tracking links (ensure you set this in .env for production)
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    // 1. Prepare the email content based on Type (HTML, IMAGE, ZIP)
    // Note: We generate the base HTML here, but the specific tracking pixel and redirect links 
    // are injected PER RECIPIENT in the mapping function below to track individual emails.
    let baseHtml = '';
    let emailAttachments = [];

    if (type === 'HTML') {
        baseHtml = `
            <div>
              <p>Please click the link to view the content: <a href="{{CLICK_TRACKING_URL}}">View HTML Content</a></p>
              <hr/>
              <small>${disclaimer || ''}</small>
              {{OPEN_TRACKING_PIXEL}}
            </div>
        `;
    } else if (type === 'Image') {
        const imageLink = linkOnImage || '#';
        baseHtml = `
            <div style="text-align: center;">
              <a href="{{CLICK_TRACKING_URL}}" target="_blank">
                 <img src="${fileUrl}" alt="Marketing Campaign" style="max-width: 100%; height: auto;" />
              </a>
              <br/>
              <small>${disclaimer || ''}</small>
              {{OPEN_TRACKING_PIXEL}}
            </div>
        `;
    } else if (type === 'ZIP') {
        baseHtml = `
            <div>
              <h2>Important Attachments Included</h2>
              <p>Please find the attached files for this campaign.</p>
              <hr/>
              <small>${disclaimer || ''}</small>
              {{OPEN_TRACKING_PIXEL}}
            </div>
        `;
        try {
            // Download the ZIP file as a buffer
            const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
            
            // Extract the ZIP contents in memory
            const zip = new AdmZip(Buffer.from(response.data));
            const zipEntries = zip.getEntries();
            
            // Map each file inside the ZIP to an attachment
            zipEntries.forEach((zipEntry) => {
                // Ignore directories, macos meta files, and focus only on actual files
                if (!zipEntry.isDirectory && !zipEntry.entryName.startsWith('__MACOSX/')) {
                    emailAttachments.push({
                        filename: zipEntry.name, // Just use the file name, not the full path in the zip
                        content: zipEntry.getData() // Buffer of the extracted file
                    });
                }
            });
        } catch (error) {
            console.error('Error processing ZIP file for attachments:', error);
            throw new Error('Failed to download or extract ZIP file attachments.');
        }
    }

    // Lookup multiple email settings if emailConfigIds are provided
    let emailConfigs = [];
    if (emailConfigIds && emailConfigIds.length > 0) {
        emailConfigs = await EmailConfig.find({ _id: { $in: emailConfigIds } });
    }

    // Default configuration strategy (if none selected, it uses fallback logic inside sendEmail)
    if (emailConfigs.length === 0) {
        emailConfigs = [null]; 
    }

    // 2. Send the emails Sequentially with Delay and Rotation
    const failures = [];
    const delayMs = (delay || 0) * 1000;

    for (let i = 0; i < toEmails.length; i++) {
        const email = toEmails[i];
        const recipientStr = toName ? `"${toName}" <${email}>` : email;
        const encodedEmail = encodeURIComponent(email);

        // Build the tracking URLs for this specific recipient
        const openTrackingPixel = campaignId ? `<img src="${baseUrl}/api/analytics/open/${campaignId}/${encodedEmail}" width="1" height="1" alt="" style="display:none;" />` : '';

        // Determine the target URL to wrap for click tracking
        let targetUrl = type === 'Image' ? (linkOnImage || '#') : fileUrl;
        let clickTrackingUrl = targetUrl; // Default to direct link if tracking fails

        if (campaignId && targetUrl && targetUrl !== '#') {
            clickTrackingUrl = `${baseUrl}/api/analytics/click/${campaignId}/${encodedEmail}?url=${encodeURIComponent(targetUrl)}`;
        }

        // Inject the tracking elements into the base HTML
        const finalHtml = baseHtml
            .replace('{{OPEN_TRACKING_PIXEL}}', openTrackingPixel)
            .replace('{{CLICK_TRACKING_URL}}', clickTrackingUrl);

        // Pick the sender using Round-Robin rotation
        const currentConfig = emailConfigs[i % emailConfigs.length];

        try {
            await sendEmail({
                to: recipientStr,
                fromName,
                fromEmail,
                subject,
                html: finalHtml,
                replyTo,
                attachments: emailAttachments,
                emailConfig: currentConfig
            });
            console.log(`Sent email ${i + 1}/${toEmails.length} to ${email} via ${currentConfig ? currentConfig.email : 'Fallback OAuth'}`);
        } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
            failures.push(error);
        }

        // Apply delay if more emails are remaining
        if (delayMs > 0 && i < toEmails.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    if (failures.length > 0) {
        const firstErrorStr = String(failures[0]);
        if (firstErrorStr.includes('unauthorized_client') || firstErrorStr.includes('invalid_grant')) {
            throw new Error('Gmail Authentication Failed: Your credentials are invalid or expired.');
        }
        if (failures.length === toEmails.length) {
            throw new Error(`Failed to send any emails in this campaign. Reason: ${String(failures[0])}`);
        }
    }

    return true;
};

// @desc    Send bulk emails immediately
// @route   POST /api/emails/send
// @access  Private
export const sendBulkEmails = async (req, res) => {
    const { type, fromName, fromEmail, replyTo, toName, toEmails, subject, disclaimer, fileUrl, linkOnImage, emailConfigIds, delay } = req.body;

    try {
        if (!toEmails || toEmails.length === 0) {
            return res.status(400).json({ message: 'No recipients provided' });
        }

        // 1. Log the campaign FIRST so we have an ID to track opens/clicks against
        const campaign = await Campaign.create({
            senderId: req.user._id,
            subject,
            type,
            fileUrl,
            recipientCount: toEmails.length,
            status: 'PROCESSING', // Set to processing while sending
            isScheduled: false,
            emailConfigIds,
            delay,
            fromName, fromEmail, replyTo, toName, toEmails, disclaimer, linkOnImage,
            opens: 0, clicks: 0, uniqueOpens: [], uniqueClicks: []
        });

        // 2. Send the emails immediately, passing the campaign ID in the req.body data
        const payloadWithId = { ...req.body, _id: campaign._id };
        await processCampaignEmails(payloadWithId);

        // 3. Mark as completed
        campaign.status = 'COMPLETED';
        await campaign.save();

        res.status(200).json({ message: 'Campaign sent successfully', campaign });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Schedule bulk emails
// @route   POST /api/emails/schedule
// @access  Private
export const scheduleCampaign = async (req, res) => {
    const { type, fromName, fromEmail, replyTo, toName, toEmails, subject, disclaimer, fileUrl, linkOnImage, scheduledAt, emailConfigIds, delay } = req.body;

    try {
        if (!toEmails || toEmails.length === 0) {
            return res.status(400).json({ message: 'No recipients provided' });
        }
        if (!scheduledAt) {
            return res.status(400).json({ message: 'No scheduled time provided' });
        }

        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate <= new Date()) {
            return res.status(400).json({ message: 'Scheduled time must be in the future' });
        }

        const campaign = await Campaign.create({
            senderId: req.user._id,
            subject,
            type,
            fileUrl,
            recipientCount: toEmails.length,
            status: 'PENDING',
            isScheduled: true,
            scheduledAt: scheduledDate,
            emailConfigIds,
            delay,
            fromName, fromEmail, replyTo, toName, toEmails, disclaimer, linkOnImage,
            opens: 0, clicks: 0, uniqueOpens: [], uniqueClicks: []
        });

        res.status(201).json({ message: 'Campaign scheduled successfully', campaign });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending scheduled campaigns
// @route   GET /api/emails/scheduled
// @access  Private
export const getScheduledCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ isScheduled: true, status: 'PENDING' })
            .sort({ scheduledAt: 1 })
            .populate('senderId', 'name email');
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a scheduled campaign
// @route   DELETE /api/emails/scheduled/:id
// @access  Private
export const cancelScheduledCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        if (campaign.status !== 'PENDING') {
            return res.status(400).json({ message: 'Only PENDING scheduled campaigns can be cancelled' });
        }

        campaign.status = 'CANCELLED';
        await campaign.save();

        res.status(200).json({ message: 'Scheduled campaign cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a campaign (Admin only)
// @route   DELETE /api/emails/campaign/:id
// @access  Private/Admin
export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Optional: Check if the user is an admin
        if (req.user.role !== 'ADMIN') {
             return res.status(403).json({ message: 'Not authorized as an admin to delete campaigns' });
        }

        await campaign.deleteOne();
        res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
