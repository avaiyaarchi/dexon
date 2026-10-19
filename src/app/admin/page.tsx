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
    const duplicatedSku = product.sku ? `${product.sku}-COPY-${Math.floor(100 + Math.random() * 900)}` : `DX-COPY-${Date.now().toString().slice(-6)}`;
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
    const autoSku = editingProduct
      ? (editingProduct.sku || productForm.sku || `DX-${Date.now().toString().slice(-6)}`)
      : (productForm.sku || `DX-${(productForm.name || 'PROD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);

    const productPayload = {
      name: productForm.name,
      sku: autoSku,
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
      sku: product.sku || '',
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
      <div className="bg-[#0a192f] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen flex flex-col md:flex-row font-sans">

      {/* Left Sidebar Navigation - Matching Home Theme (#0a192f Navy + Gold Accents) */}
      <aside className="w-full md:w-64 bg-[#0a192f] text-white border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-slate-800 flex flex-col">
            <span className="text-2xl font-extrabold tracking-widest text-white luxury-heading uppercase">
              DEXON
            </span>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-accent mt-0.5">
              ADMIN CONTROL
            </span>
          </div>

          {/* User profile */}
          <div className="px-6 py-4 bg-[#172a45] border-b border-slate-800 flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-white font-extrabold text-base uppercase shadow-md">
              {user?.username ? user.username.charAt(0) : 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Logged as: {user?.username || 'Admin'}</p>
              <span className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">SYS_ADMIN</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3.5 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'dashboard' ? 'gold-bg text-primary shadow-lg font-bold' : 'text-slate-300 hover:bg-[#172a45] hover:text-white'
                }`}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              <span>Console Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3.5 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'categories' ? 'gold-bg text-primary shadow-lg font-bold' : 'text-slate-300 hover:bg-[#172a45] hover:text-white'
                }`}
            >
              <FolderOpen className="h-5 w-5 shrink-0" />
              <span>Category Manager</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3.5 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'products' ? 'gold-bg text-primary shadow-lg font-bold' : 'text-slate-300 hover:bg-[#172a45] hover:text-white'
                }`}
            >
              <Package className="h-5 w-5 shrink-0" />
              <span>Product Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3.5 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'inquiries' ? 'gold-bg text-primary shadow-lg font-bold' : 'text-slate-300 hover:bg-[#172a45] hover:text-white'
                }`}
            >
              <FileSpreadsheet className="h-5 w-5 shrink-0" />
              <span>Customer Inquiries</span>
              {pendingInquiries > 0 && (
                <span className="bg-rose-600 text-white font-bold text-xs h-5 px-2 rounded-full flex items-center justify-center ml-auto">
                  {pendingInquiries}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3.5 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'inventory' ? 'gold-bg text-primary shadow-lg font-bold' : 'text-slate-300 hover:bg-[#172a45] hover:text-white'
                }`}
            >
              <Warehouse className="h-5 w-5 shrink-0" />
              <span>Warehouse Stock</span>
            </button>
          </nav>
        </div>

        {/* Action buttons (Sync and Logout) */}
        <div className="p-4 space-y-2 border-t border-slate-800">
          {offlineMode && (
            <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-md text-xs text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>DB offline. Changes saved locally in memory.</span>
            </div>
          )}

          <button
            onClick={() => loadData()}
            disabled={dataLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 text-xs uppercase font-bold tracking-wider text-slate-300 border border-slate-700 hover:border-accent hover:text-accent rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
            <span>Sync Systems</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 text-xs uppercase font-bold tracking-wider text-rose-400 border border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/40 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto max-w-6xl">

        {/* TAB 1: Console Summary */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Page Header */}
            <div>
              <span className="text-xs font-bold tracking-[0.25em] text-secondary uppercase">
                MANAGEMENT OVERVIEW
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary luxury-heading mt-1">
                Admin Control Console
              </h1>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inquiries</span>
                  <p className="text-3xl md:text-4xl font-extrabold text-primary mt-1">{totalInquiries}</p>
                </div>
                <FileSpreadsheet className="h-10 w-10 text-secondary opacity-70" />
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Orders</span>
                  <p className="text-3xl md:text-4xl font-extrabold text-amber-600 mt-1">{pendingInquiries}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-amber-500 opacity-70" />
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Products</span>
                  <p className="text-3xl md:text-4xl font-extrabold text-primary mt-1">{totalProductLines}</p>
                </div>
                <Package className="h-10 w-10 text-secondary opacity-70" />
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
                  <p className={`text-3xl md:text-4xl font-extrabold mt-1 ${outOfStockProducts + lowStockProducts > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                    {outOfStockProducts + lowStockProducts}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-rose-500 opacity-70" />
              </div>

            </div>

            {/* Sub-panels (Recent Pending Inquiries) */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-6 luxury-heading">
                Pending B2B Customer Quotes
              </h2>
              {inquiries.filter(i => i.status === 'pending').length === 0 ? (
                <p className="text-sm text-slate-500">No pending inquiries at this moment.</p>
              ) : (
                <div className="space-y-4">
                  {inquiries.filter(i => i.status === 'pending').map((inq) => (
                    <div
                      key={inq._id}
                      className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center space-x-3">
                          <strong className="text-base text-slate-900">{inq.fullName}</strong>
                          <span className="text-xs uppercase font-mono bg-white px-2.5 py-1 rounded border border-slate-200 font-semibold text-secondary">
                            {inq.companyName}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {inq.message || 'No direct notes attached.'}
                        </p>
                        <span className="text-xs text-slate-500 block mt-2 font-mono">
                          Requested: {inq.selectedProducts.length} items • Received: {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setViewingInquiry(inq);
                          setInquiryNotes(inq.adminNotes || '');
                          setInquiryStatus(inq.status);
                        }}
                        className="px-4 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors text-xs uppercase font-bold tracking-wider rounded-md shrink-0 shadow-sm"
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
                <span className="text-xs font-bold tracking-[0.25em] text-secondary uppercase">
                  CATEGORY REGISTRY
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-primary luxury-heading mt-1">
                  Product Category Management
                </h1>
              </div>
              <button
                onClick={handleCreateCategoryClick}
                className="inline-flex items-center space-x-2 px-5 py-3 bg-secondary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Category</span>
              </button>
            </div>

            {/* Categories Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Slug Identifier</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-center">Display Order</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900 text-sm">{c.name}</td>
                        <td className="p-4 font-mono font-semibold text-secondary text-sm">{c.slug}</td>
                        <td className="p-4 text-slate-600 max-w-xs truncate text-sm">{c.description || 'N/A'}</td>
                        <td className="p-4 text-center font-semibold text-slate-800 text-sm">{c.displayOrder || 0}</td>
                        <td className="p-4">
                          {c.isVisible ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md">Visible</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md">Hidden</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEditCategoryClick(c)}
                              className="p-2 border border-slate-200 rounded text-slate-600 hover:text-secondary hover:border-secondary transition-colors"
                              title="Edit Category"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c._id)}
                              className="p-2 border border-rose-200 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
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
                <span className="text-xs font-bold tracking-[0.25em] text-secondary uppercase">
                  INVENTORY CATALOG
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-primary luxury-heading mt-1">
                  Product Specifications Management
                </h1>
              </div>
              <button
                onClick={handleCreateProductClick}
                className="inline-flex items-center space-x-2 px-5 py-3 bg-secondary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Product</span>
              </button>
            </div>

            {/* Search filter bar */}
            <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm flex items-center max-w-md">
              <Search className="h-4 w-4 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Quick-filter catalog products by name, category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none text-sm text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Products Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4">State</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || (typeof p.category === 'object' && p.category?.name.toLowerCase().includes(productSearch.toLowerCase())))
                      .map((p) => {
                        const cat = typeof p.category === 'string' ? p.category : p.category.name;
                        return (
                          <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-slate-900 max-w-xs truncate text-sm">{p.name}</td>
                            <td className="p-4 text-slate-600 font-medium text-sm">{cat}</td>
                            <td className="p-4 text-center font-extrabold text-slate-900 text-sm">{p.stockQuantity}</td>
                            <td className="p-4">
                              {p.availability === 'in-stock' && <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md">In Stock</span>}
                              {p.availability === 'low-stock' && <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-md">Low Stock</span>}
                              {p.availability === 'out-of-stock' && <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-md">Out of Stock</span>}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-2 border border-slate-200 rounded text-slate-600 hover:text-secondary hover:border-secondary transition-colors"
                                  title="Edit Specifications"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-2 border border-slate-200 rounded text-slate-600 hover:text-secondary hover:border-secondary transition-colors"
                                  title="Duplicate Item"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="p-2 border border-rose-200 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4" />
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
              <span className="text-xs font-bold tracking-[0.25em] text-secondary uppercase">
                SUPPLY CHAIN SALES
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary luxury-heading mt-1">
                B2B Purchase Inquiries
              </h1>
            </div>

            {/* Inquiries table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs">
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Company</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-center">Parts Requested</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900 text-sm">{inq.fullName}</td>
                        <td className="p-4 font-semibold text-slate-700 text-sm">{inq.companyName}</td>
                        <td className="p-4 text-slate-600 text-sm">{inq.city}, {inq.state}</td>
                        <td className="p-4 text-slate-600 text-sm">{new Date(inq.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-center text-slate-900 font-bold font-mono text-sm">{inq.selectedProducts.length} items</td>
                        <td className="p-4">
                          {inq.status === 'pending' && <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-200">Pending</span>}
                          {inq.status === 'contacted' && <span className="bg-cyan-100 text-cyan-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-cyan-200">Contacted</span>}
                          {inq.status === 'completed' && <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">Completed</span>}
                          {inq.status === 'cancelled' && <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-rose-200">Cancelled</span>}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setViewingInquiry(inq);
                              setInquiryNotes(inq.adminNotes || '');
                              setInquiryStatus(inq.status);
                            }}
                            className="p-2 border border-slate-200 rounded text-slate-600 hover:text-secondary hover:border-secondary transition-colors"
                            title="Evaluate Inquiry Details"
                          >
                            <Eye className="h-4 w-4" />
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
          <div className="space-y-8">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] text-secondary uppercase">
                LOGISTICS MANAGEMENT
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary luxury-heading mt-1">
                Warehouse Stock Registry
              </h1>
            </div>

            {/* Grid layout containing quick-adjust and logs list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left 2 cols: Quick Stock Adjust Table */}
              <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-6 luxury-heading flex items-center space-x-2">
                  <Warehouse className="h-5 w-5 text-secondary" />
                  <span>Direct Quantity Adjust</span>
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-xs">
                        <th className="p-3">Item Details</th>
                        <th className="p-3 text-center">Stock</th>
                        <th className="p-3 text-center">Quick Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900 truncate max-w-xs text-sm">{p.name}</td>
                          <td className="p-3 text-center font-extrabold text-slate-900 text-sm">{p.stockQuantity}</td>
                          <td className="p-3">
                            <div className="flex justify-center items-center space-x-1.5">
                              <button
                                onClick={() => handleAdjustStock(p._id, -50)}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-600 hover:text-white rounded transition-colors"
                                title="Subtract 50 units"
                              >
                                -50
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p._id, -10)}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-600 hover:text-white rounded transition-colors"
                                title="Subtract 10 units"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p._id, 10)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-600 hover:text-white rounded transition-colors"
                                title="Add 10 units"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p._id, 50)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-600 hover:text-white rounded transition-colors"
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
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary mb-6 luxury-heading flex items-center space-x-2">
                    <FileClock className="h-5 w-5 text-secondary" />
                    <span>Inventory History Log</span>
                  </h2>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {logs.map((log) => {
                      const isInc = log.actionType === 'increase';
                      return (
                        <div key={log._id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold uppercase tracking-wider ${isInc ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isInc ? 'STOCKED IN' : 'STOCKED OUT'}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="text-slate-900 font-bold text-sm">
                            {typeof log.product === 'string' ? log.product : log.product?.name}
                          </p>
                          <p className="text-slate-600 font-mono mt-0.5 text-xs">
                            Adjustment: {isInc ? '+' : '-'}{log.quantityChanged} units • Remainder: {log.remainingStock}
                          </p>

                          {log.notes && (
                            <p className="text-slate-500 mt-1 italic text-xs">"{log.notes}"</p>
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProductForm(false)} />

          <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative z-10 p-8 text-slate-800">
            <button
              onClick={() => setShowProductForm(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-primary luxury-heading mb-6 border-b border-slate-100 pb-4">
              {editingProduct ? `Edit Specifications: ${editingProduct.name}` : 'Create Catalog Product Item'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-sm">

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Product Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-secondary text-sm"
                  placeholder="e.g. DEXON 3D Clip-On Hydraulic Hinge"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Category Collection
                  </label>
                  <select
                    value={productForm.categorySlug}
                    onChange={(e) => setProductForm({ ...productForm, categorySlug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-secondary text-sm"
                  >
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-secondary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={productForm.dimensions}
                    onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                    placeholder="e.g. 45mm x 500mm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                    placeholder="e.g. SS304"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Finishing Color
                  </label>
                  <input
                    type="text"
                    value={productForm.color}
                    onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                    placeholder="e.g. Matte Black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description Text
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                  placeholder="Summarize product functionality, metal grade, and soft-close damper features..."
                />
              </div>

              {/* Product Gallery Images Manager */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Product Gallery Image URLs
                </label>
                <div className="space-y-3">
                  {productForm.images.map((img, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative h-10 w-10 bg-slate-100 border border-slate-200 rounded-md shrink-0 overflow-hidden flex items-center justify-center">
                        {img.url && (img.url.startsWith('http://') || img.url.startsWith('https://') || img.url.startsWith('/')) ? (
                          <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 bg-slate-100">None</div>
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
                        className="w-full px-3.5 py-2 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-xs font-mono"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = productForm.images.filter((_, idx) => idx !== index);
                          setProductForm({ ...productForm, images: updated });
                        }}
                        className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="h-4 w-4" />
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
                    className="inline-flex items-center space-x-2 px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors text-xs uppercase font-bold tracking-wider rounded-lg mt-1"
                  >
                    <Plus className="h-4 w-4 text-secondary" />
                    <span>Add Image URL</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Key Features Highlights (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.featuresString}
                    onChange={(e) => setProductForm({ ...productForm, featuresString: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none font-mono text-xs"
                    placeholder="Integrated hydraulic shock absorber&#10;Tool-free clip-on detach mechanism"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Specifications Details (Format: Key:Value, one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.specificationsString}
                    onChange={(e) => setProductForm({ ...productForm, specificationsString: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none font-mono text-xs"
                    placeholder="Load Capacity:45 kg per pair&#10;Cycle Test:50,000 Cycles certified"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-6 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors uppercase tracking-wider font-bold text-xs rounded-lg"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-secondary text-white font-bold uppercase tracking-wider text-xs hover:bg-primary transition-colors rounded-lg shadow-sm"
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewingInquiry(null)} />

          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setViewingInquiry(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-primary luxury-heading mb-6 border-b border-slate-100 pb-4">
              Quote Evaluation: {viewingInquiry.fullName}
            </h2>

            <div className="space-y-6 text-sm text-slate-700">

              {/* Customer details info block */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-xs">Contact:</span>
                  <p className="font-bold text-slate-900">{viewingInquiry.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Company:</span>
                  <p className="font-bold text-slate-900">{viewingInquiry.companyName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Email:</span>
                  <p className="font-bold text-slate-900">{viewingInquiry.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Phone / Mob:</span>
                  <p className="font-bold text-slate-900">
                    {viewingInquiry.phone}
                    <a
                      href={`https://wa.me/${viewingInquiry.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-emerald-700 hover:underline inline-block font-bold"
                    >
                      (WhatsApp Chat)
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">GST Registration:</span>
                  <p className="font-mono font-bold text-slate-800">{viewingInquiry.gstNumber || 'UNREGISTERED'}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Location:</span>
                  <p className="font-bold text-slate-900">{viewingInquiry.city}, {viewingInquiry.state} ({viewingInquiry.pincode})</p>
                </div>
              </div>

              {/* Message */}
              {viewingInquiry.message && (
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Client Design Notes
                  </span>
                  <p className="bg-slate-50 p-3.5 rounded-lg italic border border-slate-200 text-slate-700">
                    "{viewingInquiry.message}"
                  </p>
                </div>
              )}

              {/* Parts list */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Inquired B2B Volumes
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-xs uppercase">
                        <th className="p-3.5">Part Details</th>
                        <th className="p-3.5 text-center">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingInquiry.selectedProducts.map((item, index) => {
                        const productObj = item.product as any;
                        const prodId = typeof productObj === 'string' ? productObj : productObj?._id;
                        const prod = products.find(p => p._id === prodId);
                        return (
                          <tr key={index}>
                            <td className="p-3.5 text-slate-900 font-bold">{prod?.name || 'Deleted Product'}</td>
                            <td className="p-3.5 text-center font-extrabold text-slate-900 font-mono">{item.quantity} pcs</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin notes and Status edits */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Review Status
                  </label>
                  <select
                    value={inquiryStatus}
                    onChange={(e) => setInquiryStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Internal Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                    placeholder="Enter negotiation notes or pricing catalogs sent..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingInquiry(null)}
                  className="px-6 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors uppercase tracking-wider font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateInquiry}
                  className="px-6 py-2.5 bg-secondary text-white font-bold uppercase tracking-wider text-xs hover:bg-primary transition-colors flex items-center space-x-2 rounded-lg shadow-sm"
                >
                  <Save className="h-4 w-4" />
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCategoryForm(false)} />
          
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 p-8 text-slate-800">
            <button 
              onClick={() => setShowCategoryForm(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-primary luxury-heading mb-6 border-b border-slate-100 pb-4">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-6 text-sm">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-secondary text-sm"
                  placeholder="e.g. Drawers & Slides"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    required
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                  />
                </div>
                <div className="flex items-center pt-7">
                  <input
                    type="checkbox"
                    id="category-visible"
                    checked={categoryForm.isVisible}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isVisible: e.target.checked })}
                    className="h-4 w-4 text-secondary bg-slate-100 border-slate-300 rounded focus:ring-secondary"
                  />
                  <label htmlFor="category-visible" className="ml-2.5 text-slate-700 font-semibold text-sm">
                    Visible in Catalog
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none font-mono text-xs"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 focus:outline-none text-sm"
                  placeholder="A short summary of what fittings belong here..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="px-6 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors uppercase tracking-wider font-bold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-secondary text-white font-bold uppercase tracking-wider text-xs hover:bg-primary transition-colors rounded-lg shadow-sm"
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
