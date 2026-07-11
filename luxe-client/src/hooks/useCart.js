import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, total, discount } = useSelector((state) => state.cart);

  const addItem = (product, quantity = 1, size, color) => {
    dispatch(addToCart({ product, quantity, size, color }));
  };

  const removeItem = (productId, size, color) => {
    dispatch(removeFromCart({ productId, size, color }));
  };

  const updateItemQuantity = (productId, quantity, size, color) => {
    dispatch(updateQuantity({ productId, quantity, size, color }));
  };

  const emptyCart = () => {
    dispatch(clearCart());
  };

  return {
    items,
    total,
    discount,
    addItem,
    removeItem,
    updateItemQuantity,
    emptyCart,
  };
};