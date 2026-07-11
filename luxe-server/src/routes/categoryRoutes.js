import express from 'express';
import { Category } from '../models/Category.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.status(200).json(
    new ApiResponse(200, categories, 'Categories fetched successfully')
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory } = req.body;
  const category = await Category.create({ name, description, parentCategory });
  res.status(201).json(
    new ApiResponse(201, category, 'Category created successfully')
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  await category.deleteOne();
  res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully')
  );
});

router.get('/', getCategories);
router.post('/', protect, adminOnly, createCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
