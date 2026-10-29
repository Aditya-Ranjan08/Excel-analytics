import express from 'express';
import { signup, login, forgotPassword, validateResetToken, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Signup & Login
router.post('/signup', signup);
router.post('/login', login);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Optional: verify token exists
router.get('/reset-password/:token', validateResetToken);

// Reset password
router.put('/reset-password/:token', resetPassword);

export default router;
