const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // Order Identification
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    purchaseOrderNumber: {
      type: String,
      trim: true,
    },
    
    // Vendor Information
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Vendor is required'],
    },
    
    // Order Details
    items: [
      {
        productName: {
          type: String,
          required: true,
        },
        description: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unit: {
          type: String,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        specifications: String,
        category: String,
      },
    ],
    
    // Financial Information
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 16, // VAT in Kenya
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'KES',
    },
    
    // Order Status
    status: {
      type: String,
      enum: [
        'Draft',
        'Pending Approval',
        'Approved',
        'Rejected',
        'Sent to Vendor',
        'Acknowledged',
        'In Progress',
        'Shipped',
        'Delivered',
        'Completed',
        'Cancelled',
      ],
      default: 'Draft',
    },
    
    // Dates
    orderDate: {
      type: Date,
      default: Date.now,
    },
    requiredDate: {
      type: Date,
      required: true,
    },
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    completionDate: Date,
    
    // Delivery Information
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'Kenya' },
      postalCode: String,
      contactPerson: String,
      contactPhone: String,
    },
    shippingMethod: {
      type: String,
      enum: ['Standard', 'Express', 'Pickup', 'Custom'],
    },
    trackingNumber: String,
    
    // Approval Workflow
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: Date,
    rejectionReason: String,
    
    // Payment Information
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
      default: 'Pending',
    },
    paymentTerms: {
      type: String,
      enum: ['Net 30', 'Net 60', 'Net 90', 'Due on Receipt', 'Custom'],
      default: 'Net 30',
    },
    paymentDueDate: Date,
    paymentDate: Date,
    paymentMethod: String,
    paymentReference: String,
    
    // Quality & Performance
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    
    // Documents
    documents: [
      {
        name: String,
        type: {
          type: String,
          enum: [
            'Purchase Order',
            'Invoice',
            'Delivery Note',
            'Quality Certificate',
            'Payment Receipt',
            'Other',
          ],
        },
        url: String,
        uploadDate: { type: Date, default: Date.now },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    
    // Communication
    notes: String,
    internalNotes: String,
    communications: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'communications.fromModel',
        },
        fromModel: {
          type: String,
          enum: ['User', 'Vendor'],
        },
        message: String,
        timestamp: { type: Date, default: Date.now },
        attachments: [String],
      },
    ],
    
    // AI Predictions
    aiPredictions: {
      estimatedDeliveryDate: Date,
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      delayProbability: {
        type: Number,
        min: 0,
        max: 100,
      },
      qualityPrediction: {
        type: Number,
        min: 1,
        max: 5,
      },
      recommendations: [String],
      lastAnalyzed: Date,
    },
    
    // Metadata
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    department: String,
    project: String,
    costCenter: String,
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ vendor: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ requiredDate: 1 });
orderSchema.index({ requestedBy: 1 });

// Virtual for days until delivery
orderSchema.virtual('daysUntilDelivery').get(function () {
  if (!this.requiredDate) return null;
  const today = new Date();
  const diffTime = this.requiredDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is overdue
orderSchema.virtual('isOverdue').get(function () {
  if (!this.requiredDate || this.status === 'Completed' || this.status === 'Cancelled') {
    return false;
  }
  return new Date() > this.requiredDate;
});

// Virtual for delivery performance
orderSchema.virtual('deliveryPerformance').get(function () {
  if (!this.actualDeliveryDate || !this.expectedDeliveryDate) return null;
  const diffTime = this.actualDeliveryDate - this.expectedDeliveryDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays; // Negative means early, positive means late
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `PO-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function (next) {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
  
  // Calculate tax amount
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.taxAmount + this.shippingCost - this.discount;
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

// Made with Bob
