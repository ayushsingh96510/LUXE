import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
  } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'No order items');
  }

  // Validate items and calculate total
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ApiError(404, `Product ${item.product} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Not enough stock for ${product.name}`);
    }

    const price = product.discountPrice || product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      image: product.images[0]?.url || '',
    });
  }

  // Atomically decrement stock for all items
  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
    if (!result) {
      throw new ApiError(400, `Insufficient stock for product ${item.product}`);
    }
  }

  const tax = subtotal * 0.12;
  const shippingCost = subtotal > 500 ? 0 : 50;
  let discount = 0;

  if (couponCode) {
    const { Coupon } = await import('../models/Coupon.js');
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (coupon && coupon.expiresAt > new Date()) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = coupon.discountValue;
      }
    }
  }

  const total = subtotal + tax + shippingCost - discount;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    tax,
    shippingCost,
    discount,
    total,
    couponCode: couponCode || null,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
    orderStatus: 'Processing',
  });

  // Populate order details
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.product', 'name images');

  res.status(201).json(
    new ApiResponse(201, populatedOrder, 'Order placed successfully')
  );
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name images')
    .sort('-createdAt');

  res.status(200).json(
    new ApiResponse(200, orders, 'Orders fetched successfully')
  );
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images brand');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check if user is authorized to view this order
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  res.status(200).json(
    new ApiResponse(200, order, 'Order fetched successfully')
  );
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'Delivered') order.deliveredAt = new Date();

  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, 'Order status updated successfully')
  );
});

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to cancel this order');
  }

  if (order.orderStatus === 'Delivered') {
    throw new ApiError(400, 'Cannot cancel delivered order');
  }

  if (order.orderStatus === 'Cancelled') {
    throw new ApiError(400, 'Order is already cancelled');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.orderStatus = 'Cancelled';
  await order.save();

  res.status(200).json(
    new ApiResponse(200, order, 'Order cancelled successfully')
  );
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sort = '-createdAt',
  } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('items.product', 'name')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const totalOrders = await Order.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalOrders,
        totalPages: Math.ceil(totalOrders / Number(limit)),
      },
    }, 'Orders fetched successfully')
  );
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json(
    new ApiResponse(200, {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders,
    }, 'Order stats fetched successfully')
  );
});