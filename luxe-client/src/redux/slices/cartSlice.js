import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('luxe-cart');
    return cart ? JSON.parse(cart) : { items: [], total: 0, coupon: null, discount: 0, finalTotal: 0 };
  } catch {
    return { items: [], total: 0, coupon: null, discount: 0, finalTotal: 0 };
  }
};

const saveCartToStorage = (cart) => {
  localStorage.setItem('luxe-cart', JSON.stringify(cart));
};

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size, color } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product === product._id && item.size === size && item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          product: product._id,
          name: product.name,
          price: product.discountPrice || product.price,
          quantity,
          size,
          color,
          image: product.images[0]?.url || '',
          stock: product.stock,
        });
      }

      state.total = calculateTotal(state.items);
      saveCartToStorage(state);
      toast.success('Added to cart!');
    },

    removeFromCart: (state, action) => {
      const { productId, size, color } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.product === productId && item.size === size && item.color === color)
      );
      state.total = calculateTotal(state.items);
      saveCartToStorage(state);
      toast.success('Removed from cart');
    },

    updateQuantity: (state, action) => {
      const { productId, quantity, size, color } = action.payload;
      const item = state.items.find(
        (item) => item.product === productId && item.size === size && item.color === color
      );
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (i) => !(i.product === productId && i.size === size && i.color === color)
          );
        } else {
          item.quantity = Math.min(quantity, item.stock);
        }
        state.total = calculateTotal(state.items);
        saveCartToStorage(state);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      saveCartToStorage(state);
    },

    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
      state.finalTotal = state.total;
      saveCartToStorage(state);
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      state.discount = action.payload.discount;
      state.finalTotal = state.total - state.discount;
      saveCartToStorage(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  removeCoupon,
  applyCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;