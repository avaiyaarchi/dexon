'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { mockCategories } from '@/services/mockData';

export default function CategoriesPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Banner */}
      <section className="bg-primary text-white py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            PRODUCT RANGE
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold luxury-heading mt-2">
            Categories & Collections
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-xl">
            Explore our curated groups of architectural fittings, designed for strength and crafted for custom residential and commercial modular designs.
          </p>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockCategories.map((cat, index) => (
            <div 
              key={cat.slug}
              className="bg-white border border-slate-200 hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row overflow-hidden group"
            >
              {/* Category Cover Image */}
              <div className="w-full sm:w-1/2 relative h-64 sm:h-auto min-h-[250px] bg-slate-100 overflow-hidden">
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Category Info */}
              <div className="w-full sm:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                    COLLECTION 0{index + 1}
                  </span>
                  <h2 className="text-xl font-bold text-primary luxury-heading mt-2 mb-3">
                    {cat.name}
                  </h2>
                  <p className="text-slate-600 text-xs leading-relaxed font-light mb-6">
                    {cat.description || 'Premium architectural hardware fittings designed for seamless operational mechanics and long-lasting cabinet life.'}
                  </p>
                </div>

                <div>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-accent group-hover:text-primary transition-colors border-b border-accent pb-0.5"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Banner / Value Proposition Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-white p-12 md:p-16 border border-white/5 relative overflow-hidden text-center md:text-left">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
          <div className="relative z-10 md:flex items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold luxury-heading text-white">
                Looking for Custom Project Hardware Dimensions?
              </h3>
              <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                DEXON International manufactures and distributes bespoke slide travels, load capacities, and custom anodized aluminum handles. Speak directly to our design technicians.
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-8 md:mt-0 inline-block px-8 py-3.5 bg-accent text-primary text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition-colors shadow-md shrink-0 text-center"
            >
              Consult an Engineer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
