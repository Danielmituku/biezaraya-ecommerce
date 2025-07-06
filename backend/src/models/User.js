const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: { 
    type: String, 
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'Ethiopia',
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    minlength: [2, 'Last name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+251|0)[7-9]\d{8}$/, 'Please enter a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    validate: {
      validator: function(password) {
        // Password must contain at least one uppercase letter, one lowercase letter, and one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  // Profile Information
  avatar: {
    public_id: String,
    url: String
  },

  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(date) {
        return date < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefer_not_to_say'],
    default: 'prefer_not_to_say',
    lowercase: true
  },
  avatar: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    }
  },
  
  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user',
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  // Addresses
  addresses: [addressSchema],
  // Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'am', 'ar'],
      default: 'en',
      lowercase: true
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD'],
      default: 'ETB',
      uppercase: true
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },

  // Shopping Data
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
    // Email verification
    emailVerified: {
    type: Boolean,
    default: false
  },
   emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  // Phone verification
  phoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationToken: {
    type: String,
    select: false
  },
  phoneVerificationExpires: {
    type: Date,
    select: false
  },
  // Password reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },

   // Security
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  lastLogin: Date,
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedAt: Date,
  deactivationReason: String,


  recentlyViewed: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Authentication & Security
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  phoneVerificationToken: String,
  phoneVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  // Analytics
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  registrationSource: {
    type: String,
    enum: ['web', 'mobile', 'social', 'admin'],
    default: 'web'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
     transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.phoneVerificationToken;
      delete ret.phoneVerificationExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      delete ret.passwordChangedAt;
      return ret;
    }
   },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'addresses.city': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });


// ===== VIRTUALS =====
// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for default address
userSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
});

// ===== INDEXES =====
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// ===== MIDDLEWARE =====
// Pre-save middleware  to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

   // Set password changed timestamp
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure JWT is created after password change
  }
  
  next();
});

// Pre-save middleware to ensure only one default address
userSchema.pre('save', function(next) {
  if (this.isModified('addresses')) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    
    // If multiple default addresses, keep only the last one
    if (defaultAddresses.length > 1) {
      this.addresses.forEach((addr, index) => {
        if (index !== this.addresses.length - 1) {
          addr.isDefault = false;
        }
      });
    }
    
    // If no default address and addresses exist, make first one default
    if (defaultAddresses.length === 0 && this.addresses.length > 0) {
      this.addresses[0].isDefault = true;
    }
  }
  
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Pre-save middleware to update lastActiveAt
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.lastActiveAt = new Date();
  }
  next();
});


// ===== METHODS =====
// Method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verifyToken;
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 
        lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 
        loginAttempts: 1, 
        lockUntil: 1 
    }
  });
};

// Method to add to wishlist
userSchema.methods.addToWishlist = function(productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove from wishlist
userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(id => !id.equals(productId));
  return this.save();
};

// Method to add address
userSchema.methods.addAddress = function(addressData) {
  // If this is the first address or marked as default, make it default
  if (this.addresses.length === 0 || addressData.isDefault) {
    // Remove default from other addresses
    this.addresses.forEach(addr => addr.isDefault = false);
    addressData.isDefault = true;
  }
  
  this.addresses.push(addressData);
  return this.save();
};

// Method to update address
userSchema.methods.updateAddress = function(addressId, updateData) {
  const address = this.addresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }
  
  // If setting as default, remove default from others
  if (updateData.isDefault) {
    this.addresses.forEach(addr => {
      if (!addr._id.equals(addressId)) {
        addr.isDefault = false;
      }
    });
  }
  
  Object.assign(address, updateData);
  return this.save();
};

// Method to remove address
userSchema.methods.removeAddress = function(addressId) {
  const address = this.addresses.id(addressId);
  if (!address) {
    throw new Error('Address not found');
  }
  
  const wasDefault = address.isDefault;
  address.remove();
  
  // If removed address was default, make first remaining address default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
  }
  
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);