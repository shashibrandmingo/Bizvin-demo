import cron from 'node-cron';
import Campaign from '../models/Campaign.js';
import { processCampaignEmails } from '../controllers/emailController.js';

// Run every minute
const schedulerJob = cron.schedule('* * * * *', async () => {
    try {
        // Find all pending scheduled campaigns where time has passed
        const campaignsToRun = await Campaign.find({
            isScheduled: true,
            status: 'PENDING',
            scheduledAt: { $lte: new Date() }
        });

        if (campaignsToRun.length > 0) {
            console.log(`[Scheduler] Found ${campaignsToRun.length} campaigns to execute.`);

            for (const campaign of campaignsToRun) {
                try {
                    console.log(`[Scheduler] Executing Campaign ID: ${campaign._id} scheduled for ${campaign.scheduledAt}`);

                    // Update status to PROCESSING to prevent double execution
                    campaign.status = 'PROCESSING';
                    await campaign.save();

                    // Send emails
                    await processCampaignEmails(campaign);

                    // Mark as COMPLETED
                    campaign.status = 'COMPLETED';
                    await campaign.save();
                    console.log(`[Scheduler] Campaign ID: ${campaign._id} completed successfully.`);
                } catch (error) {
                    console.error(`[Scheduler] Campaign ID: ${campaign._id} failed:`, error);
                    campaign.status = 'FAILED';
                    await campaign.save();
                }
            }
        }
    } catch (error) {
        console.error('[Scheduler] Error checking for scheduled campaigns:', error);
    }
});

export default schedulerJob;
