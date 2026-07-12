'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItemsCount } = useCart();

  const isHome = pathname === '/';

  // Effect to handle scroll change for background transparent -> white transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    if (isHome) {
      window.addEventListener('scroll', handleScroll);
      // check initial scroll
      handleScroll();
    } else {
      setIsScrolled(true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHome, pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Determine text and background colors based on page and scroll position
  const navBg = isHome
    ? isScrolled
      ? 'bg-white/95 backdrop-blur-md shadow-md py-4 text-primary border-b border-slate-100'
      : 'bg-transparent py-6 text-white'
    : 'bg-white/95 backdrop-blur-md shadow-md py-4 text-primary border-b border-slate-100';

  const linkClass = (path: string) => {
    const isActive = pathname === path;
    if (isHome && !isScrolled) {
      return `transition-colors duration-300 font-medium tracking-wide text-sm hover:text-accent ${isActive ? 'text-accent border-b-2 border-accent pb-1' : 'text-slate-100'
        }`;
    } else {
      return `transition-colors duration-300 font-medium tracking-wide text-sm hover:text-secondary ${isActive ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-slate-700'
        }`;
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <span className={`text-xl font-bold tracking-widest luxury-heading uppercase ${isHome && !isScrolled ? 'text-white' : 'text-primary'}`}>
              DEXON
            </span>
            <span className={`text-[9px] uppercase tracking-[0.3em] font-semibold -mt-1 ${isHome && !isScrolled ? 'text-slate-300' : 'text-secondary'}`}>
              INTERNATIONAL
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className={linkClass(link.path)}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons and CTA Section */}
          <div className="hidden md:flex items-center space-x-6">

            {/* Search link */}
            <Link
              href="/products?focusSearch=true"
              className={`hover:scale-105 transition-transform duration-300 ${isHome && !isScrolled ? 'text-white hover:text-accent' : 'text-slate-600 hover:text-secondary'}`}
              title="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Cart Icon trigger */}
            <Link
              href="/cart"
              className={`relative hover:scale-105 transition-transform duration-300 ${isHome && !isScrolled ? 'text-white hover:text-accent' : 'text-slate-600 hover:text-secondary'}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Inquiry CTA */}
            <Link
              href="/cart"
              className={`px-5 py-2.5 rounded-sm text-xs font-semibold tracking-wider uppercase transition-all duration-300 border ${isHome && !isScrolled
                ? 'border-white text-white hover:bg-white hover:text-primary'
                : 'border-primary bg-primary text-white hover:bg-transparent hover:text-primary'
                }`}
            >
              Request Quote
            </Link>
          </div>

          {/* Mobile elements (Cart, Search, Menu) */}
          <div className="flex md:hidden items-center space-x-4">
            {/* Search */}
            <Link
              href="/products?focusSearch=true"
              className={isHome && !isScrolled ? 'text-white' : 'text-slate-600'}
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={`relative ${isHome && !isScrolled ? 'text-white' : 'text-slate-600'}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Hamburger Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1.5 focus:outline-none ${isHome && !isScrolled ? 'text-white' : 'text-primary'}`}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-primary/95 flex flex-col justify-center items-center text-center animate-fade-in">
          {/* Close button inside panel */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Links list */}
          <nav className="flex flex-col space-y-6 text-xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-light tracking-widest uppercase hover:text-accent transition-colors ${pathname === link.path ? 'text-accent font-medium' : 'text-white/95'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-12 flex flex-col items-center space-y-4">
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="px-8 py-3 bg-secondary text-white font-semibold tracking-wider text-sm rounded-sm hover:bg-secondary/95 transition-all shadow-md uppercase"
            >
              Request Quote ({totalItemsCount})
            </Link>

            <a
              href="tel:+919920420819"
              className="flex items-center space-x-2 text-white/70 hover:text-white text-xs mt-4 tracking-wider"
            >
              <Phone className="h-4 w-4" />
              <span>Call Us: +91 99204 20819</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
