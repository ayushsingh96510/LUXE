import { useState, useEffect } from 'react';
import { useGetCategoriesQuery, useGetBrandsQuery } from '../../services/productService';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ProductFilters = ({ filters, onFilterChange }) => {
  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();
  const [priceRange, setPriceRange] = useState([
    parseInt(filters.minPrice) || 0,
    parseInt(filters.maxPrice) || 10000,
  ]);

  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const ratings = [5, 4, 3, 2, 1];

  useEffect(() => {
    setPriceRange([
      parseInt(filters.minPrice) || 0,
      parseInt(filters.maxPrice) || 10000,
    ]);
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceChange = (value) => {
    setPriceRange(value);
    onFilterChange('minPrice', value[0]);
    onFilterChange('maxPrice', value[1]);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Filters</h3>

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-2">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange('category', '')}
            className={`text-sm w-full text-left px-2 py-1 rounded transition ${
              !filters.category
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-accent'
            }`}
          >
            All Categories
          </button>
          {categories?.data?.map((category) => (
            <button
              key={category._id}
              onClick={() => onFilterChange('category', category.slug)}
              className={`text-sm w-full text-left px-2 py-1 rounded transition ${
                filters.category === category.slug
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="font-medium mb-2">Brand</h4>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange('brand', '')}
            className={`text-sm w-full text-left px-2 py-1 rounded transition ${
              !filters.brand
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-accent'
            }`}
          >
            All Brands
          </button>
          {brands?.data?.map((brand) => (
            <button
              key={brand}
              onClick={() => onFilterChange('brand', brand)}
              className={`text-sm w-full text-left px-2 py-1 rounded transition ${
                filters.brand === brand
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-2">Price Range</h4>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="my-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-medium mb-2">Color</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('color', '')}
            className={`w-8 h-8 rounded-full border-2 transition ${
              !filters.color
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-muted'
            }`}
            style={{ backgroundColor: 'transparent' }}
          />
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onFilterChange('color', color)}
              className={`w-8 h-8 rounded-full border-2 transition ${
                filters.color === color
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-muted'
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-medium mb-2">Size</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('size', '')}
            className={`px-3 py-1 text-sm rounded-lg border-2 transition ${
              !filters.size
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-muted'
            }`}
          >
            All
          </button>
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onFilterChange('size', size)}
              className={`px-3 py-1 text-sm rounded-lg border-2 transition ${
                filters.size === size
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-medium mb-2">Rating</h4>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange('rating', '')}
            className={`text-sm w-full text-left px-2 py-1 rounded transition ${
              !filters.rating
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-accent'
            }`}
          >
            All Ratings
          </button>
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => onFilterChange('rating', rating)}
              className={`text-sm w-full text-left px-2 py-1 rounded transition ${
                parseInt(filters.rating) === rating
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent'
              }`}
            >
              {rating} ★ & Up
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};