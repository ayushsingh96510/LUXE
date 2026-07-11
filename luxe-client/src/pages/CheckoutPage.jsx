import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  CreditCard,
  Truck,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clearCart } from '../redux/slices/cartSlice';
import { useCreateOrderMutation } from '../services/orderService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(5, 'Valid pincode is required'),
  paymentMethod: z.enum(['COD', 'Card', 'UPI']),
});

export const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total, discount } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [createOrder] = useCreateOrderMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'COD',
    },
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items, navigate]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        },
        paymentMethod: data.paymentMethod,
      };

      const result = await createOrder(orderData).unwrap();

      if (result.success) {
        setOrderComplete(true);
        dispatch(clearCart());
        toast.success('Order placed successfully!');
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, label: 'Address', icon: MapPin },
    { number: 2, label: 'Payment', icon: CreditCard },
    { number: 3, label: 'Confirm', icon: Check },
  ];

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <Button onClick={() => navigate('/orders')}>View Orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition ${
                  step >= s.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted text-muted-foreground'
                }`}
              >
                {step > s.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`ml-2 font-medium ${
                  step >= s.number ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-4 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Step */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input {...register('fullName')} placeholder="John Doe" />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input {...register('phone')} placeholder="9876543210" />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input {...register('address')} placeholder="123 Main Street" />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input {...register('city')} placeholder="Mumbai" />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">State</label>
                    <Input {...register('state')} placeholder="Maharashtra" />
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Pincode</label>
                    <Input {...register('pincode')} placeholder="400001" />
                    {errors.pincode && (
                      <p className="text-sm text-destructive mt-1">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Payment Step */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {['COD', 'Card', 'UPI'].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
                        paymentMethod === method
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        value={method}
                        {...register('paymentMethod')}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method
                              ? 'border-primary'
                              : 'border-muted'
                          }`}
                        >
                          {paymentMethod === method && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="font-medium">{method}</span>
                        {method === 'COD' && (
                          <span className="text-sm text-muted-foreground">
                            Cash on Delivery
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="text-sm text-destructive mt-2">{errors.paymentMethod.message}</p>
                )}
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-24">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{total}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (12%)</span>
                      <span>₹{(total * 0.12).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{total > 500 ? 'Free' : '₹50'}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>
                          ₹{(
                            total -
                            (discount || 0) +
                            (total > 500 ? 0 : 50) +
                            total * 0.12
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-6"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        Processing...
                      </span>
                    ) : (
                      'Place Order'
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    <Truck className="inline h-3 w-3 mr-1" />
                    Free shipping on orders above ₹500
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
