import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductGrid } from '../components/product/ProductGrid';
import { useGetProductsQuery } from '../services/productService';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹500',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure transactions',
  },
  {
    icon: Star,
    title: 'Premium Quality',
    description: 'Curated products',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Dedicated customer service',
  },
];

export const Home = () => {
  const { data: featuredProducts } = useGetProductsQuery({
    isFeatured: true,
    limit: 8,
  });

  const { data: bestSellers } = useGetProductsQuery({
    isBestSeller: true,
    limit: 8,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-10" />

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LUXE
            </h1>
            <p className="text-2xl md:text-4xl font-light mb-4">
              Premium Fashion for the Modern World
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover curated collections of high-quality products that define elegance and style
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop">
                <Button size="lg" className="group">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
              <Link to="/shop?category=new-arrivals">
                <Button variant="outline" size="lg">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked just for you</p>
            </div>
            <Link to="/shop?isFeatured=true">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={featuredProducts?.data?.products || []} />
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Best Sellers</h2>
              <p className="text-muted-foreground">Most popular products</p>
            </div>
            <Link to="/shop?isBestSeller=true">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={bestSellers?.data?.products || []} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
            <p className="mb-6">Subscribe to get special offers, free giveaways, and exclusive deals</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-white/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};