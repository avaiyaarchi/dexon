'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  FileSpreadsheet,
  Warehouse,
  LogOut,
  Plus,
  Copy,
  Edit3,
  Trash2,
  Eye,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  TrendingUp,
  FileClock,
  X,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Product, Inquiry, Category, Brand, InventoryLog } from '@/types';
import { 
  mockProducts, 
  mockInquiries, 
  mockCategories, 
  mockBrands, 
  mockInventoryLogs 
} from '@/services/mockData';

type TabType = 'dashboard' | 'categories' | 'products' | 'inquiries' | 'inventory';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();

  // Tab control
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Local Database State (for offline mock operations)
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [logs, setLogs] = useState<InventoryLog[]>(mockInventoryLogs);

  // Categories CRUD states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    displayOrder: 1,
    isVisible: true,
    image: ''
  });

  // API loading / error status
  const [dataLoading, setDataLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Forms and overlays state
  const [productSearch, setProductSearch] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    categorySlug: 'drawer-channels',
    brandName: 'DEXON',
    description: '',
    stockQuantity: 10,
    dimensions: '',
    material: '',
    color: '',
    featuresString: '',
    specificationsString: '', // Format: Key:Value, Key2:Value2
    images: [] as { url: string; publicId: string }[]
  });

  // Selected details modal state
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState<'pending' | 'contacted' | 'completed' | 'cancelled'>('pending');

  // Verify auth session
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch active datasets from API, fallback to mock if offline
  const loadData = async () => {
    setDataLoading(true);
    try {
      // 1. Get products
      const pRes = await api.get('/products?limit=100');
      if (pRes.data && pRes.data.success) {
        setProducts(pRes.data.products);
      }

      // 2. Get inquiries
      const iRes = await api.get('/inquiries');
      if (iRes.data && iRes.data.success) {
        setInquiries(iRes.data.inquiries);
      }

      // 3. Get inventory logs
      const lRes = await api.get('/inventory/logs');
      if (lRes.data && lRes.data.success) {
        setLogs(lRes.data.logs);
      }

      // 4. Get categories
      try {
        const cRes = await api.get('/categories');
        if (cRes.data && cRes.data.success) {
          setCategories(cRes.data.categories);
        }
      } catch (catErr) {
        console.warn('Failed to load categories from API');
      }

      // 5. Get brands
      try {
        const bRes = await api.get('/brands');
        if (bRes.data && bRes.data.success) {
          setBrands(bRes.data.brands);
        }
      } catch (brandErr) {
        console.warn('Failed to load brands from API');
      }

      setOfflineMode(false);
    } catch (err) {
      console.warn('API error during dashboard loading. Operating in interactive offline mode.');
      setOfflineMode(true);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Category CRUD handlers
  const handleDeleteCategory = async (id: string) => {
    // Check if category has associated products first
    const productsCount = products.filter(p => {
      const pCatId = typeof p.category === 'string' ? p.category : p.category._id;
      return pCatId === id;
    }).length;

    if (productsCount > 0) {
      alert(`Cannot delete category. It is associated with ${productsCount} products. Please reassign or delete the products first.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      let apiSuccess = false;
      if (!offlineMode) {
        const res = await api.delete(`/categories/${id}`);
        if (res.data && res.data.success) apiSuccess = true;
      }

      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditCategoryClick = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      isVisible: category.isVisible,
      image: category.image || ''
    });
    setShowCategoryForm(true);
  };

  const handleCreateCategoryClick = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      displayOrder: categories.length + 1,
      isVisible: true,
      image: ''
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = editingCategory 
      ? editingCategory.slug 
      : categoryForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const categoryPayload = {
      name: categoryForm.name,
      description: categoryForm.description,
      displayOrder: categoryForm.displayOrder,
      isVisible: categoryForm.isVisible,
      image: categoryForm.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600'
    };

    try {
      let apiSuccess = false;
      if (!offlineMode) {
        if (editingCategory) {
          const res = await api.put(`/categories/${editingCategory._id}`, categoryPayload);
          if (res.data && res.data.success) {
            setCategories(prev => prev.map(c => c._id === editingCategory._id ? res.data.category : c));
            apiSuccess = true;
          }
        } else {
          const res = await api.post('/categories', categoryPayload);
          if (res.data && res.data.success) {
            setCategories(prev => [...prev, res.data.category]);
            apiSuccess = true;
          }
        }
      }

      if (!apiSuccess) {
        const mockC: Category = {
          _id: editingCategory ? editingCategory._id : 'cat_' + Date.now(),
          slug,
          ...categoryPayload
        };

        if (editingCategory) {
          setCategories(prev => prev.map(c => c._id === editingCategory._id ? mockC : c));
        } else {
          setCategories(prev => [...prev, mockC]);
        }
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (err: any) {
      alert('Failed to save category: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      let apiSuccess = false;
      if (!offlineMode) {
        const res = await api.delete(`/products/${id}`);
        if (res.data && res.data.success) apiSuccess = true;
      }

      if (apiSuccess || offlineMode) {
        setProducts(prev => prev.filter(p => p._id !== id));
        // Add log entry
        addLocalLog(id, 'decrease', 0, 'Product deleted from catalog');
      }
    } catch (err) {
      alert('Delete failed. Operating in offline mode: ' + (err as any).message);
    }
  };

  // Handle product duplication (standard B2B catalog building utility)
  const handleDuplicateProduct = async (product: Product) => {
    const duplicatedSku = `${product.sku}-COPY`;
    const duplicatedName = `${product.name} (Copy)`;
    const duplicatedSlug = `${product.slug}-copy`;

    const newProd: Product = {
      ...product,
      _id: 'prod_' + Math.random().toString(36).substr(2, 9),
      name: duplicatedName,
      sku: duplicatedSku,
      slug: duplicatedSlug,
      createdAt: new Date().toISOString()
    };

    try {
      let apiSuccess = false;
      if (!offlineMode) {
        // Post to API duplication endpoint
        const res = await api.post(`/products/${product._id}/duplicate`);
        if (res.data && res.data.success) {
          setProducts(prev => [res.data.product, ...prev]);
          apiSuccess = true;
        }
      }

      if (!apiSuccess) {
        // Offline backup: add to local state
        setProducts(prev => [newProd, ...prev]);
        addLocalLog(newProd._id, 'increase', newProd.stockQuantity, 'Product duplicated manually');
      }
    } catch (err) {
      // Offline fallback duplicate
      setProducts(prev => [newProd, ...prev]);
      addLocalLog(newProd._id, 'increase', newProd.stockQuantity, 'Product duplicated manually (Offline)');
    }
  };

  // Helper: Create a local inventory log entry
  const addLocalLog = (productId: string, actionType: 'increase' | 'decrease' | 'manual-adjustment', qty: number, notes = '') => {
    const matched = products.find(p => p._id === productId);
    const updatedStock = matched ? matched.stockQuantity : qty;
    const newLog: InventoryLog = {
      _id: 'log_' + Date.now(),
      product: matched ? matched.name : productId,
      actionType,
      quantityChanged: qty,
      remainingStock: updatedStock,
      notes,
      performedBy: 'admin',
      createdAt: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Handle inventory stock adjustment (direct shortcut for managers)
  const handleAdjustStock = async (id: string, delta: number) => {
    const updated = products.map(p => {
      if (p._id === id) {
        const newQty = Math.max(0, p.stockQuantity + delta);
        const availability = newQty === 0 ? 'out-of-stock' : newQty <= 10 ? 'low-stock' : 'in-stock';
        return {
          ...p,
          stockQuantity: newQty,
          availability: availability as any
        };
      }
      return p;
    });

    const target = products.find(p => p._id === id);
    if (!target) return;

    try {
      let apiSuccess = false;
      if (!offlineMode) {
        const res = await api.put(`/inventory/${id}`, {
          quantityChanged: Math.abs(delta),
          actionType: delta > 0 ? 'increase' : 'decrease',
          notes: 'Direct stock dashboard adjust'
        });
        if (res.data && res.data.success) {
          apiSuccess = true;
        }
      }

      setProducts(updated);
      addLocalLog(id, delta > 0 ? 'increase' : 'decrease', Math.abs(delta), 'Dashboard stock quick-adjust');
    } catch (err) {
      setProducts(updated);
      addLocalLog(id, delta > 0 ? 'increase' : 'decrease', Math.abs(delta), 'Dashboard stock quick-adjust (Offline)');
    }
  };

  // Handle inquiry status and notes save
  const handleUpdateInquiry = async () => {
    if (!viewingInquiry) return;

    const updated = inquiries.map(inq => {
      if (inq._id === viewingInquiry._id) {
        return {
          ...inq,
          status: inquiryStatus,
          adminNotes: inquiryNotes
        };
      }
      return inq;
    });

    try {
      let apiSuccess = false;
      if (!offlineMode) {
        const res = await api.put(`/inquiries/${viewingInquiry._id}`, {
          status: inquiryStatus,
          adminNotes: inquiryNotes
        });
        if (res.data && res.data.success) apiSuccess = true;
      }

      setInquiries(updated);
      setViewingInquiry(null);
    } catch (err) {
      setInquiries(updated);
      setViewingInquiry(null);
    }
  };

  // Handle product save (New / Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map Category and Brand IDs from values
    const matchedCategory = categories.find(c => c.slug === productForm.categorySlug) || categories[0];
    const matchedBrand = brands.find(b => b.name === 'DEXON') || brands.find(b => b.name === productForm.brandName) || brands[0] || { _id: 'brand_dexon', name: 'DEXON' };

    // Parse specs string Key:Value\nKey2:Value2
    const specifications = productForm.specificationsString
      .split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const [k, v] = line.split(':');
        return { key: k.trim(), value: v.trim() };
      });

    // Parse features
    const features = productForm.featuresString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const slug = editingProduct ? editingProduct.slug : productForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const productPayload = {
      name: productForm.name,
      sku: productForm.sku,
      category: matchedCategory._id,
      subcategory: productForm.categorySlug === 'drawer-channels' ? 'Telescopic Channels' : 'Hardware Fittings',
      brand: matchedBrand._id,
      description: productForm.description,
      stockQuantity: productForm.stockQuantity,
      availability: (productForm.stockQuantity === 0 ? 'out-of-stock' : productForm.stockQuantity <= 10 ? 'low-stock' : 'in-stock') as 'in-stock' | 'low-stock' | 'out-of-stock',
      dimensions: productForm.dimensions,
      material: productForm.material,
      color: productForm.color,
      specifications,
      features,
      images: productForm.images && productForm.images.length > 0 ? productForm.images : [{ url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600', publicId: 'p_placeholder' }],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: false,
      applications: [] as string[],
      seoKeywords: [] as string[]
    };

    try {
      let apiSuccess = false;
      if (!offlineMode) {
        if (editingProduct) {
          const res = await api.put(`/products/${editingProduct._id}`, productPayload);
          if (res.data && res.data.success) {
            setProducts(prev => prev.map(p => p._id === editingProduct._id ? res.data.product : p));
            apiSuccess = true;
          }
        } else {
          const res = await api.post('/products', productPayload);
          if (res.data && res.data.success) {
            setProducts(prev => [res.data.product, ...prev]);
            apiSuccess = true;
          }
        }
      }

      if (!apiSuccess) {
        // Local fallback
        const mockP: Product = {
          _id: editingProduct ? editingProduct._id : 'prod_' + Math.random().toString(36).substr(2, 9),
          ...productPayload,
          category: matchedCategory,
          brand: matchedBrand,
          slug,
          images: productForm.images && productForm.images.length > 0 ? productForm.images : [{ url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600', publicId: 'p_placeholder' }]
        };

        if (editingProduct) {
          setProducts(prev => prev.map(p => p._id === editingProduct._id ? mockP : p));
          addLocalLog(editingProduct._id, 'manual-adjustment', 0, 'Product details updated offline');
        } else {
          setProducts(prev => [mockP, ...prev]);
          addLocalLog(mockP._id, 'increase', mockP.stockQuantity, 'New product created offline');
        }
      }

      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Failed to save product: ' + (err as any).message);
    }
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    const catSlug = typeof product.category === 'string' ? product.category : product.category.slug;
    const bName = typeof product.brand === 'string' ? product.brand : product.brand.name;

    setProductForm({
      name: product.name,
      sku: product.sku,
      categorySlug: catSlug,
      brandName: bName,
      description: product.description || '',
      stockQuantity: product.stockQuantity,
      dimensions: product.dimensions || '',
      material: product.material || '',
      color: product.color || '',
      featuresString: product.features.join('\n'),
      specificationsString: product.specifications.map(s => `${s.key}:${s.value}`).join('\n'),
      images: product.images || []
    });
    setShowProductForm(true);
  };

  const handleCreateProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: '',
      categorySlug: 'drawer-channels',
      brandName: 'DEXON',
      description: '',
      stockQuantity: 100,
      dimensions: '',
      material: '',
      color: '',
      featuresString: 'Silent Closing Dampeners\nLifetime Lubricated Slides\nSolid steel bearings',
      specificationsString: 'Load Capacity:45 kg per pair\nCycle Test Count:50,000 Cycles\nThickness:1.2mm x 1.2mm x 1.5mm',
      images: [{ url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600', publicId: 'p_placeholder' }]
    });
    setShowProductForm(true);
  };

  // Dashboard Stats Calculations
  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0).length;
  const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length;
  const totalProductLines = products.length;

  if (authLoading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col md:flex-row font-sans">

      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-white/5 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-white/5 flex flex-col">
            <span className="text-xl font-bold tracking-widest text-white luxury-heading uppercase">
              DEXON
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-accent -mt-1">
              ADMIN CONTROL
            </span>
          </div>

          {/* User profile */}
          <div className="px-6 py-4 bg-slate-900/50 border-b border-white/5 flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-sm uppercase">
              {user?.username ? user.username.charAt(0) : 'A'}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Logged as: {user?.username || 'Admin'}</p>
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500">SYS_ADMIN</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${activeTab === 'dashboard' ? 'bg-accent text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Console Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${activeTab === 'categories' ? 'bg-accent text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span>Category Manager</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${activeTab === 'products' ? 'bg-accent text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Package className="h-4 w-4 shrink-0" />
              <span>Product Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${activeTab === 'inquiries' ? 'bg-accent text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              <span>Customer Inquiries</span>
              {pendingInquiries > 0 && (
                <span className="bg-rose-600 text-white font-bold text-[9px] h-4 px-1.5 rounded-full flex items-center justify-center ml-auto">
                  {pendingInquiries}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${activeTab === 'inventory' ? 'bg-accent text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Warehouse className="h-4 w-4 shrink-0" />
              <span>Warehouse Stock</span>
            </button>
          </nav>
        </div>

        {/* Action buttons (Sync and Logout) */}
        <div className="p-4 space-y-2 border-t border-white/5">
          {offlineMode && (
            <div className="bg-amber-950/30 border border-amber-500/20 p-3 rounded text-[10px] text-amber-400 flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>DB offline. Changes saved locally in memory.</span>
            </div>
          )}

          <button
            onClick={() => loadData()}
            disabled={dataLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border border-white/15 hover:border-white hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${dataLoading ? 'animate-spin' : ''}`} />
            <span>Sync Systems</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 text-[10px] uppercase font-bold tracking-wider text-rose-400 border border-rose-900/30 bg-rose-950/10 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto max-w-6xl">

        {/* TAB 1: Console Summary */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Page Header */}
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                MANAGEMENT OVERVIEW
              </span>
              <h1 className="text-3xl font-extrabold text-white luxury-heading mt-1">
                Admin Control Console
              </h1>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-slate-900 border border-white/5 p-6 rounded-sm flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</span>
                  <p className="text-3xl font-bold text-white mt-1">{totalInquiries}</p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-accent opacity-30" />
              </div>

              <div className="bg-slate-900 border border-white/5 p-6 rounded-sm flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
                  <p className="text-3xl font-bold text-amber-500 mt-1">{pendingInquiries}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-500 opacity-30" />
              </div>

              <div className="bg-slate-900 border border-white/5 p-6 rounded-sm flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Products</span>
                  <p className="text-3xl font-bold text-white mt-1">{totalProductLines}</p>
                </div>
                <Package className="h-8 w-8 text-accent opacity-30" />
              </div>

              <div className="bg-slate-900 border border-white/5 p-6 rounded-sm flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
                  <p className={`text-3xl font-bold mt-1 ${outOfStockProducts + lowStockProducts > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                    {outOfStockProducts + lowStockProducts}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-rose-500 opacity-30" />
              </div>

            </div>

            {/* Sub-panels (Recent Pending Inquiries) */}
            <div className="bg-slate-900 border border-white/5 p-6 rounded-sm">
              <h2 className="text-lg font-bold text-white mb-6 luxury-heading">
                Pending B2B Customer Quotes
              </h2>
              {inquiries.filter(i => i.status === 'pending').length === 0 ? (
                <p className="text-xs text-slate-500">No pending inquiries at this moment.</p>
              ) : (
                <div className="space-y-4">
                  {inquiries.filter(i => i.status === 'pending').map((inq) => (
                    <div
                      key={inq._id}
                      className="bg-slate-950 p-4 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-sm text-white">{inq.fullName}</strong>
                          <span className="text-[9px] uppercase font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
                            {inq.companyName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {inq.message || 'No direct notes attached.'}
                        </p>
                        <span className="text-[9px] text-slate-500 font-mono block mt-2">
                          Requested: {inq.selectedProducts.length} items • Received: {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setViewingInquiry(inq);
                          setInquiryNotes(inq.adminNotes || '');
                          setInquiryStatus(inq.status);
                        }}
                        className="px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-primary transition-colors text-[10px] uppercase font-bold tracking-wider rounded-sm shrink-0"
                      >
                        Evaluate Quote
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: Categories CRUD */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                  CATEGORY REGISTRY
                </span>
                <h1 className="text-3xl font-extrabold text-white luxury-heading mt-1">
                  Product Category Management
                </h1>
              </div>
              <button
                onClick={handleCreateCategoryClick}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-accent hover:bg-white text-primary hover:text-primary font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Category</span>
              </button>
            </div>

            {/* Categories Table */}
            <div className="bg-slate-900 border border-white/5 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Slug Identifier</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-center">Display Order</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {categories.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-semibold text-white">{c.name}</td>
                        <td className="p-4 font-mono font-medium text-accent">{c.slug}</td>
                        <td className="p-4 text-slate-400 max-w-xs truncate">{c.description || 'N/A'}</td>
                        <td className="p-4 text-center text-white">{c.displayOrder || 0}</td>
                        <td className="p-4">
                          {c.isVisible ? (
                            <span className="text-emerald-500 font-semibold">Visible</span>
                          ) : (
                            <span className="text-slate-500 font-semibold">Hidden</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEditCategoryClick(c)}
                              className="p-2 border border-white/10 text-slate-300 hover:text-accent hover:border-accent transition-colors"
                              title="Edit Category"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c._id)}
                              className="p-2 border border-rose-900/40 text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Product Catalog CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                  INVENTORY CATALOG
                </span>
                <h1 className="text-3xl font-extrabold text-white luxury-heading mt-1">
                  Product Specifications Management
                </h1>
              </div>
              <button
                onClick={handleCreateProductClick}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-accent hover:bg-white text-primary hover:text-primary font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Product</span>
              </button>
            </div>

            {/* Search filter bar */}
            <div className="bg-slate-900 p-4 border border-white/5 flex items-center max-w-md">
              <Search className="h-4 w-4 text-slate-500 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Quick-filter catalog products by SKU, name..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Products Table */}
            <div className="bg-slate-900 border border-white/5 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">SKU</th>
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4">State</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products
                      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((p) => {
                        const cat = typeof p.category === 'string' ? p.category : p.category.name;
                        return (
                          <tr key={p._id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-accent">{p.sku}</td>
                            <td className="p-4 font-medium text-white max-w-xs truncate">{p.name}</td>
                            <td className="p-4 text-slate-400">{cat}</td>
                            <td className="p-4 text-center font-bold text-white">{p.stockQuantity}</td>
                            <td className="p-4">
                              {p.availability === 'in-stock' && <span className="text-emerald-500">In Stock</span>}
                              {p.availability === 'low-stock' && <span className="text-amber-500">Low Stock</span>}
                              {p.availability === 'out-of-stock' && <span className="text-rose-500">Out of Stock</span>}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-2 border border-white/10 text-slate-300 hover:text-accent hover:border-accent transition-colors"
                                  title="Edit Specifications"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-2 border border-white/10 text-slate-300 hover:text-accent hover:border-accent transition-colors"
                                  title="Duplicate Item"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="p-2 border border-rose-900/40 text-rose-400 hover:bg-rose-950/30 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Inquiry Management */}
        {activeTab === 'inquiries' && (
          <div className="space-y-8">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                SUPPLY CHAIN SALES
              </span>
              <h1 className="text-3xl font-extrabold text-white luxury-heading mt-1">
                B2B Purchase Inquiries
              </h1>
            </div>

            {/* Inquiries table */}
            <div className="bg-slate-900 border border-white/5 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Company</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-center">Parts Requested</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-semibold text-white">{inq.fullName}</td>
                        <td className="p-4 font-medium text-slate-300">{inq.companyName}</td>
                        <td className="p-4 text-slate-400">{inq.city}, {inq.state}</td>
                        <td className="p-4 text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-center text-white font-mono">{inq.selectedProducts.length} items</td>
                        <td className="p-4">
                          {inq.status === 'pending' && <span className="bg-amber-950 text-amber-500 font-semibold px-2 py-0.5 rounded border border-amber-900/30">Pending</span>}
                          {inq.status === 'contacted' && <span className="bg-cyan-950 text-cyan-500 font-semibold px-2 py-0.5 rounded border border-cyan-900/30">Contacted</span>}
                          {inq.status === 'completed' && <span className="bg-emerald-950 text-emerald-500 font-semibold px-2 py-0.5 rounded border border-emerald-900/30">Completed</span>}
                          {inq.status === 'cancelled' && <span className="bg-rose-950 text-rose-500 font-semibold px-2 py-0.5 rounded border border-rose-900/30">Cancelled</span>}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setViewingInquiry(inq);
                              setInquiryNotes(inq.adminNotes || '');
                              setInquiryStatus(inq.status);
                            }}
                            className="p-2 border border-white/10 text-slate-300 hover:text-accent hover:border-accent transition-colors"
                            title="Evaluate Inquiry Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Warehouse Stock Stock & History logs */}
        {activeTab === 'inventory' && (
          <div className="space-y-10">
            <div>
              <span className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
                LOGISTICS MANAGEMENT
              </span>
              <h1 className="text-3xl font-extrabold text-white luxury-heading mt-1">
                Warehouse Stock Registry
              </h1>
            </div>

            {/* Grid layout containing quick-adjust and logs list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left 2 cols: Quick Stock Adjust Table */}
              <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-6 rounded-sm">
                <h2 className="text-lg font-bold text-white mb-6 luxury-heading flex items-center space-x-2">
                  <Warehouse className="h-5 w-5 text-accent" />
                  <span>Direct Quantity Adjust</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-white/5 text-slate-400 font-bold uppercase">
                        <th className="p-3">SKU</th>
                        <th className="p-3">Item Details</th>
                        <th className="p-3 text-center">Stock</th>
                        <th className="p-3 text-center">Quick Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-950/20">
                          <td className="p-3 font-mono font-bold text-accent">{p.sku}</td>
                          <td className="p-3 text-white truncate max-w-xs">{p.name}</td>
                          <td className="p-3 text-center font-bold text-white">{p.stockQuantity}</td>
                          <td className="p-3">
                            <div className="flex justify-center items-center space-x-1.5">
                              <button
                                onClick={() => handleAdjustStock(p._id, -50)}
                                className="px-2 py-1 bg-rose-950 text-rose-400 border border-rose-900/30 text-[10px] font-bold hover:bg-rose-900 hover:text-white transition-colors"
                                title="Subtract 50 units"
                              >
                                -50
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p._id, -10)}
                                className="px-2 py-1 bg-rose-950 text-rose-400 border border-rose-900/30 text-[10px] font-bold hover:bg-rose-900 hover:text-white transition-colors"
                                title="Subtract 10 units"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p._id, 10)}
                                className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold hover:bg-emerald-900 hover:text-white transition-colors"
                                title="Add 10 units"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p._id, 50)}
                                className="px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold hover:bg-emerald-900 hover:text-white transition-colors"
                                title="Add 50 units"
                              >
                                +50
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 1 col: History Inventory Logs */}
              <div className="bg-slate-900 border border-white/5 p-6 rounded-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-6 luxury-heading flex items-center space-x-2">
                    <FileClock className="h-5 w-5 text-accent" />
                    <span>Inventory History Log</span>
                  </h2>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {logs.map((log) => {
                      const isInc = log.actionType === 'increase';
                      return (
                        <div key={log._id} className="p-3 bg-slate-950 border border-white/5 text-[11px] leading-relaxed">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold uppercase tracking-wider ${isInc ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {isInc ? 'STOCKED IN' : 'STOCKED OUT'}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="text-white font-medium">
                            {typeof log.product === 'string' ? log.product : log.product?.name}
                          </p>
                          <p className="text-slate-400 font-mono mt-0.5">
                            Adjustment: {isInc ? '+' : '-'}{log.quantityChanged} units • Remainder: {log.remainingStock}
                          </p>

                          {log.notes && (
                            <p className="text-slate-500 mt-1 italic font-light">"{log.notes}"</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* OVERLAY MODAL: Product Specifications Form (New / Edit) */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setShowProductForm(false)} />

          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded shadow-2xl relative z-10 p-8">
            <button
              onClick={() => setShowProductForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white luxury-heading mb-6 border-b border-white/5 pb-3">
              {editingProduct ? `Edit Specifications: ${editingProduct.sku}` : 'Create Catalog Product Item'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs text-slate-300">

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none focus:border-accent"
                    placeholder="e.g. DEXON 3D Clip-On Hydraulic Hinge"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Unique SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none focus:border-accent"
                    placeholder="e.g. DX-HYD-110"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Category collection
                  </label>
                  <select
                    value={productForm.categorySlug}
                    onChange={(e) => setProductForm({ ...productForm, categorySlug: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none focus:border-accent bg-slate-950"
                  >
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={productForm.dimensions}
                    onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none"
                    placeholder="e.g. 45mm x 500mm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Material Composition
                  </label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none"
                    placeholder="e.g. Stainless Steel 304"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Finishing Color
                  </label>
                  <input
                    type="text"
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none"
                    placeholder="e.g. Matte Black Anodized"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description Text
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none"
                  placeholder="Summarize product functionality, metal grade, and soft-close damper features..."
                />
              </div>

              {/* Product Gallery Images Manager */}
              <div className="border-t border-white/5 pt-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Product Gallery Image URLs
                </label>
                <div className="space-y-3">
                  {productForm.images.map((img, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative h-9 w-9 bg-slate-950 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                        {img.url && (img.url.startsWith('http://') || img.url.startsWith('https://') || img.url.startsWith('/')) ? (
                          <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-600 bg-slate-950">None</div>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={img.url}
                        onChange={(e) => {
                          const updated = [...productForm.images];
                          updated[index] = { ...updated[index], url: e.target.value };
                          setProductForm({ ...productForm, images: updated });
                        }}
                        className="w-full px-3 py-1.5 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none focus:border-accent text-xs font-mono"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = productForm.images.filter((_, idx) => idx !== index);
                          setProductForm({ ...productForm, images: updated });
                        }}
                        className="p-2 bg-rose-950/20 border border-rose-900/40 text-rose-400 hover:bg-rose-950/50 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm({
                        ...productForm,
                        images: [...productForm.images, { url: '', publicId: 'custom_' + Date.now() }]
                      });
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-white/10 hover:bg-white/5 text-slate-300 transition-colors text-[10px] uppercase font-bold tracking-wider rounded-sm mt-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Image URL</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Features Highlights (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.featuresString}
                    onChange={(e) => setProductForm({ ...productForm, featuresString: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none font-mono text-[10px]"
                    placeholder="Integrated hydraulic shock absorber&#10;Tool-free clip-on detach mechanism"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Specifications Details (Format: Key:Value, one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.specificationsString}
                    onChange={(e) => setProductForm({ ...productForm, specificationsString: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none font-mono text-[10px]"
                    placeholder="Load Capacity:45 kg per pair&#10;Cycle Test:50,000 Cycles certified"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-6 py-2 border border-white/10 hover:bg-white/5 text-slate-300 transition-colors uppercase tracking-wider font-bold text-[10px] rounded-sm"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-primary font-bold uppercase tracking-wider text-[10px] hover:bg-white hover:text-primary transition-colors rounded-sm"
                >
                  Commit Product Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: Inquiry detailed review */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setViewingInquiry(null)} />

          <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded shadow-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingInquiry(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold text-accent luxury-heading mb-6 border-b border-white/5 pb-3">
              Quote Evaluation: {viewingInquiry.fullName}
            </h2>

            <div className="space-y-6 text-xs text-slate-300">

              {/* Customer details info block */}
              <div className="bg-slate-950 p-4 border border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Contact:</span>
                  <p className="font-semibold text-white">{viewingInquiry.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Company:</span>
                  <p className="font-semibold text-white">{viewingInquiry.companyName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <p className="font-semibold text-white">{viewingInquiry.email}</p>
                </div>
                <div>
                  <span className="text-slate-500">Phone / Mob:</span>
                  <p className="font-semibold text-white">
                    {viewingInquiry.phone}
                    <a
                      href={`https://wa.me/${viewingInquiry.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-emerald-500 hover:underline inline-block font-normal"
                    >
                      (WhatsApp Chat)
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">GST Registration:</span>
                  <p className="font-mono font-semibold text-slate-300">{viewingInquiry.gstNumber || 'UNREGISTERED'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>
                  <p className="font-semibold text-white">{viewingInquiry.city}, {viewingInquiry.state} ({viewingInquiry.pincode})</p>
                </div>
              </div>

              {/* Message */}
              {viewingInquiry.message && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Client Design Notes
                  </span>
                  <p className="bg-slate-950/60 p-3 italic border border-white/5 text-slate-400">
                    "{viewingInquiry.message}"
                  </p>
                </div>
              )}

              {/* Parts list */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Inquired B2B Volumes
                </span>
                <div className="border border-white/5 rounded overflow-hidden">
                  <table className="w-full text-left text-xs bg-slate-950">
                    <thead>
                      <tr className="bg-slate-900 border-b border-white/5 font-bold text-slate-400">
                        <th className="p-3">SKU</th>
                        <th className="p-3">Part Details</th>
                        <th className="p-3 text-center">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {viewingInquiry.selectedProducts.map((item, index) => {
                        const productObj = item.product as any;
                        const prodId = typeof productObj === 'string' ? productObj : productObj?._id;
                        const prod = products.find(p => p._id === prodId);
                        return (
                          <tr key={index}>
                            <td className="p-3 font-mono text-accent">{prod?.sku || 'UNKNOWN'}</td>
                            <td className="p-3 text-white font-medium">{prod?.name || 'Deleted Product'}</td>
                            <td className="p-3 text-center font-bold text-white font-mono">{item.quantity} pcs</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin notes and Status edits */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Review Status
                  </label>
                  <select
                    value={inquiryStatus}
                    onChange={(e) => setInquiryStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none bg-slate-950 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Internal Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none text-xs"
                    placeholder="Enter negotiation notes or pricing catalogs sent..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setViewingInquiry(null)}
                  className="px-6 py-2 border border-white/10 hover:bg-white/5 text-slate-300 transition-colors uppercase tracking-wider font-bold text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateInquiry}
                  className="px-6 py-2 bg-accent text-primary font-bold uppercase tracking-wider text-[10px] hover:bg-white hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Commit Status</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: Category Form (New / Edit) */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setShowCategoryForm(false)} />
          
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded shadow-2xl relative z-10 p-8">
            <button 
              onClick={() => setShowCategoryForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white luxury-heading mb-6 border-b border-white/5 pb-3">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-6 text-xs text-slate-300">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none focus:border-accent"
                  placeholder="e.g. Drawers & Slides"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    required
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="category-visible"
                    checked={categoryForm.isVisible}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isVisible: e.target.checked })}
                    className="mr-2 text-accent bg-slate-950 border-white/10 focus:ring-0 rounded-sm"
                  />
                  <label htmlFor="category-visible" className="text-slate-400 text-xs">
                    Visible in Catalog
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 bg-slate-950 rounded-sm text-white focus:outline-none"
                  placeholder="A short summary of what fittings belong here..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="px-6 py-2 border border-white/10 hover:bg-white/5 text-slate-300 transition-colors uppercase tracking-wider font-bold text-[10px] rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-primary font-bold uppercase tracking-wider text-[10px] hover:bg-white hover:text-primary transition-colors rounded-sm"
                >
                  Save Category
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
