const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');

// @desc    Submit a new inquiry (Cart checkout equivalent)
// @route   POST /api/inquiries
// @access  Public
const createInquiry = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      email,
      phone,
      whatsappNumber,
      gstNumber,
      city,
      state,
      country,
      pincode,
      message,
      selectedProducts // Array of { product: id, quantity: num }
    } = req.body;

    if (
      !fullName ||
      !companyName ||
      !email ||
      !phone ||
      !whatsappNumber ||
      !city ||
      !state ||
      !pincode ||
      !selectedProducts ||
      selectedProducts.length === 0
    ) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields and select at least one product.' });
    }

    // Save inquiry to MongoDB
    const inquiry = await Inquiry.create({
      fullName,
      companyName,
      email,
      phone,
      whatsappNumber,
      gstNumber: gstNumber || '',
      city,
      state,
      country: country || 'India',
      pincode,
      message: message || '',
      selectedProducts,
    });

    // Populate products to build the WhatsApp text message and response
    const populatedInquiry = await Inquiry.findById(inquiry._id).populate('selectedProducts.product', 'name sku');

    // Build WhatsApp message
    let productLines = '';
    populatedInquiry.selectedProducts.forEach((item) => {
      const name = item.product ? item.product.name : 'Unknown Product';
      const sku = item.product && item.product.sku ? ` (${item.product.sku})` : '';
      productLines += `• ${name}${sku} [Qty: ${item.quantity}]\n`;
    });

    const whatsappMessage =
      `Hello DEXON,

I would like to submit a B2B inquiry for the following products:
${productLines}
My Details:
Name: ${fullName}
Company: ${companyName}
Phone: ${phone}
WhatsApp: ${whatsappNumber}
Email: ${email}
GST No: ${gstNumber || 'N/A'}
City/State: ${city}, ${state} (${pincode})

Message: ${message || 'None'}

Please contact me with a quote.`;

    // WhatsApp Direct Link URL
    const targetPhone = process.env.WHATSAPP_TARGET_PHONE || '917016722531';
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    res.status(201).json({
      success: true,
      inquiry: populatedInquiry,
      whatsappUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all inquiries (Admin)
// @route   GET /api/inquiries
// @access  Private (Admin)
const getInquiries = async (req, res) => {
  try {
    const { status, search, sort, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort) {
      if (sort === 'oldest') sortOptions = { createdAt: 1 };
      else if (sort === 'name-asc') sortOptions = { fullName: 1 };
      else if (sort === 'company-asc') sortOptions = { companyName: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const inquiries = await Inquiry.find(query)
      .populate('selectedProducts.product', 'name sku images')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalInquiries = await Inquiry.countDocuments(query);

    res.json({
      success: true,
      count: inquiries.length,
      totalPages: Math.ceil(totalInquiries / parseInt(limit)),
      currentPage: parseInt(page),
      totalInquiries,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single inquiry details
// @route   GET /api/inquiries/:id
// @access  Private (Admin)
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('selectedProducts.product', 'name sku images stockQuantity availability');

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inquiry status & internal admin notes
// @route   PUT /api/inquiries/:id/status
// @access  Private (Admin)
const updateInquiryStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    let inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    inquiry = await Inquiry.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin)
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    await inquiry.deleteOne();

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download Inquiry PDF Receipt
// @route   GET /api/inquiries/:id/pdf
// @access  Private (Admin)
const downloadPDF = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('selectedProducts.product', 'name sku');

    if (!inquiry) {
      return res.status(404).send('Inquiry not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Inquiry_${inquiry._id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header styling
    doc.fillColor('#0F172A')
      .fontSize(24)
      .text('DEXON INTERNATIONAL', { align: 'center', bold: true });
    doc.fontSize(10)
      .fillColor('#64748B')
      .text('B2B Kitchen Accessories & Architectural Hardware', { align: 'center' })
      .moveDown(1.5);

    doc.moveTo(50, 100).lineTo(550, 100).stroke('#CBD5E1');

    // Meta Details
    doc.fillColor('#0F172A')
      .fontSize(12)
      .text(`INQUIRY REPORT`, 50, 115, { bold: true })
      .fontSize(9)
      .fillColor('#475569')
      .text(`Reference: ID-${inquiry._id.toString().substring(0, 10).toUpperCase()}`)
      .text(`Submitted On: ${new Date(inquiry.createdAt).toLocaleString()}`)
      .text(`Inquiry Status: ${inquiry.status.toUpperCase()}`)
      .moveDown(1.5);

    // Customer & Company Columns
    const startY = 175;
    doc.fillColor('#0F172A')
      .fontSize(10)
      .text('Customer Information', 50, startY, { bold: true, underline: true })
      .fontSize(9)
      .fillColor('#334155')
      .text(`Name: ${inquiry.fullName}`)
      .text(`Company: ${inquiry.companyName}`)
      .text(`Email: ${inquiry.email}`)
      .text(`Phone: ${inquiry.phone}`)
      .text(`WhatsApp: ${inquiry.whatsappNumber}`)
      .text(`GST No: ${inquiry.gstNumber || 'N/A'}`);

    doc.fillColor('#0F172A')
      .fontSize(10)
      .text('Location Address', 320, startY, { bold: true, underline: true })
      .fontSize(9)
      .fillColor('#334155')
      .text(`City: ${inquiry.city}`)
      .text(`State: ${inquiry.state}`)
      .text(`Pincode: ${inquiry.pincode}`)
      .text(`Country: ${inquiry.country}`);

    // Products table header
    const tableTop = 290;
    doc.moveTo(50, tableTop - 5).lineTo(550, tableTop - 5).stroke('#0F172A');
    doc.fillColor('#0F172A')
      .fontSize(9)
      .text('S.No', 50, tableTop, { bold: true })
      .text('Product Name', 90, tableTop, { bold: true })
      .text('SKU Code', 380, tableTop, { bold: true })
      .text('Quantity Requested', 470, tableTop, { bold: true });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#94A3B8');

    // Table rows
    let currentY = tableTop + 20;
    inquiry.selectedProducts.forEach((item, index) => {
      const pName = item.product ? item.product.name : 'Deleted Product';
      const pSku = item.product ? item.product.sku : 'N/A';

      // Page break check (standard height)
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc.fillColor('#334155')
        .text(index + 1, 50, currentY)
        .text(pName, 90, currentY, { width: 280 })
        .text(pSku, 380, currentY)
        .text(item.quantity, 470, currentY, { align: 'center', width: 80 });

      currentY += 25;
    });

    doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).stroke('#CBD5E1');

    // Notes
    if (inquiry.message) {
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }
      doc.fillColor('#0F172A')
        .fontSize(9)
        .text('Customer Inquiry Message:', 50, currentY + 10, { bold: true })
        .fillColor('#475569')
        .fontSize(9)
        .text(inquiry.message, 50, currentY + 22, { width: 500 });
      currentY += 50;
    }

    if (inquiry.adminNotes) {
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }
      doc.fillColor('#0F172A')
        .fontSize(9)
        .text('Internal Admin Notes:', 50, currentY + 10, { bold: true })
        .fillColor('#475569')
        .fontSize(9)
        .text(inquiry.adminNotes, 50, currentY + 22, { width: 500 });
    }

    doc.end();
  } catch (error) {
    res.status(500).send(`Error generating PDF: ${error.message}`);
  }
};

// @desc    Export Inquiries to CSV
// @route   GET /api/inquiries/export/csv
// @access  Private (Admin)
const exportCSV = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).populate('selectedProducts.product', 'name sku');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=Inquiries_Export.csv');

    let csvContent = 'Inquiry ID,Customer Name,Company,Email,Phone,WhatsApp,GST Number,City,State,Pincode,Status,Message,Date,Products (Qty)\n';

    inquiries.forEach((item) => {
      const escapedName = `"${item.fullName.replace(/"/g, '""')}"`;
      const escapedCompany = `"${item.companyName.replace(/"/g, '""')}"`;
      const escapedEmail = `"${item.email.replace(/"/g, '""')}"`;
      const escapedCity = `"${item.city.replace(/"/g, '""')}"`;
      const escapedState = `"${item.state.replace(/"/g, '""')}"`;
      const escapedMessage = `"${item.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const dateStr = new Date(item.createdAt).toLocaleDateString();

      const productSummary = item.selectedProducts.map(p => {
        const pName = p.product ? p.product.name : 'Unknown Product';
        return `${pName} (${p.quantity})`;
      }).join('; ');
      const escapedProducts = `"${productSummary.replace(/"/g, '""')}"`;

      csvContent += `${item._id},${escapedName},${escapedCompany},${escapedEmail},${item.phone},${item.whatsappNumber},${item.gstNumber || 'N/A'},${escapedCity},${escapedState},${item.pincode},${item.status},${escapedMessage},${dateStr},${escapedProducts}\n`;
    });

    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  downloadPDF,
  exportCSV,
};
