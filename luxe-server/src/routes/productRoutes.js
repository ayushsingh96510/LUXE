import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  addReview,
  getBrands,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import {
  validateProduct,
  validateReview,
} from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Private routes
router.post('/:id/reviews', protect, validateReview, addReview);

// Admin routes
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 5),
  validateProduct,
  createProduct
);
router.put(
  '/:id',
  protect,
  adminOnly,
  upload.array('images', 5),
  updateProduct
);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;