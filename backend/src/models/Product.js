const mongoose = require('mongoose');
const slugify = require('slugify');

const productTranslationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  metaTitle: String,
  metaDescription: String,
  keywords: [String]
}, { _id: false });

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  values: [{
    value: {
      type: String,
      required: true,
      trim: true
    },
    priceAdjustment: {
      type: Number,
      default: 0
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    image: {
      public_id: String,
      url: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }]
}, { _id: false });

const dimensionsSchema = new mongoose.Schema({
  length: Number,
  width: Number,
  height: Number,
  weight: Number,
  unit: {
    type: String,
    enum: ['cm', 'inch', 'kg', 'lb'],
    default: 'cm'
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  // Multi-language content
  translations: {
    en: {
      type: productTranslationSchema,
      required: true
    },
    am: productTranslationSchema,
    ar: productTranslationSchema
  },
  
  // Basic Info
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [String],
  brand: {
    type: String,
    trim: true
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  currency: {
    type: String,
    enum: ['ETB', 'USD'],
    default: 'ETB'
  },
  taxable: {
    type: Boolean,
    default: true
  },
  taxRate: {
    type: Number,
    default: 0.15, // 15% VAT in Ethiopia
    min: 0,
    max: 1
  },
  
  // Inventory
  inventory: {
    trackQuantity: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    allowBackorder: {
      type: Boolean,
      default: false
    }
  },
  
  // Media
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String,
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  videos: [{
    url: String,
    thumbnail: String,
    title: String
  }],
  
  // Variants (for size, color, etc.)
  variants: [variantSchema],
  
  // Physical properties
  dimensions: dimensionsSchema,
  
  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'password'],
    default: 'public'
  },
  
  // Shipping
  shipping: {
    weight: Number,
    requiresShipping: {
      type: Boolean,
      default: true
    },
    shippingClass: String,
    freeShipping: {
      type: Boolean,
      default: false
    }
  },
  
  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    robots: {
      type: String,
      enum: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'],
      default: 'index,follow'
    }
  },
  
  // Analytics and engagement
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    wishlistCount: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  
  // Related products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upsellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Admin fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'analytics.averageRating': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ 'translations.en.name': 'text', 'translations.am.name': 'text', 'translations.ar.name': 'text' });
productSchema.index({ tags: 1 });
productSchema.index({ brand: 1 });

// Virtual for available stock
productSchema.virtual('availableStock').get(function() {
  return this.inventory.quantity - this.inventory.reservedQuantity;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  return this.availableStock <= this.inventory.lowStockThreshold;
});

// Virtual for out of stock status
productSchema.virtual('isOutOfStock').get(function() {
  return this.inventory.trackQuantity && this.availableStock <= 0 && !this.inventory.allowBackorder;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  if (this.isModified('translations.en.name') || this.isNew) {
    this.slug = slugify(this.translations.en.name, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  
  // Auto-generate SKU if not provided
  if (this.isNew && !this.sku) {
    this.sku = `PRD${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  }
  
  next();
});

// Instance methods
productSchema.methods.getTranslation = function(language = 'en') {
  return this.translations[language] || this.translations.en;
};

productSchema.methods.updateAnalytics = function(field, increment = 1) {
  this.analytics[field] += increment;
  return this.save();
};

productSchema.methods.reserveStock = function(quantity) {
  if (this.availableStock >= quantity) {
    this.inventory.reservedQuantity += quantity;
    return this.save();
  }
  throw new Error('Insufficient stock available');
};

productSchema.methods.releaseStock = function(quantity) {
  this.inventory.reservedQuantity = Math.max(0, this.inventory.reservedQuantity - quantity);
  return this.save();
};

productSchema.methods.fulfillOrder = function(quantity) {
  if (this.inventory.reservedQuantity >= quantity) {
    this.inventory.reservedQuantity -= quantity;
    this.inventory.quantity -= quantity;
    this.analytics.purchases += quantity;
    return this.save();
  }
  throw new Error('Cannot fulfill order - insufficient reserved stock');
};

// Static methods
productSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    isFeatured: true, 
    isActive: true, 
    status: 'active' 
  })
  .limit(limit)
  .populate('category')
  .sort({ createdAt: -1 });
};

productSchema.statics.searchProducts = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    brand,
    tags,
    sortBy = 'createdAt',
    sortOrder = -1,
    page = 1,
    limit = 20,
    language = 'en'
  } = options;
  
  let filter = {
    isActive: true,
    status: 'active'
  };
  
  if (query) {
    filter.$text = { $search: query };
  }
  
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = minPrice;
    if (maxPrice) filter.price.$lte = maxPrice;
  }
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (tags && tags.length > 0) filter.tags = { $in: tags };
  
  return this.find(filter)
    .populate('category')
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Product', productSchema);