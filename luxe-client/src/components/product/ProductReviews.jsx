import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAddReviewMutation } from '../../services/productService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const StarRating = ({ rating, setRating, readonly = false }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && setRating(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-6 w-6 transition ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            } ${!readonly && 'hover:scale-110'}`}
          />
        </button>
      ))}
    </div>
  );
};

export const ProductReviews = ({ productId, reviews = [] }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [addReview] = useAddReviewMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        productId,
        data: { rating, comment },
      }).unwrap();
      toast.success('Review added successfully!');
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Write Review */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Rating</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Comment</label>
            <Input
              as="textarea"
              rows={4}
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !isAuthenticated}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                Submitting...
              </span>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              Please login to write a review
            </p>
          )}
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Customer Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-border pb-4 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={review.user?.avatar?.url || 'https://via.placeholder.com/40'}
                      alt={review.user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium">{review.user?.name || 'User'}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-2">
                  <StarRating rating={review.rating} readonly />
                  <p className="mt-2 text-muted-foreground">{review.comment}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};