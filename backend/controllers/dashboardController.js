import Campaign from '../models/Campaign.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const query = req.user.role === 'ADMIN' ? {} : { senderId: req.user._id };

        const totalCampaigns = await Campaign.countDocuments(query);
        const filesUploaded = await Resource.countDocuments(); // Shared globally
        const activeSubAdmins = req.user.role === 'ADMIN' ? await User.countDocuments({ role: 'SUBADMIN', status: 'ACTIVE' }) : 0;

        // Aggregate analytics for Cards
        const aggregation = await Campaign.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRecipients: { $sum: '$recipientCount' },
                    totalOpens: { $sum: '$opens' },
                    totalClicks: { $sum: '$clicks' }
                }
            }
        ]);

        const stats = aggregation[0] || { totalRecipients: 0, totalOpens: 0, totalClicks: 0 };
        const deliveryRate = stats.totalRecipients > 0 ? 100 : 0; // Simplified for now since we don't track bounces yet

        // Fetch recent campaigns for table/charts
        const recentCampaigns = await Campaign.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .select('subject status type recipientCount opens clicks createdAt isScheduled scheduledAt');

        res.json({
            totalCampaigns,
            filesUploaded,
            activeSubAdmins,
            totalRecipients: stats.totalRecipients,
            totalOpens: stats.totalOpens,
            totalClicks: stats.totalClicks,
            deliveryRate,
            recentCampaigns
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
