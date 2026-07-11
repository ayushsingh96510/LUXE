import express from 'express';
import {
  createCoupon,
  validateCoupon,
  getCoupons,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// User routes
router.post('/validate', protect, validateCoupon);

// Admin routes
router.post('/', protect, adminOnly, createCoupon);
router.get('/', protect, adminOnly, getCoupons);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;