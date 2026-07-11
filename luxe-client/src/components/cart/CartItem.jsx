import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    await onUpdateQuantity(newQuantity);
    setIsUpdating(false);
  };

  return (
    <div className="flex gap-4">
      {/* Image */}
      <img
        src={item.image || 'https://via.placeholder.com/100'}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg"
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium line-clamp-1">{item.name}</h4>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
          {item.color && <span>Color: {item.color}</span>}
          {item.size && <span>Size: {item.size}</span>}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-bold text-lg">₹{item.price}</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating || item.quantity >= item.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};