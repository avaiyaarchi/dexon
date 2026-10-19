'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this sends data to backend. We simulate it.
    console.log('Contact form submitted:', form);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', company: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Banner */}
      <section className="bg-primary text-white py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold luxury-heading mt-2">
            Contact DEXON International
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-xl">
            Have questions about load specs, distribution discounts, or stock status? Send us an inquiry and our technical staff will reach out in 24 hours.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Column 1 & 2: Contact Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-primary luxury-heading mb-6 border-b border-slate-100 pb-3">
              Partnership & Inquiry Form
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-8 text-center space-y-3 rounded-sm animate-fade-in">
                <Check className="h-8 w-8 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold">Message Sent Successfully</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Thank you for contacting DEXON. A B2B account executive will contact you shortly with catalog quotes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary text-slate-900"
                      placeholder="e.g. Vikram Singh"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary text-slate-900"
                      placeholder="e.g. name@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary text-slate-900"
                      placeholder="e.g. Apex Woodworks"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary text-slate-900"
                      placeholder="e.g. +91 99887 76655"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Inquiry Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary text-slate-900"
                    placeholder="Provide details about slide length specifications or quantities desired..."
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 bg-primary hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow flex items-center space-x-2"
                >
                  <Send className="h-4 w-4 text-accent" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Column 3: Corporate Details */}
          <div className="space-y-8">
            
            {/* Address Card */}
            <div className="bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-md font-bold text-primary uppercase tracking-wider mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-0.5 after:bg-secondary">
                Locate Us
              </h3>
              
              <div className="space-y-6 text-sm text-slate-600">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    104, Industrial Hub, Phase-2, <br />
                    G.I.D.C., Jamnagar, <br />
                    Gujarat, India - 361004
                  </span>
                </div>

                <div className="flex items-center space-x-4 border-t border-slate-100 pt-4">
                  <Phone className="h-4 w-4 text-accent" />
                  <a href="tel:+917016722531" className="hover:text-primary hover:underline">
                    +91 70167 22531
                  </a>
                </div>

                <div className="flex items-center space-x-4 border-t border-slate-100 pt-4">
                  <Mail className="h-4 w-4 text-accent" />
                  <a href="mailto:info@dexonhardware.com" className="hover:text-primary hover:underline">
                    info@dexonhardware.com
                  </a>
                </div>
              </div>
            </div>

            {/* Support hours card */}
            <div className="bg-primary text-white p-8 border border-white/5">
              <h3 className="text-md font-bold text-accent uppercase tracking-wider mb-4">
                B2B Operating Hours
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Our logistics office and client servicing operations run during the following timings:
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="text-accent">09:00 - 18:00 IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-accent">09:00 - 14:00 IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-slate-400">Closed</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
