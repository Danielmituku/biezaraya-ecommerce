const mongoose = require('mongoose');
const slugify = require('slugify');

const categoryTranslationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  metaTitle: String,
  metaDescription: String
}, { _id: false });

const categorySchema = new mongoose.Schema({
  // Multi-language support
  translations: {
    en: {
      type: categoryTranslationSchema,
      required: true
    },
    am: categoryTranslationSchema,
    ar: categoryTranslationSchema
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  path: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  // Display
  image: {
    public_id: String,
    url: String
  },
  icon: String, // For category icons
  color: {
    type: String,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  
  // Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // SEO
  seoSettings: {
    robots: {
      type: String,
      enum: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'],
      default: 'index,follow'
    },
    canonicalUrl: String
  },
  
  // Analytics
  productCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ 'translations.en.name': 'text', 'translations.am.name': 'text', 'translations.ar.name': 'text' });

// Virtual for children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware
categorySchema.pre('save', function(next) {
  if (this.isModified('translations.en.name') || this.isNew) {
    this.slug = slugify(this.translations.en.name, { lower: true, strict: true });
  }
  next();
});

// Methods
categorySchema.methods.getTranslation = function(language = 'en') {
  return this.translations[language] || this.translations.en;
};

categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: this._id, 
    isActive: true 
  });
  this.productCount = count;
  return this.save();
};

// Static methods
categorySchema.statics.buildHierarchy = async function() {
  const categories = await this.find({ isActive: true })
    .sort({ level: 1, sortOrder: 1 })
    .populate('parent');
    
  const categoryMap = {};
  const rootCategories = [];
  
  categories.forEach(cat => {
    categoryMap[cat._id] = { ...cat.toObject(), children: [] };
  });
  
  categories.forEach(cat => {
    if (cat.parent) {
      if (categoryMap[cat.parent._id]) {
        categoryMap[cat.parent._id].children.push(categoryMap[cat._id]);
      }
    } else {
      rootCategories.push(categoryMap[cat._id]);
    }
  });
  
  return rootCategories;
};

module.exports = mongoose.model('Category', categorySchema);
