const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    size: { type: String, required: true },
    color: {
      name: String,
      code: String
    },
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total amount
cartSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Update lastModified on save
cartSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
