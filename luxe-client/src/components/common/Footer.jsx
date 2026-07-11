import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Heart,
} from 'lucide-react';

import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LUXE
            </h3>
            <p className="text-muted-foreground mt-2">
              Premium fashion for the modern world. Curated with care, delivered with love.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-muted/30 hover:bg-muted transition"
                aria-label="Facebook"
              >
                <FaFacebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-muted/30 hover:bg-muted transition"
                aria-label="Twitter"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-muted/30 hover:bg-muted transition"
                aria-label="Instagram"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-muted/30 hover:bg-muted transition"
                aria-label="YouTube"
              >
                <FaYoutube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-foreground transition">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/shop?isFeatured=true" className="text-muted-foreground hover:text-foreground transition">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link to="/shop?isBestSeller=true" className="text-muted-foreground hover:text-foreground transition">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=new-arrivals" className="text-muted-foreground hover:text-foreground transition">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-foreground transition">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-foreground transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  123 Fashion Street, Mumbai - 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">support@luxe.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} LUXE. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};