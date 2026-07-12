'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600',
    title: 'Precision Engineered Soft-Close Slides',
    subtitle: 'ENGINEERED FOR STRENGTH',
    description: 'Experience seamless glide, silent dampening, and heavy load endurance with DEXON Telescopic Drawers.',
    primaryCta: 'Explore Products',
    primaryUrl: '/products',
    secondaryCta: 'Request Custom Quote',
    secondaryUrl: '/cart',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600',
    title: 'Elegant 3D Concealed Hydraulic Hinges',
    subtitle: 'DESIGNED FOR LUXURY',
    description: 'Auto-damping modular hardware solutions. Perfect alignment with three-dimensional spatial adjustment.',
    primaryCta: 'View Cabinet Hinges',
    primaryUrl: '/products?category=concealed-hinges',
    secondaryCta: 'Get Catalogs',
    secondaryUrl: '/contact',
  },
  {
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=1600',
    title: 'Sleek Anodized Aluminum Profile Handles',
    subtitle: 'MINIMAL MODERN AESTHETIC',
    description: 'Clean line profiles and flush-groove drawer handles that transform standard kitchens into premium spaces.',
    primaryCta: 'Explore G & J Profiles',
    primaryUrl: '/products?category=kitchen-profile-handles',
    secondaryCta: 'Wholesale Inquiry',
    secondaryUrl: '/cart',
  }
];

const HeroSlideshow: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); // 6s rotation

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      
      {/* Background Images with Fade Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Text Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-white">
            
            {/* Subtitle */}
            <motion.span
              key={`sub-${current}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block text-xs sm:text-sm font-semibold tracking-[0.35em] text-accent uppercase mb-3"
            >
              {slides[current].subtitle}
            </motion.span>

            {/* Title */}
            <motion.h1
              key={`title-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold luxury-heading tracking-tight leading-tight mb-4"
            >
              {slides[current].title}
            </motion.h1>

            {/* Description */}
            <motion.p
              key={`desc-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-slate-300 text-sm sm:text-lg font-light leading-relaxed mb-8 max-w-lg"
            >
              {slides[current].description}
            </motion.p>

            {/* Actions */}
            <motion.div
              key={`actions-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href={slides[current].primaryUrl}
                className="gold-bg text-primary text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-3.5 hover:scale-105 transition-transform duration-300 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>{slides[current].primaryCta}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={slides[current].secondaryUrl}
                className="border border-white hover:bg-white hover:text-primary text-white text-xs sm:text-sm font-bold tracking-widest uppercase px-8 py-3.5 transition-colors duration-300 flex items-center justify-center"
              >
                {slides[current].secondaryCta}
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Nav Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 rounded-full border border-white/20 hover:border-white text-white items-center justify-center hover:bg-white/10 transition-colors z-20 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex h-12 w-12 rounded-full border border-white/20 hover:border-white text-white items-center justify-center hover:bg-white/10 transition-colors z-20 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current ? 'w-8 bg-accent' : 'w-2 bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
};

export default HeroSlideshow;
