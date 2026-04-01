import Campaign from '../models/Campaign.js';

// The base64 transparent 1x1 GIF
const transparentPixelBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const transparentPixelBuffer = Buffer.from(transparentPixelBase64, 'base64');

// @desc    Track email opens via tracking pixel
// @route   GET /api/analytics/open/:campaignId/:email
// @access  Public (Hit by email clients directly)
export const trackOpen = async (req, res) => {
    try {
        const { campaignId, email } = req.params;

        // Try to update campaign analytics in background so we don't delay the image load
        Campaign.findById(campaignId)
            .then(campaign => {
                if (campaign) {
                    campaign.opens += 1;
                    if (!campaign.uniqueOpens.includes(email)) {
                        campaign.uniqueOpens.push(email);
                    }
                    campaign.save();
                }
            })
            .catch(err => console.error('Error tracking open:', err));

    } catch (error) {
        console.error('Error tracking open pixel:', error);
    } finally {
        // Always return the standard transparent 1x1 GIF pixel
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': transparentPixelBuffer.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.end(transparentPixelBuffer);
    }
};

// @desc    Track link clicks via redirect
// @route   GET /api/analytics/click/:campaignId/:email?url=...
// @access  Public
export const trackClick = async (req, res) => {
    try {
        const { campaignId, email } = req.params;
        const targetUrl = req.query.url;

        // If no target URL, just send back to a fallback or 404
        if (!targetUrl) {
            return res.status(400).send('Invalid redirect URL');
        }

        // Try to update analytics
        try {
            const campaign = await Campaign.findById(campaignId);
            if (campaign) {
                campaign.clicks += 1;
                if (!campaign.uniqueClicks.includes(email)) {
                    campaign.uniqueClicks.push(email);
                }
                await campaign.save();
            }
        } catch (err) {
            console.error('Error tracking click:', err);
        }

        // Redirect user to the actual target URL
        return res.redirect(302, targetUrl);

    } catch (error) {
        console.error('Error in click tracking handler:', error);
        res.status(500).send('Internal Server Error');
    }
};
