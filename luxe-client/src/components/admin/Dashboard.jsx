import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useGetDashboardStatsQuery,
  useGetRecentOrdersQuery,
} from '../../services/adminService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </Card>
);

export const Dashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetRecentOrdersQuery();

  if (statsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = statsData?.data || {};
  const orders = ordersData?.data || [];

  const statusCounts = stats.ordersByStatus || [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={12.5}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          icon={ShoppingBag}
          trend={8.2}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts || 0}
          icon={Package}
          trend={-2.4}
          color="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={Users}
          trend={15.3}
          color="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold mb-4">Order Status</h3>
          <div className="space-y-3">
            {statusCounts.map((status) => (
              <div key={status._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {status._id === 'Processing' && <Clock className="h-4 w-4 text-yellow-500" />}
                  {status._id === 'Shipped' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                  {status._id === 'Delivered' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {status._id === 'Cancelled' && <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="text-sm capitalize">{status._id}</span>
                </div>
                <span className="font-medium">{status.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Orders</h3>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium">#{order._id.slice(-8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.user?.name || 'Unknown User'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.total}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    order.orderStatus === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                    order.orderStatus === 'Cancelled' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/admin/products/new">
          <Card className="p-4 text-center hover:bg-accent transition cursor-pointer">
            <Package className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-sm font-medium">Add Product</p>
          </Card>
        </Link>
        <Link to="/admin/orders">
          <Card className="p-4 text-center hover:bg-accent transition cursor-pointer">
            <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-sm font-medium">Manage Orders</p>
          </Card>
        </Link>
        <Link to="/admin/users">
          <Card className="p-4 text-center hover:bg-accent transition cursor-pointer">
            <Users className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-sm font-medium">Manage Users</p>
          </Card>
        </Link>
        <Link to="/admin/coupons">
          <Card className="p-4 text-center hover:bg-accent transition cursor-pointer">
            <Tag className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-sm font-medium">Coupons</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};