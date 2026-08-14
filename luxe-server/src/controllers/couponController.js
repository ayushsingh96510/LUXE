import { Coupon } from '../models/Coupon.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minimumAmount,
    maxDiscount,
    expiresAt,
    usageLimit,
    userLimit,
    applicableCategories,
    applicableProducts,
  } = req.body;

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(400, 'Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minimumAmount: minimumAmount || 0,
    maxDiscount: maxDiscount || null,
    expiresAt: expiresAt || null,
    usageLimit: usageLimit || null,
    userLimit: userLimit || null,
    applicableCategories: applicableCategories || [],
    applicableProducts: applicableProducts || [],
    createdBy: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, coupon, 'Coupon created successfully')
  );
});

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal, productIds } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    throw new ApiError(400, 'Coupon is no longer active');
  }

  // Check expiration
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new ApiError(400, 'Coupon has expired');
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit exceeded');
  }

  // Check user usage limit
  if (coupon.userLimit) {
    const userUsage = coupon.usedBy.find(
      (u) => u.user.toString() === req.user._id.toString()
    );
    if (userUsage && userUsage.count >= coupon.userLimit) {
      throw new ApiError(400, 'You have already used this coupon');
    }
  }

  // Check minimum amount
  if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
    throw new ApiError(400, `Minimum order amount is ₹${coupon.minimumAmount}`);
  }

  // Check applicable categories/products
  if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
    // Logic to validate if products are eligible
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  res.status(200).json(
    new ApiResponse(200, {
      valid: true,
      discount,
      coupon,
    }, 'Coupon is valid')
  );
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find()
    .populate('createdBy', 'name email')
    .populate('applicableCategories', 'name')
    .populate('applicableProducts', 'name')
    .sort('-createdAt');

  res.status(200).json(
    new ApiResponse(200, coupons, 'Coupons fetched successfully')
  );
});

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  await coupon.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Coupon deleted successfully')
  );
});