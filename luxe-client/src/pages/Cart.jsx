import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus,
  Plus,
  X,
  ShoppingCart,
  ArrowRight,
  Trash2,
  Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
} from '../redux/slices/cartSlice';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';

export const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleUpdateQuantity = (productId, quantity, size, color) => {
    dispatch(updateQuantity({ productId, quantity, size, color }));
  };

  const handleRemoveItem = (productId, size, color) => {
    dispatch(removeFromCart({ productId, size, color }));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      // Validate coupon via API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: couponCode,
          subtotal: total,
        }),
      });

      const data = await response.json();
      if (data.success) {
        dispatch(
          applyCoupon({
            code: couponCode,
            discount: data.data.discount,
          })
        );
        toast.success(`Coupon applied! You saved ₹${data.data.discount}`);
      } else {
        toast.error(data.message || 'Invalid coupon');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/shop">
            <Button size="lg">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button variant="ghost" onClick={handleClearCart} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`${item.product}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <Card className="p-4">
                    <CartItem
                      item={item}
                      onUpdateQuantity={(quantity) =>
                        handleUpdateQuantity(item.product, quantity, item.size, item.color)
                      }
                      onRemove={() => handleRemoveItem(item.product, item.size, item.color)}
                    />
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link to="/shop">
              <Button variant="ghost" className="mt-4">
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                {/* Coupon */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                </div>

                <CartSummary />

                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure checkout • Free shipping on orders above ₹500
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
