import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTheme } from './ThemeProvider';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              LUXE
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition">
              Home
            </Link>
            <Link to="/shop" className="text-sm font-medium hover:text-primary transition">
              Shop
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium hover:text-primary transition">
                Admin
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 rounded-full border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent transition"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-accent transition">
              <Heart className="h-5 w-5" />
              {wishlist?.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  {wishlist.length}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-accent transition">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                  {items.length}
                </Badge>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-accent transition">
                  <img
                    src={user?.avatar?.url || 'https://via.placeholder.com/40'}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-accent transition"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-accent transition"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-accent transition w-full text-left text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full hover:bg-accent transition"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-sm font-medium hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  className="text-sm font-medium hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  Shop
                </Link>
                {isAuthenticated && user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium hover:text-primary transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="pt-4 border-t border-border">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-l-full border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-r-full hover:bg-primary/90 transition"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};