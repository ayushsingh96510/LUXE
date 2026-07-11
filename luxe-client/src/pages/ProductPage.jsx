import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetProductQuery } from '../services/productService';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductReviews } from '../components/product/ProductReviews';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { data, isLoading } = useGetProductQuery(id);
  const product = data?.data?.product;
  const relatedProducts = data?.data?.relatedProducts || [];
  const { wishlist } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlist?.some((item) => item._id === product?._id);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] || '');
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  const {
    name,
    description,
    price,
    discountPrice,
    images,
    colors,
    sizes,
    stock,
    rating,
    numReviews,
    brand,
    category,
    specifications,
  } = product;

  const finalPrice = discountPrice || price;
  const discount = price - finalPrice;
  const discountPercent = price > 0 ? Math.round((discount / price) * 100) : 0;
  const isInStock = stock > 0;

  const handleAddToCart = () => {
    if (!isInStock) {
      toast.error('Out of stock!');
      return;
    }
    dispatch(
      addToCart({
        product,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    );
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product._id));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary transition">
            Shop
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${category?.slug}`}
            className="hover:text-primary transition"
          >
            {category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted"
            >
              <img
                src={images[selectedImage]?.url || 'https://via.placeholder.com/600'}
                alt={name}
                className="h-full w-full object-cover"
              />
              {discountPercent > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1">
                  -{discountPercent}% OFF
                </Badge>
              )}
              {!isInStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge className="bg-destructive text-white text-xl px-6 py-3">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Brand & Category */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{brand}</span>
              <span className="text-muted-foreground">•</span>
              <Link
                to={`/shop?category=${category?.slug}`}
                className="text-primary hover:underline"
              >
                {category?.name}
              </Link>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating?.toFixed(1) || 0}</span>
                <span className="text-muted-foreground">
                  ({numReviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">₹{finalPrice}</span>
              {discountPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{price}
                </span>
              )}
              {discountPercent > 0 && (
                <Badge className="bg-green-500 text-white">Save ₹{discount}</Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{description}</p>

            {/* Colors */}
            {colors?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Color: {selectedColor}</h3>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition ${
                        selectedColor === color
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-muted'
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Size: {selectedSize}</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-input">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-accent transition"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="p-2 hover:bg-accent transition"
                    disabled={quantity >= stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stock} units available
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="flex-1 min-w-[200px]"
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 min-w-[200px]"
                onClick={handleBuyNow}
                disabled={!isInStock}
              >
                Buy Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlist}
                className={isWishlisted ? 'text-red-500' : ''}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted ? 'fill-red-500' : ''
                  }`}
                />
              </Button>
              <Button size="lg" variant="outline" onClick={() => toast.success('Link copied!')}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-primary" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>Easy Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-border">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                <p>{description}</p>
              </div>
            )}

            {activeTab === 'specifications' && specifications && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-4 rounded-lg bg-muted/30">
                    <span className="font-medium capitalize">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && <ProductReviews productId={product._id} reviews={product.reviews} />}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};