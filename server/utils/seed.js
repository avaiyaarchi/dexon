const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Inquiry = require('../models/Inquiry');

const categoriesData = [
  {
    name: 'Drawer Channels',
    slug: 'drawer-channels',
    description: 'High-durability soft-close telescopic slides and undermount runners.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    displayOrder: 1,
    isVisible: true,
  },
  {
    name: 'Concealed Hinges',
    slug: 'concealed-hinges',
    description: '3D adjustable soft-close auto hinges for sleek modular cabinets.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600',
    displayOrder: 2,
    isVisible: true,
  },
  {
    name: 'Kitchen Profile Handles',
    slug: 'kitchen-profile-handles',
    description: 'Elegant aluminum G-profiles, J-profiles, and edge-pull handles.',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600',
    displayOrder: 3,
    isVisible: true,
  },
  {
    name: 'Corner Solutions & Organizers',
    slug: 'corner-solutions-organizers',
    description: 'Magic corners, carousel shelves, pantry units, and cutlery trays.',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=600',
    displayOrder: 4,
    isVisible: true,
  }
];

const brandsData = [
  {
    name: 'DEXON',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=300',
    description: 'DEXON International Premium Architectural Fittings.',
    website: 'https://dexonhardware.com',
  },
  {
    name: 'Blum',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300',
    description: 'High-end functional fittings for kitchen and living furniture.',
    website: 'https://blum.com',
  },
  {
    name: 'Hettich',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300',
    description: 'German engineering excellence in furniture hardware and slides.',
    website: 'https://hettich.com',
  }
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('DB connected successfully.');

    // Clear existing data (except logs/inquiries, but we can clear them in seed for clean slate)
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await InventoryLog.deleteMany({});
    await Inquiry.deleteMany({});

    // Seed Admin User
    console.log('Seeding Admin User...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'dexonadmin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    const admin = await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashedPassword,
      role: 'admin',
    });
    console.log(`Admin user created: ${admin.username} (Password: ${adminPassword})`);

    // Seed Categories
    console.log('Seeding Categories...');
    const categories = await Category.insertMany(categoriesData);
    console.log(`${categories.length} Categories seeded.`);

    // Seed Brands
    console.log('Seeding Brands...');
    const brands = await Brand.insertMany(brandsData);
    console.log(`${brands.length} Brands seeded.`);

    // Map Categories & Brands
    const cMap = {};
    categories.forEach(c => { cMap[c.slug] = c._id; });

    const bMap = {};
    brands.forEach(b => { bMap[b.name] = b._id; });

    const productsData = [
      {
        name: 'DEXON Soft-Close Telescopic Drawer Slide',
        slug: 'dexon-soft-close-telescopic-drawer-slide',
        sku: 'DX-SC-4520',
        category: cMap['drawer-channels'],
        subcategory: 'Telescopic Channels',
        brand: bMap['DEXON'],
        description: 'Heavy duty cold rolled steel drawer slides featuring an integrated double-spring hydraulic damper for smooth, silent soft-closing. Ideal for kitchen cabinets and heavy storage drawers.',
        dimensions: '45mm x 500mm (20 inch)',
        material: 'Cold Rolled Steel',
        color: 'Zinc Plated Silver',
        stockQuantity: 150,
        specifications: [
          { key: 'Load Capacity', value: '45 kg per pair' },
          { key: 'Cycle Test Count', value: '50,000 Cycles certified' },
          { key: 'Thickness', value: '1.2mm x 1.2mm x 1.5mm' },
          { key: 'Slide Travel', value: 'Full Extension' }
        ],
        features: [
          { text: 'Integrated liquid piston shock absorber' },
          { text: 'Side mount installation with quick-disconnect trigger' },
          { text: 'Dual steel ball bearing cage design' }
        ].map(f => f.text),
        applications: [
          { text: 'Residential modular kitchens' },
          { text: 'Office workstations and storage files' },
          { text: 'Commercial showroom cabinets' }
        ].map(a => a.text),
        images: [
          { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800', publicId: 'placeholder_p1_1' },
          { url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800', publicId: 'placeholder_p1_2' }
        ],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        seoTitle: 'DEXON Soft-Close Telescopic Drawer Slides 20 Inch',
        seoDescription: 'Buy premium DEXON soft-close drawer runners with a load capacity of 45kg and full extension capabilities. Direct wholesale supplies for B2B kitchen manufacturers.',
        seoKeywords: ['drawer slides', 'soft close channels', 'telescopic runners', 'kitchen drawer hardware', 'dexon slides']
      },
      {
        name: 'DEXON 3D Clip-On Hydraulic Hinge',
        slug: 'dexon-3d-clip-on-hydraulic-hinge',
        sku: 'DX-HYD-110',
        category: cMap['concealed-hinges'],
        subcategory: 'Cabinet Hinges',
        brand: bMap['DEXON'],
        description: 'Auto soft-closing concealed hinge featuring 3D screw adjustments for height, width, and depth alignment. Tool-free clip-on plate attachment ensures rapid installation.',
        dimensions: '35mm hinge cup, 110 degree opening angle',
        material: 'Stainless Steel 304',
        color: 'Nickel Plated Steel Finish',
        stockQuantity: 400,
        specifications: [
          { key: 'Hinge Crank', value: 'Full Overlay (0 Crank)' },
          { key: 'Closing Speed', value: '3 to 5 seconds adjustable' },
          { key: 'Cup Depth', value: '11.5 mm' },
          { key: 'Door Thickness Fit', value: '14mm - 22mm' }
        ],
        features: [
          { text: 'Corrosion resistant Solid Brass hydraulic damper' },
          { text: 'Six-way adjustment screws' },
          { text: 'Quick release trigger plate' }
        ].map(f => f.text),
        applications: [
          { text: 'Modular kitchen wall units' },
          { text: 'Wardrobe and vanity doors' },
          { text: 'Office furniture cabinets' }
        ].map(a => a.text),
        images: [
          { url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800', publicId: 'placeholder_p2_1' }
        ],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        seoTitle: 'Premium 3D Hydraulic Cabinet Hinges | DEXON B2B',
        seoDescription: 'Wholesale 3D adjustable hydraulic kitchen hinges by DEXON. Made of SS304 with clip-on mechanism and soft-close damper.',
        seoKeywords: ['cabinet hinges', 'hydraulic hinge', 'soft close hinge', '3d hinge', 'dexon hinges']
      },
      {
        name: 'DEXON Sleek Profile G-Handle',
        slug: 'dexon-sleek-profile-g-handle',
        sku: 'DX-PROF-G300',
        category: cMap['kitchen-profile-handles'],
        subcategory: 'Aluminum Profile Handles',
        brand: bMap['DEXON'],
        description: 'Premium quality G-section profile handle designed for handle-less kitchen aesthetics. Features a smooth anodized surface and flush mounting on door edges.',
        dimensions: '3000mm length (cut-to-size)',
        material: 'High-Grade T5 Aluminum Alloy',
        color: 'Matte Black Anodized / Rose Gold Brushed',
        stockQuantity: 8, // Low stock for testing
        specifications: [
          { key: 'Profile Depth', value: '18 mm' },
          { key: 'Finish Type', value: 'Acid etched anodizing' },
          { key: 'Mounting Type', value: 'Grooved Edge Mount' }
        ],
        features: [
          { text: 'Sleek handle-less visual design' },
          { text: 'Rustproof and warp-resistant aluminum' },
          { text: 'No sharp corners - child-safe edge profiles' }
        ].map(f => f.text),
        applications: [
          { text: 'Kitchen drawer fronts' },
          { text: 'Wardrobe sliding doors' },
          { text: 'Integrated modular cabinets' }
        ].map(a => a.text),
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800', publicId: 'placeholder_p3_1' }
        ],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        seoTitle: 'Aluminum G-Profile Handles Matte Black | DEXON',
        seoDescription: 'Inquire for B2B supplies of DEXON aluminum G-profile cabinet handles. Clean design, matte black anodized surface, 3-meter lengths.',
        seoKeywords: ['profile handle', 'g profile handle', 'kitchen handleless', 'aluminum profile', 'dexon handles']
      },
      {
        name: 'Hettich Silent System Corner Carousel',
        slug: 'hettich-silent-system-corner-carousel',
        sku: 'HT-CAR-900',
        category: cMap['corner-solutions-organizers'],
        subcategory: 'Corner Solutions',
        brand: bMap['Hettich'],
        description: 'Premium rotational corner tray storage solution by Hettich. Features anti-slip wooden trays and a gas-spring assisted height adjustability system for complete cabinet accessibility.',
        dimensions: 'Fits 900mm L-shaped corner base unit',
        material: 'Chrome Plated Mild Steel and Engineered Wood',
        color: 'Sleek Chrome Rail with White Base Trays',
        stockQuantity: 0, // Out of stock for testing
        specifications: [
          { key: 'Load Capacity', value: '20 kg per tray' },
          { key: 'Opening Type', value: 'Self-indexing revolving trays' },
          { key: 'Tray Height Adjustment', value: 'Variable spacing' }
        ],
        features: [
          { text: 'Smooth 360-degree rotation' },
          { text: 'Anti-slip surface treatment on shelves' },
          { text: 'Soft-close centering index' }
        ].map(f => f.text),
        applications: [
          { text: 'Kitchen corner blind units' },
          { text: 'L-shape modular base corner cabinets' }
        ].map(a => a.text),
        images: [
          { url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800', publicId: 'placeholder_p4_1' }
        ],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: false,
        seoTitle: 'Hettich Kitchen Corner Carousel 900mm',
        seoDescription: 'Find premium Hettich corner carousel organizers. Features revolving trays, chrome railing, soft closure, and heavy loading support. Order B2B quote.',
        seoKeywords: ['corner carousel', 'kitchen organizers', 'magic corner', 'hettich cabinet organizers', 'blind corner storage']
      }
    ];

    console.log('Seeding Products...');
    const products = await Product.insertMany(productsData);
    console.log(`${products.length} Products seeded.`);

    // Seed inventory logs for products
    console.log('Seeding Inventory Logs...');
    for (const p of products) {
      await InventoryLog.create({
        product: p._id,
        actionType: 'increase',
        quantityChanged: p.stockQuantity,
        remainingStock: p.stockQuantity,
        notes: 'Initial seed stock',
        performedBy: admin._id,
      });
    }
    console.log('Inventory logs seeded.');

    // Seed a sample inquiry for dashboard testing
    console.log('Seeding Sample Inquiry...');
    await Inquiry.create({
      fullName: 'Vikram Singh',
      companyName: 'Deluxe Modular Kitchens',
      email: 'vikram@deluxekitchens.com',
      phone: '+919988776655',
      whatsappNumber: '919988776655',
      gstNumber: '07AAAAA1111A1Z9',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110015',
      message: 'Need urgent pricing details for drawer slides and corner carousels for our upcoming apartment project of 50 flats.',
      selectedProducts: [
        { product: products[0]._id, quantity: 200 },
        { product: products[1]._id, quantity: 500 },
        { product: products[3]._id, quantity: 50 }
      ],
      status: 'pending',
      adminNotes: '',
    });
    console.log('Sample inquiry seeded.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
