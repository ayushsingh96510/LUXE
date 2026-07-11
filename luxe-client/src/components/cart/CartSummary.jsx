import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export const CartSummary = () => {
  const { items, total, discount, finalTotal } = useSelector((state) => state.cart);

  const subtotal = total;
  const tax = subtotal * 0.12;
  const shipping = subtotal > 500 ? 0 : 50;
  const grandTotal = subtotal + tax + shipping - (discount || 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tax (12%)</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
      </div>

      {discount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex justify-between text-sm text-green-500"
        >
          <span>Discount</span>
          <span>-₹{discount.toFixed(2)}</span>
        </motion.div>
      )}

      <div className="border-t border-border pt-3 mt-3">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {subtotal > 0 && subtotal < 500 && (
        <p className="text-xs text-muted-foreground text-center">
          Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
        </p>
      )}
    </div>
  );
};