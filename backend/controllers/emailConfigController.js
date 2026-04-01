import EmailConfig from '../models/EmailConfig.js';

// @desc    Get all email configs
// @route   GET /api/email-configs
// @access  Private
export const getEmailConfigs = async (req, res) => {
    try {
        const configs = await EmailConfig.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(configs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new email config
// @route   POST /api/email-configs
// @access  Private
export const createEmailConfig = async (req, res) => {
    const { name, email, appPassword, host, port, secure } = req.body;

    try {
        // Check if config already exists for this email
        const existingConfig = await EmailConfig.findOne({ email });
        if (existingConfig) {
            return res.status(400).json({ message: 'Email configuration already exists for this email address.' });
        }

        const config = await EmailConfig.create({
            user: req.user._id,
            name,
            email,
            appPassword,
            host,
            port,
            secure
        });

        res.status(201).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete email config
// @route   DELETE /api/email-configs/:id
// @access  Private
export const deleteEmailConfig = async (req, res) => {
    try {
        const config = await EmailConfig.findById(req.params.id);

        if (!config) {
            return res.status(404).json({ message: 'Email configuration not found' });
        }

        // Only let ADMIN or the user who created it delete it
        if (req.user.role !== 'ADMIN' && config.user.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'Not authorized to delete this configuration' });
        }

        await config.deleteOne();
        res.status(200).json({ message: 'Email configuration removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
