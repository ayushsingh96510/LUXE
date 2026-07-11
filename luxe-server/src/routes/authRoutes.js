import express from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;