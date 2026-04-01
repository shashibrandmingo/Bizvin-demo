import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getEmailConfigs,
    createEmailConfig,
    deleteEmailConfig,
} from '../controllers/emailConfigController.js';

const router = express.Router();

// Apply auth middleware to all
router.route('/')
    .get(protect, getEmailConfigs)
    .post(protect, createEmailConfig);

router.route('/:id')
    .delete(protect, deleteEmailConfig);

export default router;
