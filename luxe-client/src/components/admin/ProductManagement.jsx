import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Upload,
  Image,
  Eye,
  Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
} from '../../services/productService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Dialog } from '../ui/Dialog';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  stock: z.number().min(0, 'Stock must be positive'),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
});

export const ProductManagement = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: productsData, isLoading, refetch } = useGetProductsQuery({ search });
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data || [];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category?._id || product.category,
      brand: product.brand,
      stock: product.stock,
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'isFeatured' && key !== 'isBestSeller') {
          formData.append(key, value);
        }
      });
      formData.append('isFeatured', data.isFeatured);
      formData.append('isBestSeller', data.isBestSeller);

      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, data: formData }).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await createProduct(formData).unwrap();
        toast.success('Product created successfully!');
      }

      setIsModalOpen(false);
      reset();
      setSelectedImages([]);
      setImagePreviews([]);
      setEditingProduct(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted successfully!');
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete product');
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border hover:bg-accent/50 transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]?.url || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{product.category?.name || 'N/A'}</td>
                  <td className="p-4">
                    <span className="font-medium">₹{product.discountPrice || product.price}</span>
                    {product.discountPrice && (
                      <span className="text-xs text-muted-foreground line-through ml-1">
                        ₹{product.price}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {product.isFeatured && (
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
                          Bestseller
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              {/* Images */}
              <div>
                <label className="text-sm font-medium">Product Images</label>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Input {...register('brand')} />
                  {errors.brand && (
                    <p className="text-sm text-destructive mt-1">{errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input type="number" {...register('stock', { valueAsNumber: true })} />
                  {errors.stock && (
                    <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input type="number" {...register('price', { valueAsNumber: true })} />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Discount Price (₹)</label>
                  <Input type="number" {...register('discountPrice', { valueAsNumber: true })} />
                </div>

                <div>
                  <label className="text-sm font-medium">Colors (comma separated)</label>
                  <Input {...register('colors')} placeholder="Red, Blue, Black" />
                </div>

                <div>
                  <label className="text-sm font-medium">Sizes (comma separated)</label>
                  <Input {...register('sizes')} placeholder="S, M, L, XL" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input {...register('description')} as="textarea" rows={4} />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('isFeatured')} />
                  <span className="text-sm">Featured Product</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('isBestSeller')} />
                  <span className="text-sm">Best Seller</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : 'Save Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Delete Product</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};