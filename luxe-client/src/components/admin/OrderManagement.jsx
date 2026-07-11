import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Package,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../../services/orderService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Dialog } from '../ui/Dialog';

const statusColors = {
  Processing: 'bg-yellow-500/20 text-yellow-500',
  Shipped: 'bg-blue-500/20 text-blue-500',
  Delivered: 'bg-green-500/20 text-green-500',
  Cancelled: 'bg-red-500/20 text-red-500',
};

const statusIcons = {
  Processing: <Package className="h-4 w-4" />,
  Shipped: <Truck className="h-4 w-4" />,
  Delivered: <CheckCircle className="h-4 w-4" />,
  Cancelled: <XCircle className="h-4 w-4" />,
};

export const OrderManagement = () => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    status: statusFilter,
    search,
  });
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = data?.data?.orders || [];

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus({ id: orderId, status }).unwrap();
      toast.success(`Order status updated to ${status}`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">Manage all customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border hover:bg-accent/50 transition"
                >
                  <td className="p-4 font-mono text-sm">#{order._id.slice(-8)}</td>
                  <td className="p-4">{order.user?.name || 'Unknown'}</td>
                  <td className="p-4">{order.items.length}</td>
                  <td className="p-4 font-bold">₹{order.total}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusColors[order.orderStatus]}`}>
                      {statusIcons[order.orderStatus]}
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.orderStatus === 'Processing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                      {order.orderStatus === 'Shipped' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Order Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOrderModalOpen(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            {selectedOrder && (
              <div className="p-4 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">#{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusColors[selectedOrder.orderStatus]}`}>
                      {statusIcons[selectedOrder.orderStatus]}
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p>{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                    </p>
                    <p>{selectedOrder.shippingAddress?.pincode}</p>
                    <p>{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-3">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                      >
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
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
                </div>

                {/* Summary */}
                <div className="border-t border-border pt-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (12%)</span>
                      <span>₹{selectedOrder.tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>₹{selectedOrder.shippingCost}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Discount</span>
                        <span>-₹{selectedOrder.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span>₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => {
                      handleStatusUpdate(selectedOrder._id, e.target.value);
                    }}
                    className="px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};