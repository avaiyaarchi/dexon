import { Product, Category, Brand, Inquiry, InventoryLog } from '@/types';

export const mockCategories: Category[] = [
  {
    _id: 'cat_drawer_channels',
    name: 'Drawer Channels',
    slug: 'drawer-channels',
    description: 'High-durability soft-close telescopic slides and undermount runners.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    displayOrder: 1,
    isVisible: true,
  },
  {
    _id: 'cat_concealed_hinges',
    name: 'Concealed Hinges',
    slug: 'concealed-hinges',
    description: '3D adjustable soft-close auto hinges for sleek modular cabinets.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600',
    displayOrder: 2,
    isVisible: true,
  },
  {
    _id: 'cat_profile_handles',
    name: 'Kitchen Profile Handles',
    slug: 'kitchen-profile-handles',
    description: 'Elegant aluminum G-profiles, J-profiles, and edge-pull handles.',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600',
    displayOrder: 3,
    isVisible: true,
  },
  {
    _id: 'cat_corner_solutions',
    name: 'Corner Solutions & Organizers',
    slug: 'corner-solutions-organizers',
    description: 'Magic corners, carousel shelves, pantry units, and cutlery trays.',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=600',
    displayOrder: 4,
    isVisible: true,
  }
];

export const mockBrands: Brand[] = [
  {
    _id: 'brand_dexon',
    name: 'DEXON',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=300',
    description: 'DEXON International Premium Architectural Fittings.',
    website: 'https://dexonhardware.com',
  },
  {
    _id: 'brand_blum',
    name: 'Blum',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300',
    description: 'High-end functional fittings for kitchen and living furniture.',
    website: 'https://blum.com',
  },
  {
    _id: 'brand_hettich',
    name: 'Hettich',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300',
    description: 'German engineering excellence in furniture hardware and slides.',
    website: 'https://hettich.com',
  }
];

export const mockProducts: Product[] = [
  {
    _id: 'prod_telescopic_slide',
    name: 'DEXON Soft-Close Telescopic Drawer Slide',
    slug: 'dexon-soft-close-telescopic-drawer-slide',
    sku: 'DX-SC-4520',
    category: mockCategories[0],
    subcategory: 'Telescopic Channels',
    brand: mockBrands[0],
    description: 'Heavy duty cold rolled steel drawer slides featuring an integrated double-spring hydraulic damper for smooth, silent soft-closing. Ideal for modular kitchen cabinets, heavy wardrobe pull-outs, and office storage drawers.',
    dimensions: '45mm x 500mm (20 inch)',
    material: 'Cold Rolled Steel',
    color: 'Zinc Plated Silver',
    stockQuantity: 150,
    availability: 'in-stock',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    specifications: [
      { key: 'Load Capacity', value: '45 kg per pair' },
      { key: 'Cycle Test Count', value: '50,000 Cycles certified' },
      { key: 'Thickness', value: '1.2mm x 1.2mm x 1.5mm' },
      { key: 'Slide Travel', value: 'Full Extension' }
    ],
    features: [
      'Integrated liquid piston shock absorber for silent closing',
      'Side mount installation with quick-disconnect trigger system',
      'Dual steel ball bearing cage design for ultra-smooth travel'
    ],
    applications: [
      'Residential modular kitchens and pantries',
      'Office workstations and storage files',
      'Commercial showroom cabinets'
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800', publicId: 'p1_1' },
      { url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800', publicId: 'p1_2' },
      { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800', publicId: 'p1_3' }
    ],
    seoTitle: 'DEXON Soft-Close Telescopic Drawer Slides 20 Inch',
    seoDescription: 'Buy premium DEXON soft-close drawer runners with a load capacity of 45kg and full extension capabilities. Direct wholesale supplies for B2B kitchen manufacturers.',
    seoKeywords: ['drawer slides', 'soft close channels', 'telescopic runners', 'kitchen drawer hardware', 'dexon slides']
  },
  {
    _id: 'prod_hydraulic_hinge',
    name: 'DEXON 3D Clip-On Hydraulic Hinge',
    slug: 'dexon-3d-clip-on-hydraulic-hinge',
    sku: 'DX-HYD-110',
    category: mockCategories[1],
    subcategory: 'Cabinet Hinges',
    brand: mockBrands[0],
    description: 'Auto soft-closing concealed hinge featuring 3D screw adjustments for height, width, and depth alignment. Tool-free clip-on plate attachment ensures rapid cabinet installation.',
    dimensions: '35mm hinge cup, 110 degree opening angle',
    material: 'Stainless Steel 304',
    color: 'Nickel Plated Steel Finish',
    stockQuantity: 400,
    availability: 'in-stock',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    specifications: [
      { key: 'Hinge Crank', value: 'Full Overlay (0 Crank)' },
      { key: 'Closing Speed', value: '3 to 5 seconds adjustable' },
      { key: 'Cup Depth', value: '11.5 mm' },
      { key: 'Door Thickness Fit', value: '14mm - 22mm' }
    ],
    features: [
      'Corrosion resistant Solid Brass hydraulic damper piston',
      'Six-way adjustment screws for perfect door gap alignment',
      'Quick release trigger plate for easy door mounting and detachment'
    ],
    applications: [
      'Modular kitchen wall units and floor cabinets',
      'Wardrobe and vanity doors',
      'Office furniture cabinets'
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800', publicId: 'p2_1' },
      { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800', publicId: 'p2_2' },
      { url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', publicId: 'p2_3' }
    ],
    seoTitle: 'Premium 3D Hydraulic Cabinet Hinges | DEXON B2B',
    seoDescription: 'Wholesale 3D adjustable hydraulic kitchen hinges by DEXON. Made of SS304 with clip-on mechanism and soft-close damper.',
    seoKeywords: ['cabinet hinges', 'hydraulic hinge', 'soft close hinge', '3d hinge', 'dexon hinges']
  },
  {
    _id: 'prod_g_handle',
    name: 'DEXON Sleek Profile G-Handle',
    slug: 'dexon-sleek-profile-g-handle',
    sku: 'DX-PROF-G300',
    category: mockCategories[2],
    subcategory: 'Aluminum Profile Handles',
    brand: mockBrands[0],
    description: 'Premium quality G-section profile handle designed for handle-less kitchen aesthetics. Features a smooth anodized surface and flush mounting on door edges. Lends a contemporary minimalist finish.',
    dimensions: '3000mm length (cut-to-size)',
    material: 'High-Grade T5 Aluminum Alloy',
    color: 'Matte Black Anodized / Rose Gold Brushed',
    stockQuantity: 8,
    availability: 'low-stock',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    specifications: [
      { key: 'Profile Depth', value: '18 mm' },
      { key: 'Finish Type', value: 'Acid etched anodizing' },
      { key: 'Mounting Type', value: 'Grooved Edge Mount' }
    ],
    features: [
      'Sleek handle-less visual design for clean cabinet lines',
      'Rustproof and warp-resistant aluminum alloy',
      'No sharp corners - rounded, child-safe edge profiles'
    ],
    applications: [
      'Kitchen drawer fronts and base unit doors',
      'Wardrobe sliding doors and dressers',
      'Integrated modular cabinet panels'
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800', publicId: 'p3_1' },
      { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800', publicId: 'p3_2' },
      { url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', publicId: 'p3_3' }
    ],
    seoTitle: 'Aluminum G-Profile Handles Matte Black | DEXON',
    seoDescription: 'Inquire for B2B supplies of DEXON aluminum G-profile cabinet handles. Clean design, matte black anodized surface, 3-meter lengths.',
    seoKeywords: ['profile handle', 'g profile handle', 'kitchen handleless', 'aluminum profile', 'dexon handles']
  },
  {
    _id: 'prod_corner_carousel',
    name: 'Hettich Silent System Corner Carousel',
    slug: 'hettich-silent-system-corner-carousel',
    sku: 'HT-CAR-900',
    category: mockCategories[3],
    subcategory: 'Corner Solutions',
    brand: mockBrands[2],
    description: 'Premium rotational corner tray storage solution by Hettich. Features anti-slip wooden trays and a gas-spring assisted height adjustability system for complete kitchen cabinet accessibility.',
    dimensions: 'Fits 900mm L-shaped corner base unit',
    material: 'Chrome Plated Mild Steel and Engineered Wood',
    color: 'Sleek Chrome Rail with White Base Trays',
    stockQuantity: 0,
    availability: 'out-of-stock',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    specifications: [
      { key: 'Load Capacity', value: '20 kg per tray' },
      { key: 'Opening Type', value: 'Self-indexing revolving trays' },
      { key: 'Tray Height Adjustment', value: 'Variable spacing' }
    ],
    features: [
      'Smooth 360-degree rotation with self-indexing action',
      'Anti-slip surface treatment on shelves to prevent falling jars',
      'Soft-close centering index for silent operations'
    ],
    applications: [
      'Kitchen corner blind units',
      'L-shape modular base corner cabinets'
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', publicId: 'p4_1' },
      { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800', publicId: 'p4_2' },
      { url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800', publicId: 'p4_3' }
    ],
    seoTitle: 'Hettich Kitchen Corner Carousel 900mm',
    seoDescription: 'Find premium Hettich corner carousel organizers. Features revolving trays, chrome railing, soft closure, and heavy loading support. Order B2B quote.',
    seoKeywords: ['corner carousel', 'kitchen organizers', 'magic corner', 'hettich cabinet organizers', 'blind corner storage']
  }
];

export const mockInquiries: Inquiry[] = [
  {
    _id: 'inq_1',
    fullName: 'Vikram Singh',
    companyName: 'Deluxe Modular Kitchens',
    email: 'vikram@deluxekitchens.com',
    phone: '+91 99887 76655',
    whatsappNumber: '919988776655',
    gstNumber: '07AAAAA1111A1Z9',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110015',
    message: 'Need urgent pricing details for drawer slides and corner carousels for our upcoming apartment project of 50 flats.',
    selectedProducts: [
      { product: mockProducts[0], quantity: 200 },
      { product: mockProducts[1], quantity: 500 },
      { product: mockProducts[3], quantity: 50 }
    ],
    status: 'pending',
    adminNotes: 'Spoke on call. Will send standard quotation catalog via email.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  },
  {
    _id: 'inq_2',
    fullName: 'Nirali Patel',
    companyName: 'Apex Woodworks & Designs',
    email: 'nirali@apexwoodworks.com',
    phone: '+91 98980 12345',
    whatsappNumber: '919898012345',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    pincode: '380009',
    message: 'Looking for a regular supplier for profile G-handles and auto soft close hinges. Do you provide custom cut profiles?',
    selectedProducts: [
      { product: mockProducts[2], quantity: 150 },
      { product: mockProducts[1], quantity: 300 }
    ],
    status: 'contacted',
    adminNotes: 'Sample catalog sent on WhatsApp. Waiting for size specs.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString() // 6 hours ago
  }
];

export const mockInventoryLogs: InventoryLog[] = [
  {
    _id: 'log_1',
    product: mockProducts[0]._id,
    actionType: 'increase',
    quantityChanged: 150,
    remainingStock: 150,
    notes: 'Initial seed stock',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    _id: 'log_2',
    product: mockProducts[1]._id,
    actionType: 'increase',
    quantityChanged: 400,
    remainingStock: 400,
    notes: 'Initial seed stock',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    _id: 'log_3',
    product: mockProducts[2]._id,
    actionType: 'increase',
    quantityChanged: 8,
    remainingStock: 8,
    notes: 'Initial seed stock',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];
