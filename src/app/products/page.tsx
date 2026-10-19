'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  X, 
  Plus, 
  Minus, 
  Check, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import { Product } from '@/types';
import { mockProducts, mockCategories, mockBrands } from '@/services/mockData';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, cartItems } = useCart();

  // Search & Filter State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Products Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);


  // Sync search input with query params
  useEffect(() => {
    const focusSearch = searchParams.get('focusSearch');
    if (focusSearch === 'true') {
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.focus();
    }
  }, [searchParams]);

  // Fetch products from API (or fallback to local mock data)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
        if (selectedBrand !== 'all') {
          // Find brand ID from slug/name in mock or just append
          queryParams.append('brand', selectedBrand);
        }
        if (availability !== 'all') queryParams.append('availability', availability);
        if (sort) queryParams.append('sort', sort);
        queryParams.append('page', page.toString());
        queryParams.append('limit', '8');

        const res = await api.get(`/products?${queryParams.toString()}`);
        if (res.data && res.data.success) {
          setProducts(res.data.products);
          setTotalPages(res.data.totalPages || 1);
          setTotalCount(res.data.totalProducts || 0);
        } else {
          throw new Error('Failed to fetch from backend');
        }
      } catch (err) {
        console.warn('API connection failed. Filtering client-side on mock data.');
        filterMockData();
      } finally {
        setLoading(false);
      }
    };

    const filterMockData = () => {
      let filtered = [...mockProducts];

      // Search Filter
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) || 
          (p.sku && p.sku.toLowerCase().includes(q)) || 
          p.description?.toLowerCase().includes(q)
        );
      }

      // Category Filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => {
          const cat = typeof p.category === 'string' ? p.category : p.category.slug;
          return cat === selectedCategory;
        });
      }

      // Brand Filter
      if (selectedBrand !== 'all') {
        filtered = filtered.filter(p => {
          const b = typeof p.brand === 'string' ? p.brand : p.brand._id;
          return b === selectedBrand;
        });
      }

      // Availability Filter
      if (availability !== 'all') {
        filtered = filtered.filter(p => p.availability === availability);
      }

      // Sorting
      if (sort === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'name-desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sort === 'stock-asc') {
        filtered.sort((a, b) => a.stockQuantity - b.stockQuantity);
      } else if (sort === 'stock-desc') {
        filtered.sort((a, b) => b.stockQuantity - a.stockQuantity);
      } else if (sort === 'oldest') {
        // Mock timestamps, assume default order is newest
      }

      // Pagination
      const limit = 8;
      const total = filtered.length;
      const totalP = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      setProducts(paginated);
      setTotalPages(totalP || 1);
      setTotalCount(total);
    };

    fetchProducts();
  }, [search, selectedCategory, selectedBrand, availability, sort, page]);

  // Redirect immediately if a product slug is passed in URL query
  useEffect(() => {
    const selectedSlug = searchParams.get('selected');
    if (selectedSlug && products.length > 0) {
      const match = products.find(p => p.slug === selectedSlug);
      if (match) {
        router.push(`/products/${match._id}`);
      }
    }
  }, [searchParams, products, router]);

  const getStockBadge = (status: string, qty: number) => {
    if (status === 'in-stock') {
      return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-sm">In Stock ({qty})</span>;
    } else if (status === 'low-stock') {
      return <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-sm">Low Stock ({qty})</span>;
    } else {
      return <span className="bg-rose-100 text-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-sm">Out of Stock</span>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Banner */}
      <section className="bg-primary text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            WHOLESALE ARCHITECTURAL CATALOG
          </span>
          <h1 className="text-3xl md:text-4xl font-bold luxury-heading mt-2">
            B2B Hardware Collections
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xl">
            Fully certified slides, hinges, and organizers for modular kitchens and architectural fit-outs. Select products to generate a WhatsApp quote.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Filter Sidebar */}
          <aside className="w-full lg:w-1/4 bg-white border border-slate-200 p-6 self-start">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="font-semibold text-primary flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4 text-secondary" />
                <span>Filter Products</span>
              </span>
              <button 
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setAvailability('all');
                  setSort('newest');
                  setPage(1);
                  router.push('/products');
                }}
                className="text-xs text-slate-400 hover:text-secondary underline"
              >
                Reset All
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <label htmlFor="search-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Name, category, tag..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-secondary text-slate-900"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                <button
                  onClick={() => { setSelectedCategory('all'); setPage(1); }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-primary text-white font-semibold' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Categories
                </button>
                {mockCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                      selectedCategory === cat.slug 
                        ? 'bg-primary text-white font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>



            {/* Stock Availability Filter */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => { setAvailability(e.target.value); setPage(1); }}
                className="w-full py-2 px-3 border border-slate-300 rounded-sm text-xs bg-white text-slate-900 focus:outline-none focus:border-secondary"
              >
                <option value="all">All Inventory States</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-sm text-xs bg-white text-slate-900 focus:outline-none focus:border-secondary"
              >
                <option value="newest">New Arrivals</option>
                <option value="name-asc">Alphabetical A-Z</option>
                <option value="name-desc">Alphabetical Z-A</option>
                <option value="stock-desc">Stock Quantity (High to Low)</option>
                <option value="stock-asc">Stock Quantity (Low to High)</option>
              </select>
            </div>

          </aside>

          {/* Right Column: Grid and Products */}
          <main className="w-full lg:w-3/4">
            
            {/* Summary info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-8">
              <span className="text-slate-500 text-xs font-medium">
                Showing <strong className="text-primary">{totalCount}</strong> B2B hardware parts
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="p-1.5 bg-white border border-slate-200 text-slate-700">
                  <Grid className="h-4 w-4" />
                </span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="bg-white border border-slate-200 p-4 h-80 flex flex-col justify-between animate-pulse">
                    <div className="h-40 bg-slate-100 w-full" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white border border-slate-200 rounded">
                <p className="text-slate-400 text-sm">No products found matching the criteria.</p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setAvailability('all');
                  }}
                  className="mt-4 px-5 py-2 bg-primary text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((p) => {
                    const isInCart = cartItems.some(item => item.product._id === p._id);
                    return (
                      <div 
                        key={p._id} 
                        className="bg-white border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between group"
                      >
                        {/* Cover Image */}
                        <Link 
                          href={`/products/${p._id}`}
                          className="relative h-48 bg-slate-100 overflow-hidden block cursor-pointer"
                        >
                          <Image
                            src={p.images && p.images[0] ? p.images[0].url : '/placeholder.jpg'}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        {/* Description / Content */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-end mb-2">
                              {getStockBadge(p.availability, p.stockQuantity)}
                            </div>
                            <h3 className="text-sm font-bold text-primary group-hover:text-secondary cursor-pointer transition-colors line-clamp-2">
                              <Link href={`/products/${p._id}`}>
                                {p.name}
                              </Link>
                            </h3>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <Link
                              href={`/products/${p._id}`}
                              className="text-slate-600 hover:text-primary text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1"
                            >
                              <Info className="h-3.5 w-3.5" />
                              <span>Details</span>
                            </Link>
                            
                            <button
                              onClick={() => addToCart(p, 10)}
                              className={`px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all border ${
                                isInCart 
                                  ? 'border-emerald-600 bg-emerald-600 text-white' 
                                  : 'border-primary text-primary hover:bg-primary hover:text-white'
                              }`}
                            >
                              {isInCart ? 'In Quote List' : 'Add to Quote'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 border border-slate-300 rounded bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-slate-600 font-semibold">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 border border-slate-300 rounded bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}

          </main>

        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
