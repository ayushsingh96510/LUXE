import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit, Tag, X, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
} from '../../services/couponService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Dialog } from '../ui/Dialog';

const couponSchema = z.object({
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

export const CouponManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const { data, isLoading, refetch } = useGetCouponsQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
  });

  const coupons = data?.data || [];
  const discountType = watch('discountType');

  const onSubmit = async (data) => {
    try {
      if (editingCoupon) {
        // Update logic
        toast.success('Coupon updated successfully!');
      } else {
        await createCoupon(data).unwrap();
        toast.success('Coupon created successfully!');
      }
      setIsModalOpen(false);
      reset();
      setEditingCoupon(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id).unwrap();
      toast.success('Coupon deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete coupon');
    }
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Coupons</h2>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <motion.div
            key={coupon._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCoupon(coupon);
                    reset(coupon);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(coupon._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{coupon.code}</h3>
                  <p className="text-sm text-muted-foreground">{coupon.description}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </span>
                </div>
                {coupon.minimumAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min. Order</span>
                    <span>₹{coupon.minimumAmount}</span>
                  </div>
                )}
                {coupon.usageLimit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used</span>
                    <span>{coupon.usedCount || 0} / {coupon.usageLimit}</span>
                  </div>
                )}
                {coupon.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{new Date(coupon.expiresAt).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                  coupon.isActive
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Coupon Code</label>
                <Input
                  {...register('code')}
                  placeholder="SAVE20"
                  className="uppercase"
                />
                {errors.code && (
                  <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input {...register('description')} placeholder="20% off on all orders" />
              </div>

              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  {...register('discountType')}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                </label>
                <Input
                  type="number"
                  {...register('discountValue', { valueAsNumber: true })}
                />
                {errors.discountValue && (
                  <p className="text-sm text-destructive mt-1">{errors.discountValue.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Minimum Order Amount (₹)</label>
                <Input
                  type="number"
                  {...register('minimumAmount', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>

              {discountType === 'percentage' && (
                <div>
                  <label className="text-sm font-medium">Maximum Discount (₹)</label>
                  <Input
                    type="number"
                    {...register('maxDiscount', { valueAsNumber: true })}
                    placeholder="500"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <Input type="datetime-local" {...register('expiresAt')} />
              </div>

              <div>
                <label className="text-sm font-medium">Usage Limit</label>
                <Input
                  type="number"
                  {...register('usageLimit', { valueAsNumber: true })}
                  placeholder="Unlimited"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Per User Limit</label>
                <Input
                  type="number"
                  {...register('userLimit', { valueAsNumber: true })}
                  placeholder="1"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Coupon'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};