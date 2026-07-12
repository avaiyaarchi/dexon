'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Zap, HeartHandshake, ArrowRight } from 'lucide-react';
import HeroSlideshow from '@/components/home/HeroSlideshow';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import api from '@/services/api';
import { Product } from '@/types';

// Mock fallback products if API/Database is offline
const mockFeaturedProducts: Product[] = [
  {
    _id: '1',
    name: 'DEXON Soft-Close Telescopic Drawer Slide',
    slug: 'dexon-soft-close-telescopic-drawer-slide',
    sku: 'DX-SC-4520',
    category: 'Drawer Channels',
    brand: 'DEXON',
    description: 'Heavy duty cold rolled steel drawer slides featuring an integrated double-spring hydraulic damper for smooth, silent soft-closing. Ideal for kitchen cabinets and heavy storage drawers.',
    stockQuantity: 150,
    availability: 'in-stock',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    specifications: [
      { key: 'Load Capacity', value: '45 kg per pair' },
      { key: 'Cycle Test Count', value: '50,000 Cycles certified' }
    ],
    features: ['Integrated hydraulic damper', 'Side mount installation', 'Dual steel ball bearing cage design'],
    applications: ['Residential modular kitchens'],
    images: [{ url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600', publicId: '1' }],
    seoKeywords: []
  },
  {
    _id: '2',
    name: 'DEXON 3D Clip-On Hydraulic Hinge',
    slug: 'dexon-3d-clip-on-hydraulic-hinge',
    sku: 'DX-HYD-110',
    category: 'Concealed Hinges',
    brand: 'DEXON',
    description: 'Auto soft-closing concealed hinge featuring 3D screw adjustments for height, width, and depth alignment. Tool-free clip-on plate attachment ensures rapid installation.',
    stockQuantity: 400,
    availability: 'in-stock',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    specifications: [
      { key: 'Opening Angle', value: '110 degree' },
      { key: 'Material', value: 'Stainless Steel 304' }
    ],
    features: ['Corrosion resistant SS304', '3D adjustment', 'Clip-on mechanism'],
    applications: ['Modular kitchen wall units'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600', publicId: '2' }],
    seoKeywords: []
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?isFeatured=true&limit=4');
        if (res.data && res.data.success && res.data.products.length > 0) {
          setFeaturedProducts(res.data.products);
        } else {
          setFeaturedProducts(mockFeaturedProducts);
        }
      } catch (err) {
        console.warn('Failed to fetch featured products from backend. Using mock fallbacks.', err);
        setFeaturedProducts(mockFeaturedProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const b2bAdvantages = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-accent" />,
      title: 'Certified Durability',
      description: 'Tested up to 50,000 opening/closing cycles to ensure maximum longevity under continuous B2B usage.'
    },
    {
      icon: <Award className="h-8 w-8 text-accent" />,
      title: 'Premium Engineering',
      description: 'Built with cold-rolled steel and rust-free SS304 materials. Crafted to handle loads of up to 45kg.'
    },
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: 'Smart Soft-Close Tech',
      description: 'Double-spring hydraulic auto-dampening mechanisms prevent slamming and support luxury home designs.'
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-accent" />,
      title: 'Dedicated B2B Support',
      description: 'Direct wholesale rates, customizable orders, prompt shipment options, and easy WhatsApp inquiry checks.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Slideshow */}
      <HeroSlideshow />

      {/* B2B Product Categories */}
      <CategoryShowcase />

      {/* Featured Products */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
                HOT DEMAND
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold luxury-heading text-primary mt-2">
                Featured Hardware Products
              </h2>
            </div>
            <Link 
              href="/products" 
              className="mt-4 md:mt-0 flex items-center space-x-2 text-sm font-semibold text-secondary hover:text-primary transition-colors hover:underline"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((n) => (
                <div key={n} className="h-96 bg-slate-100 animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {featuredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="flex flex-col md:flex-row border border-slate-200 hover:shadow-lg transition-all duration-300 group bg-slate-50"
                >
                  <Link 
                    href={`/products/${product._id}`}
                    className="w-full md:w-2/5 relative h-64 md:h-auto min-h-[240px] bg-slate-200 overflow-hidden block cursor-pointer"
                  >
                    <Image
                      src={product.images && product.images[0] ? product.images[0].url : '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-end gap-2 mb-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          SKU: {product.sku}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-3 hover:text-accent transition-colors">
                        <Link href={`/products/${product._id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-slate-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                        {product.description}
                      </p>
                      
                      {/* Specifications Preview */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.specifications.slice(0, 2).map((spec, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-1">
                            <strong>{spec.key}:</strong> {spec.value}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Link 
                        href={`/products/${product._id}`}
                        className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-accent group-hover:text-primary transition-colors border-b border-accent pb-0.5"
                      >
                        <span>View Product Details</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* B2B Advantage / Engineering specs */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              WHY ARCHITECTS & MANUFACTURERS TRUST US
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold luxury-heading mt-3">
              Designed for Luxury, Engineered for Strength
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              We understand modular furniture demands components that endure. Our slides, hinges, and organizers combine visual sleekness with laboratory-tested mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {b2bAdvantages.map((adv, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-primary-light p-8 border border-white/5 hover:border-accent/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-6">{adv.icon}</div>
                  <h3 className="text-lg font-bold tracking-wide luxury-heading text-white mb-3">
                    {adv.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-light">
                    {adv.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Direct Quote Call to Action */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary luxury-heading mb-4">
            Become a DEXON Distribution Partner
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto mb-8">
            Modular kitchen manufacturers, commercial architects, and retail hardware dealers receive custom volume pricing tiers. Inquire directly to get our premium print catalogs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-8 py-3 bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-md"
            >
              Get in Touch
            </Link>
            <Link 
              href="/products" 
              className="w-full sm:w-auto px-8 py-3 border border-primary text-primary text-xs font-semibold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
