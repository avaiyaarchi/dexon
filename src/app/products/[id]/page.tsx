'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Check, 
  ShoppingCart, 
  Info, 
  Layers, 
  ShieldCheck, 
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';
import { Product } from '@/types';
import { mockProducts } from '@/services/mockData';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addToCart, cartItems } = useCart();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(10); // Standard B2B MOQ starts at 10
  const [addedMessage, setAddedMessage] = useState(false);

  // Load product details
  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.success) {
          const prodData = res.data.product;
          setProduct(prodData);
          
          // Load related products in same category
          const categoryId = typeof prodData.category === 'string' ? prodData.category : prodData.category._id;
          const relatedRes = await api.get(`/products?category=${categoryId}&limit=4`);
          if (relatedRes.data && relatedRes.data.success) {
            setRelatedProducts(relatedRes.data.products.filter((p: Product) => p._id !== prodData._id));
          }
        } else {
          throw new Error('Failed to load product details');
        }
      } catch (err) {
        console.warn('API error loading product. Gracefully falling back to local database.');
        
        // Local database fallback lookup
        const match = mockProducts.find(p => p._id === id);
        if (match) {
          setProduct(match);
          
          // Local related products filter
          const categorySlug = typeof match.category === 'string' ? match.category : match.category.slug;
          const filteredRelated = mockProducts
            .filter(p => {
              const catSlug = typeof p.category === 'string' ? p.category : p.category.slug;
              return catSlug === categorySlug && p._id !== match._id;
            })
            .slice(0, 4);
          setRelatedProducts(filteredRelated);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setActiveImageIndex(0); // Reset image index on page reload
    setQuantity(10);        // Reset quantity
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h2 className="text-xl font-bold text-primary mb-2">Specifications Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The hardware specifications sheet you requested does not exist or has been archived.</p>
        <Link href="/products" className="px-5 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors rounded-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isInCart = cartItems.some(item => item.product._id === product._id);
  const mainImage = product.images && product.images[activeImageIndex] ? product.images[activeImageIndex].url : '/placeholder.jpg';

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  const getStockBadge = (status: string, qty: number) => {
    if (status === 'in-stock') {
      return <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider border border-emerald-200">In Stock ({qty} pcs)</span>;
    } else if (status === 'low-stock') {
      return <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider border border-amber-200">Low Stock ({qty} pcs)</span>;
    } else {
      return <span className="bg-rose-50 text-rose-800 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider border border-rose-200">Out of Stock</span>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <div className="mb-8">
          <Link 
            href="/products" 
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-primary uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to B2B Catalog</span>
          </Link>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white border border-slate-200 p-6 md:p-10 shadow-sm rounded-sm">
          
          {/* Left Column: Image Viewer Gallery */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Main Active Image Box */}
            <div className="relative h-[320px] md:h-[450px] bg-slate-100 border border-slate-200 overflow-hidden group">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Thumbnails row */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-20 bg-slate-100 border transition-all ${
                      activeImageIndex === index 
                        ? 'border-secondary ring-1 ring-secondary' 
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} View ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* B2B Trust badges */}
            <div className="pt-6 grid grid-cols-3 gap-2 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 border border-slate-100 flex flex-col items-center">
                <ShieldCheck className="h-5 w-5 text-secondary mb-1.5" />
                <span className="text-[10px] font-bold text-primary uppercase">50k Cycles</span>
                <span className="text-[8px] text-slate-400 mt-0.5">SGS Certified</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 flex flex-col items-center">
                <Truck className="h-5 w-5 text-secondary mb-1.5" />
                <span className="text-[10px] font-bold text-primary uppercase">Wholesale</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Pan-India Freight</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 flex flex-col items-center">
                <Layers className="h-5 w-5 text-secondary mb-1.5" />
                <span className="text-[10px] font-bold text-primary uppercase">Pure Alloy</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Heavy Gauge Metal</span>
              </div>
            </div>

          </div>

          {/* Right Column: Specifications Detail & MOQ cart */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            {/* Header Content */}
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                    {typeof product.category === 'string' ? product.category : product.category.name}
                  </span>
                  <h1 className="text-3xl font-extrabold text-primary luxury-heading mt-1">
                    {product.name}
                  </h1>
                </div>
                <div>
                  {getStockBadge(product.availability, product.stockQuantity)}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Overview</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Technical Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-secondary" />
                    <span>Technical Parameters</span>
                  </h3>
                  <div className="bg-slate-50 border border-slate-150 rounded-sm p-4">
                    <table className="w-full text-xs">
                      <tbody>
                        {product.specifications.map((spec, index) => (
                          <tr key={index} className="border-b border-slate-200/50 last:border-0">
                            <td className="py-2 font-medium text-slate-500 w-1/3">{spec.key}</td>
                            <td className="py-2 font-bold text-slate-800 w-2/3">{spec.value}</td>
                          </tr>
                        ))}
                        {product.material && (
                          <tr className="border-b border-slate-200/50 font-sans">
                            <td className="py-2 font-medium text-slate-500">Material Composition</td>
                            <td className="py-2 font-bold text-slate-800">{product.material}</td>
                          </tr>
                        )}
                        {product.dimensions && (
                          <tr className="border-b border-slate-200/50">
                            <td className="py-2 font-medium text-slate-500">Physical Dimensions</td>
                            <td className="py-2 font-bold text-slate-800">{product.dimensions}</td>
                          </tr>
                        )}
                        {product.color && (
                          <tr className="last:border-0">
                            <td className="py-2 font-medium text-slate-500">Color/Finish</td>
                            <td className="py-2 font-bold text-slate-800">{product.color}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Highlights Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Quality Highlights</h3>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2">
                    {product.features.map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* B2B Procurement cart drawer footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50 p-6">
              {product.availability === 'out-of-stock' ? (
                <div className="text-center p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold">
                  This item is currently out of stock. Contact customer support to request a back-order timeline.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        B2B MINIMUM ORDER QUANTITY (MOQ)
                      </span>
                      <span className="text-[9px] text-slate-500">
                        Adjust bulk pieces. Direct price calculation is completed during quote negotiation.
                      </span>
                    </div>
                    
                    {/* Incrementer box */}
                    <div className="flex items-center border border-slate-300 bg-white self-start">
                      <button
                        onClick={() => setQuantity(q => Math.max(10, q - 10))}
                        className="p-2.5 hover:bg-slate-100 border-r border-slate-300 text-slate-600 transition-colors"
                        title="Decrease by 10"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min="10"
                        onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                        className="w-16 text-center text-xs font-bold text-primary focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(q => q + 10)}
                        className="p-2.5 hover:bg-slate-100 border-l border-slate-300 text-slate-600 transition-colors"
                        title="Increase by 10"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-4 text-xs font-bold uppercase tracking-widest transition-all shadow flex items-center justify-center space-x-2 ${
                      addedMessage 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-primary hover:bg-slate-800 text-white'
                    }`}
                  >
                    {addedMessage ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added to Inquiry list</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 text-accent" />
                        <span>Add {quantity} pieces to Inquiry list</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Section: Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-primary luxury-heading">
                Related Cabinet Hardware
              </h2>
              <Link 
                href="/products" 
                className="text-xs font-bold text-secondary hover:text-primary uppercase tracking-wider transition-colors border-b border-secondary pb-0.5"
              >
                Browse All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const isItemInCart = cartItems.some(item => item.product._id === p._id);
                return (
                  <div 
                    key={p._id}
                    className="bg-white border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    <Link href={`/products/${p._id}`} className="relative h-44 bg-slate-100 overflow-hidden block cursor-pointer">
                      <Image
                        src={p.images && p.images[0] ? p.images[0].url : '/placeholder.jpg'}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                          <Link href={`/products/${p._id}`}>{p.name}</Link>
                        </h3>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Link 
                          href={`/products/${p._id}`}
                          className="text-[9px] uppercase font-bold tracking-wider text-slate-500 hover:text-primary flex items-center space-x-1"
                        >
                          <Info className="h-3 w-3" />
                          <span>Specs</span>
                        </Link>
                        
                        <button
                          onClick={() => addToCart(p, 10)}
                          className={`px-2 py-1 rounded-sm text-[9px] uppercase font-bold tracking-wider transition-all border ${
                            isItemInCart 
                              ? 'border-emerald-600 bg-emerald-600 text-white' 
                              : 'border-primary text-primary hover:bg-primary hover:text-white'
                          }`}
                        >
                          {isItemInCart ? 'Added' : 'Add to Quote'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
