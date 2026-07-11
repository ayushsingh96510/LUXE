import { z } from 'zod';
import { REGEX } from './constants';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .regex(REGEX.email, 'Invalid email format');

export const phoneSchema = z
  .string()
  .regex(REGEX.phone, 'Phone number must be 10 digits');

export const pincodeSchema = z
  .string()
  .regex(REGEX.pincode, 'Pincode must be 6 digits');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password is too long');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name is too long');

export const addressSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema,
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
  addressType: z.enum(['home', 'work', 'other']).default('home'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  stock: z.number().min(0, 'Stock must be positive'),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0, 'Discount must be positive'),
  minimumAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  expiresAt: z.string().optional(),
  usageLimit: z.number().min(0).optional(),
  userLimit: z.number().min(0).optional(),
  description: z.string().optional(),
});