import express from 'express';
import { loginUser, changePassword, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/change-password', protect, changePassword);
router.get('/profile', protect, getUserProfile);

export default router;
