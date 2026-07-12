'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const defaultCategories = [
  {
    name: 'Drawer Channels',
    slug: 'drawer-channels',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    description: 'Heavy duty, soft-close double spring runners.',
  },
  {
    name: 'Concealed Hinges',
    slug: 'concealed-hinges',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600',
    description: '3D adjustable hydraulic cabinet auto hinges.',
  },
  {
    name: 'Kitchen Profile Handles',
    slug: 'kitchen-profile-handles',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600',
    description: 'Aluminum G-profiles and edge-pull trim handles.',
  },
  {
    name: 'Corner Solutions & Organizers',
    slug: 'corner-solutions-organizers',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=600',
    description: 'Magic corner baskets and rotary carousels.',
  }
];

const CategoryShowcase: React.FC = () => {
  return (
    <section className="py-24 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            PRODUCT RANGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold luxury-heading text-primary mt-2">
            Explore Premium B2B Collections
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            Engineered for high durability and modern aesthetics, our hardware parts serve modular kitchen manufacturers, woodworkers, and architects.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {defaultCategories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative h-96 overflow-hidden bg-primary cursor-pointer border border-slate-200"
            >
              {/* Category Cover Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 opacity-75"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

              {/* Text info */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-1">
                  Collection {index + 1}
                </span>
                <h3 className="text-lg font-bold luxury-heading tracking-wide">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 font-light mt-1.5 line-clamp-2 max-h-0 opacity-0 transition-all duration-500 ease-in-out group-hover:max-h-16 group-hover:opacity-100">
                  {cat.description}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link 
                    href={`/products?category=${cat.slug}`} 
                    className="text-xs font-semibold uppercase tracking-wider text-accent hover:underline flex items-center space-x-1"
                  >
                    <span>Browse Catalog</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryShowcase;
