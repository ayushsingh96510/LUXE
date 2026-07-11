import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { useGetMyOrdersQuery } from '../../services/orderService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';

const statusIcons = {
  Processing: <Clock className="h-5 w-5 text-yellow-500" />,
  Shipped: <Truck className="h-5 w-5 text-blue-500" />,
  Delivered: <CheckCircle className="h-5 w-5 text-green-500" />,
  Cancelled: <XCircle className="h-5 w-5 text-red-500" />,
};

export const Orders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { data, isLoading } = useGetMyOrdersQuery();
  const orders = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground">Start shopping to see your orders here</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              {/* Order Header */}
              <div className="p-4 bg-muted/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{order._id.slice(-8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    {statusIcons[order.orderStatus]}
                    <span className="text-sm font-medium">{order.orderStatus}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.total}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order._id ? null : order._id)
                    }
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedOrder === order._id ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrder === order._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 border-t border-border"
                >
                  <div className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.product._id}
                          className="flex items-center gap-4"
                        >
                          <img
                            src={item.image || 'https://via.placeholder.com/80'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × ₹{item.price}
                              {item.size && ` • Size ${item.size}`}
                              {item.color && ` • ${item.color}`}
                            </p>
                          </div>
                          <p className="font-bold">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-border pt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (12%)</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>₹{order.shippingCost}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-500">
                          <span>Discount</span>
                          <span>-₹{order.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      {order.orderStatus === 'Processing' && (
                        <Button variant="destructive" size="sm">
                          Cancel Order
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {order.orderStatus === 'Delivered' && (
                        <Button variant="outline" size="sm">
                          Write Review
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};