import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-slate-300 border-t border-slate-800">

      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Company Profile */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex flex-col">
              <span className="text-2xl font-bold tracking-widest text-white luxury-heading uppercase">
                DEXON
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-accent -mt-1">
                INTERNATIONAL
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              Premium manufacturer and distributor of high-end kitchen accessories, soft-close slides, concealed hinges, and luxury architectural hardware.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919920420819?text=Hello%20DEXON%20International"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-sm font-bold tracking-widest uppercase mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-secondary">
              Product Links
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/products" className="hover:text-white hover:underline transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=drawer-channels" className="hover:text-white hover:underline transition-colors">
                  Drawer Channels
                </Link>
              </li>
              <li>
                <Link href="/products?category=concealed-hinges" className="hover:text-white hover:underline transition-colors">
                  Concealed Hinges
                </Link>
              </li>
              <li>
                <Link href="/products?category=kitchen-profile-handles" className="hover:text-white hover:underline transition-colors">
                  Kitchen Profile Handles
                </Link>
              </li>
              <li>
                <Link href="/products?category=corner-solutions-organizers" className="hover:text-white hover:underline transition-colors">
                  Kitchen Organizers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate Info */}
          <div>
            <h3 className="text-white text-sm font-bold tracking-widest uppercase mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-secondary">
              Information
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white hover:underline transition-colors">
                  Company Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors">
                  Locate Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors">
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-400 hover:text-white hover:underline transition-colors flex items-center space-x-1.5">
                  <span>Admin Dashboard</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact details */}
          <div className="flex flex-col space-y-4 text-sm">
            <h3 className="text-white text-sm font-bold tracking-widest uppercase mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-secondary">
              Contact info
            </h3>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <span className="text-slate-400 leading-relaxed">
                Shop No.36, Orchind Harmony,<br />
                Gaurav Path Road, Palanpur,<br />
                Surat, Gujarat 395009
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-accent" />
              <a href="tel:+919920420819" className="hover:text-white transition-colors">
                +91 99204 20819
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-accent" />
              <a href="mailto:dexoninternational11@gmail.com" className="hover:text-white transition-colors">
                dexoninternational11@gmail.com
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="bg-primary-light text-slate-500 text-xs py-6 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {currentYear} DEXON International. All Rights Reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Designed for Luxury, Engineered for Strength.</span>
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
