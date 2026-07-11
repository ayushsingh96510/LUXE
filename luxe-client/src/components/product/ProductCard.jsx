import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const isWishlisted = wishlist?.some((item) => item._id === product._id);

  const {
    _id,
    name,
    price,
    discountPrice,
    images,
    rating,
    numReviews,
    stock,
  } = product;

  const finalPrice = discountPrice || price;
  const discount = price - finalPrice;
  const discountPercent = price > 0 ? Math.round((discount / price) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(_id));
  };

  return (
    <Link to={`/product/${_id}`}>
      <Card
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Image */}
          <img
            src={images[0]?.url || 'https://via.placeholder.com/400'}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{discountPercent}%
            </Badge>
          )}

          {/* Stock Badge */}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-destructive text-white text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center gap-4"
          >
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg"
              onClick={handleAddToCart}
              disabled={stock === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg"
              onClick={handleWishlist}
            >
              <Heart
                className={`h-4 w-4 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-medium line-clamp-1">{name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating || 0}</span>
              <span className="text-sm text-muted-foreground">
                ({numReviews || 0})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">₹{finalPrice}</span>
              {discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{price}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};