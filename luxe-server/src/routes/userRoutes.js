import express from 'express';
import {
  getProfile,
  updateProfile,
  toggleWishlist,
  getWishlist,
  addAddress,
  getAllUsers,
  deleteUser,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// User routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/wishlist', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);
router.post('/address', protect, addAddress);

// Admin routes
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;