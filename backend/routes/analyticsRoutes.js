import express from 'express';
import { trackOpen, trackClick } from '../controllers/analyticsController.js';

const router = express.Router();

// These routes must be public because email clients will hit them directly
router.get('/open/:campaignId/:email', trackOpen);
router.get('/click/:campaignId/:email', trackClick);

export default router;
