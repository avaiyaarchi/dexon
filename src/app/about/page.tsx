'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Award, Zap, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  const certifications = [
    {
      title: '50,000 cycle tested',
      description: 'Our slide channels and cabinet hinges undergo rigorous structural automation cycle tests, guaranteeing failure-free service for over a decade.'
    },
    {
      title: 'SS304 Rust Resistance',
      description: 'Manufactured with high-grade chromium-nickel alloys to ensure complete protection against moisture, corrosive cleaning agents, and rust.'
    },
    {
      title: '45kg Load Rating',
      description: 'Engineered for full drawer loading capacity with heavy-duty cold rolled steel and dual steel ball bearing tracks.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Banner */}
      <section className="bg-primary text-white py-20 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-[10px] font-bold tracking-[0.35em] text-accent uppercase">
            WHO WE ARE
          </span>
          <h1 className="text-4xl md:text-5xl font-bold luxury-heading mt-3 text-white">
            Designed for Luxury, Engineered for Strength
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-4 max-w-2xl mx-auto leading-relaxed">
            DEXON International is a global leader in high-performance furniture fittings, architectural hinges, and kitchen organizers. We craft heavy-duty hardware parts that support state-of-the-art modular designs.
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Column: Image collage */}
          <div className="w-full lg:w-1/2 relative min-h-[450px]">
            <div className="absolute top-0 left-0 w-4/5 h-[350px] bg-slate-200 border border-slate-200 overflow-hidden shadow-md">
              <Image 
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800" 
                alt="Modern kitchen showroom drawer"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3/5 h-[250px] bg-slate-100 border-4 border-white overflow-hidden shadow-xl">
              <Image 
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800" 
                alt="Concealed hinge installation"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="w-full lg:w-1/2">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              OUR MISSION
            </span>
            <h2 className="text-3xl font-bold text-primary luxury-heading mt-2 mb-6">
              Transforming Modular Spaces With Mechanical Precision
            </h2>
            <div className="text-slate-600 text-sm leading-relaxed space-y-6">
              <p>
                DEXON International was founded with a singular conviction: hardware parts are the true backbone of interior luxury. While facades look elegant, the seamless glide of a drawer and silent close of a cabinet define user experience.
              </p>
              <p>
                We service architects, interior designers, commercial furniture makers, and modular kitchen showrooms globally. Our state-of-the-art manufacturing processes utilize cold-rolled steel, high-quality zinc plating, and solid brass dampening shock-absorbers.
              </p>
              <p>
                Every telescopic slide, hydraulic hinge, and corner optimizer is cataloged and tracked to match international standard protocols. Partner with us to experience hardware that never compromise.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Engineering specifications section */}
      <section className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              QUALITY CONTROL LABS
            </span>
            <h2 className="text-3xl font-bold luxury-heading mt-2">
              Tested for Extreme Endurances
            </h2>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
              We operate advanced quality-assurance testing chambers to validate load stress-points and dampener longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-primary-light p-8 border border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-accent luxury-heading mb-4 uppercase tracking-wide">
                    {cert.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-light">
                    {cert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Partnership Quote Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-white border border-slate-200 p-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-primary luxury-heading mb-4">
            Dealer & Distribution Opportunities
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto mb-8">
            We provide our distribution partners with full marketing catalogs, point-of-sale display boards, sample kits, and optimized container cargo shipping.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3.5 bg-primary hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow"
          >
            Become a Partner
          </Link>
        </div>
      </section>
    </div>
  );
}
