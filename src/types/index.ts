export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isVisible: boolean;
  createdAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  createdAt?: string;
}

export interface Specification {
  key: string;
  value: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  category: Category | string; // Can be populated or just ID
  subcategory?: string;
  brand: Brand | string;       // Can be populated or just ID
  description?: string;
  specifications: Specification[];
  dimensions?: string;
  material?: string;
  color?: string;
  features: string[];
  applications: string[];
  stockQuantity: number;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: ProductImage[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface InquirySelectedProduct {
  product: Product | string;
  quantity: number;
}

export interface Inquiry {
  _id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  gstNumber?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  message?: string;
  selectedProducts: {
    product: Product;
    quantity: number;
  }[];
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  username: string;
  role: string;
}

export interface InventoryLog {
  _id: string;
  product: Product | string;
  actionType: 'increase' | 'decrease' | 'manual-adjustment';
  quantityChanged: number;
  remainingStock: number;
  notes?: string;
  performedBy?: {
    _id: string;
    username: string;
  } | string;
  createdAt: string;
}
