import crypto from 'crypto';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken')
    .populate('addresses')
    .populate('wishlist', 'name price discountPrice images');

  res.status(200).json(
    new ApiResponse(200, user, 'Profile fetched successfully')
  );
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;

  if (req.file) {
    if (user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'luxe/users',
          transformation: [{ width: 400, height: 400, crop: 'fill' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await user.save();

  const updatedUser = await User.findById(user._id)
    .select('-password -refreshToken');

  res.status(200).json(
    new ApiResponse(200, updatedUser, 'Profile updated successfully')
  );
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist
// @access  Private
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  const index = user.wishlist.indexOf(productId);
  if (index > -1) {
    user.wishlist.splice(index, 1);
    await user.save();
    return res.status(200).json(
      new ApiResponse(200, { isWishlisted: false }, 'Removed from wishlist')
    );
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { isWishlisted: true }, 'Added to wishlist')
  );
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name price discountPrice images rating');

  res.status(200).json(
    new ApiResponse(200, user.wishlist, 'Wishlist fetched successfully')
  );
});

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const { Address } = await import('../models/Address.js');
  const address = await Address.create({
    ...req.body,
    user: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: { addresses: address._id },
  });

  res.status(201).json(
    new ApiResponse(201, address, 'Address added successfully')
  );
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password -refreshToken')
    .sort('-createdAt');

  res.status(200).json(
    new ApiResponse(200, users, 'Users fetched successfully')
  );
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'User deleted successfully')
  );
});

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, user, 'User role updated successfully')
  );
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'No account with that email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, { resetToken }, 'Password reset token generated')
  );
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password reset successful')
  );
});
