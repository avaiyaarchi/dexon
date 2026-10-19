'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  PhoneCall,
  FileText,
  Check,
  Building2,
  Plus,
  Minus
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItemsCount } = useCart();

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    gstNumber: '',
    city: '',
    state: '',
    pincode: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      // 1. Prepare data for backend API
      const inquiryData = {
        fullName: form.fullName,
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        whatsappNumber: form.whatsappNumber || form.phone, // fallback to regular phone
        gstNumber: form.gstNumber,
        city: form.city,
        state: form.state,
        country: 'India', // default
        pincode: form.pincode,
        message: form.message,
        selectedProducts: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      };

      // Send to Express Backend (fail-fast, catch errors gracefully)
      let apiSuccess = false;
      try {
        const response = await api.post('/inquiries', inquiryData);
        if (response.data && response.data.success) {
          apiSuccess = true;
        }
      } catch (err) {
        console.warn('Backend API connection offline. Proceeding to WhatsApp redirect directly.', err);
      }

      // 2. Generate WhatsApp prefilled message
      const targetPhone = '919920420819'; // DEXON target B2B WhatsApp support line
      let messageContent = `*DEXON International - New B2B Quote Request*\n\n`;
      messageContent += `*Client Details:*\n`;
      messageContent += `• *Name:* ${form.fullName}\n`;
      messageContent += `• *Company:* ${form.companyName}\n`;
      messageContent += `• *Email:* ${form.email}\n`;
      messageContent += `• *Phone:* ${form.phone}\n`;
      if (form.gstNumber) messageContent += `• *GSTIN:* ${form.gstNumber}\n`;
      messageContent += `• *Location:* ${form.city}, ${form.state} - ${form.pincode}\n\n`;

      messageContent += `*Requested Parts (MOQs Apply):*\n`;
      cartItems.forEach((item, index) => {
        messageContent += `${index + 1}. *${item.product.name}* × *${item.quantity}* pcs\n`;
      });

      if (form.message) {
        messageContent += `\n*Client Message:*\n"${form.message}"\n`;
      }

      const encodedMsg = encodeURIComponent(messageContent);
      const waLink = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;

      setWhatsappLink(waLink);
      setSuccess(true);

      // 3. Open WhatsApp link in new tab immediately
      window.open(waLink, '_blank');

      // 4. Clear client cart context
      clearCart();
    } catch (error) {
      console.error('Error checking out:', error);
      alert('An error occurred during inquiry checkout. Please check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center py-24">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 text-center shadow-lg mx-4">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary luxury-heading mb-3">
            Inquiry Submitted!
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
            Your quote request has been registered. We have opened WhatsApp to redirect you to our corporate help desk for instant negotiation.
          </p>
          <div className="space-y-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase transition-colors rounded-sm"
            >
              Relaunch Chat on WhatsApp
            </a>
            <Link
              href="/products"
              className="block w-full py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs tracking-wider uppercase transition-colors"
            >
              Continue Browsing Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Banner */}
      <section className="bg-primary text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            B2B QUOTE DESK
          </span>
          <h1 className="text-3xl font-bold luxury-heading mt-2">
            Quote Inquiry List
          </h1>
          <p className="text-slate-400 text-xs mt-2 max-w-xl">
            Review your requested items, adjust B2B quantities, and submit details to generate a custom volume quote.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {cartItems.length === 0 ? (
          <div className="bg-white border border-slate-200 p-16 text-center max-w-2xl mx-auto shadow-sm">
            <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-primary luxury-heading">Your inquiry list is empty</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
              Please browse our B2B catalog collections to select soft-close slides, hinges, or profile handles.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition-colors rounded-sm"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4 text-accent" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Column: Cart List */}
            <div className="w-full lg:w-3/5 bg-white border border-slate-200 p-6 self-start shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <span className="font-semibold text-primary">
                  Inquiry Items ({cartItems.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-start justify-between border-b border-slate-100 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="relative h-20 w-20 bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <Image
                          src={item.product.images && item.product.images[0] ? item.product.images[0].url : '/placeholder.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Name/SKU details */}
                      <div>
                        <h3 className="text-sm font-bold text-primary max-w-xs hover:text-secondary">
                          <Link href={`/products?selected=${item.product.slug}`}>
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-1">
                          {typeof item.product.brand === 'string' ? item.product.brand : item.product.brand?.name}
                        </p>
                      </div>
                    </div>

                    {/* Quantity editor and delete */}
                    <div className="flex flex-col items-end justify-between h-20">
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* B2B MOQ adjuster */}
                      <div className="flex items-center border border-slate-300 bg-white">
                        <button
                          onClick={() => updateQuantity(item.product._id, Math.max(10, item.quantity - 10))}
                          className="p-1 hover:bg-slate-100 border-r border-slate-300 text-slate-600"
                          title="Decrease by 10"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="w-12 text-center text-xs font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 10)}
                          className="p-1 hover:bg-slate-100 border-l border-slate-300 text-slate-600"
                          title="Increase by 10"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Inquiry Registration Form */}
            <div className="w-full lg:w-2/5 bg-white border border-slate-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-primary luxury-heading mb-6 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-secondary" />
                <span>Register B2B Account</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                    placeholder="Vikram Singh"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                    placeholder="e.g. Deluxe Modular Kitchens"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                      placeholder="vikram@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                      placeholder="e.g. +91 9988776655"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      WhatsApp Number (B2B)
                    </label>
                    <input
                      type="text"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                      placeholder="e.g. 919988776655"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.gstNumber}
                      onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                      placeholder="e.g. 07AAAAA1111A1Z9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                      placeholder="New Delhi"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                      placeholder="Delhi"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                      placeholder="110015"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Project Message / Design Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-secondary"
                    placeholder="Provide details about delivery timeline or specific custom sizing needs..."
                  />
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 mt-6 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between font-semibold text-primary">
                    <span>Total Unique Items:</span>
                    <span>{cartItems.length} categories</span>
                  </div>
                  <div className="flex justify-between font-semibold text-primary">
                    <span>Total Bulk Quantity:</span>
                    <span>{totalItemsCount} pieces</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>{loading ? 'Processing...' : 'Submit Inquiry & Chat WhatsApp'}</span>
                </button>

              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
