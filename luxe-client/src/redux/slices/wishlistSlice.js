import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/wishlist', { productId });
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getWishlist = createAsyncThunk(
  'wishlist/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/wishlist');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  wishlist: [],
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlist = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Wishlist
      .addCase(getWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload;
      })
      .addCase(getWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      // Toggle Wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isWishlisted) {
          toast.success('Added to wishlist');
        } else {
          state.wishlist = state.wishlist.filter(
            (item) => item._id !== action.meta.arg
          );
          toast.success('Removed from wishlist');
        }
      })
      .addCase(toggleWishlist.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;