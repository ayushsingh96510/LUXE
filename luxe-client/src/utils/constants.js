export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
};

export const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery' },
  { id: 'Card', label: 'Credit/Debit Card' },
  { id: 'UPI', label: 'UPI' },
];

export const ORDER_STATUS = [
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const PRODUCT_CATEGORIES = [
  'Shoes',
  'Hoodies',
  'Watches',
  'Perfume',
  'Electronics',
  'Accessories',
];

export const COLORS = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Pink',
  'Purple',
  'Orange',
  'Brown',
  'Gray',
  'Navy',
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const SHIPPING_COST = 50;
export const FREE_SHIPPING_THRESHOLD = 500;
export const TAX_RATE = 0.12;

export const TOAST_DURATION = 3000;

export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 100,
};

export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  pincode: /^[0-9]{6}$/,
};