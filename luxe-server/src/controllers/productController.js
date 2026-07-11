import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    brand,
    colors,
    sizes,
    stock,
    isFeatured,
    isBestSeller,
    tags,
    specifications,
  } = req.body;

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, 'Category not found');
  }

  // Handle images upload
  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'luxe/products',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    discountPrice,
    category,
    brand,
    images,
    colors: colors ? colors.split(',') : [],
    sizes: sizes ? sizes.split(',') : [],
    stock,
    isFeatured: isFeatured || false,
    isBestSeller: isBestSeller || false,
    tags: tags ? tags.split(',') : [],
    specifications: specifications ? (() => { try { return JSON.parse(specifications); } catch { return {}; } })() : {},
  });

  res.status(201).json(
    new ApiResponse(201, product, 'Product created successfully')
  );
});

// @desc    Get all products with filters, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    color,
    size,
    rating,
    inStock,
    isFeatured,
    isBestSeller,
  } = req.query;

  // Build filter object
  const filter = {};

  // Search filter
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { description: searchRegex },
    ];
  }

  // Category filter
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      filter.category = categoryDoc._id;
    }
  }

  // Brand filter
  if (brand) {
    filter.brand = brand;
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Color filter
  if (color) {
    filter.colors = color;
  }

  // Size filter
  if (size) {
    filter.sizes = size;
  }

  // Rating filter
  if (rating) {
    filter.rating = { $gte: Number(rating) };
  }

  // Stock filter
  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  // Featured/Best seller filters
  if (isFeatured === 'true') filter.isFeatured = true;
  if (isBestSeller === 'true') filter.isBestSeller = true;

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Get products with population
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / Number(limit));

  res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalProducts,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    }, 'Products fetched successfully')
  );
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar',
      },
    });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Get related products (same category)
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
  })
    .limit(8)
    .select('name price discountPrice images rating');

  res.status(200).json(
    new ApiResponse(200, {
      product,
      relatedProducts,
    }, 'Product fetched successfully')
  );
});

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const {
    name,
    description,
    price,
    discountPrice,
    category,
    brand,
    colors,
    sizes,
    stock,
    isFeatured,
    isBestSeller,
    tags,
    specifications,
  } = req.body;

  // Update fields
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (discountPrice !== undefined) product.discountPrice = discountPrice;
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new ApiError(404, 'Category not found');
    }
    product.category = category;
  }
  if (brand) product.brand = brand;
  if (colors) product.colors = colors.split(',');
  if (sizes) product.sizes = sizes.split(',');
  if (stock !== undefined) product.stock = stock;
  if (isFeatured !== undefined) product.isFeatured = isFeatured;
  if (isBestSeller !== undefined) product.isBestSeller = isBestSeller;
  if (tags) product.tags = tags.split(',');
  if (specifications) product.specifications = (() => { try { return JSON.parse(specifications); } catch { return product.specifications; } })();

  await product.save();

  res.status(200).json(
    new ApiResponse(200, product, 'Product updated successfully')
  );
});

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Delete images from Cloudinary
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  await product.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Product deleted successfully')
  );
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews?.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw new ApiError(400, 'Product already reviewed');
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment,
    createdAt: new Date(),
  };

  product.reviews = product.reviews || [];
  product.reviews.push(review);

  // Update average rating
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();

  res.status(201).json(
    new ApiResponse(201, review, 'Review added successfully')
  );
});

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.status(200).json(
    new ApiResponse(200, brands, 'Brands fetched successfully')
  );
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar',
      },
    });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, product, 'Product fetched successfully')
  );
});