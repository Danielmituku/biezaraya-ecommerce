const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 
      'create_user', 'update_user', 'delete_user', 'update_order',
      'create_product', 'update_product', 'delete_product',
      'create_category', 'update_category', 'delete_category',
      'view_analytics', 'export_data', 'system_config',
      'update_order_status', 'cancel_order', 'refund_order',
      'create_user', 'update_user', 'deactivate_user',
      'approve_review', 'reject_review',
      'update_settings', 'backup_database'
    ]
  },
  description: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['User', 'Product', 'Order', 'Category']
  },
  resource: {
      type: String, // Type of resource (product, order, user, etc.)
      required: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId, // ID of the affected resource
      required: true
    },
details: mongoose.Schema.Types.Mixed, // Additional details about the action
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Admin-specific fields
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: {
    type: String,
    enum: ['management', 'sales', 'inventory', 'customer_service', 'marketing'],
    required: true
  },
  permissions: [{
    module: {
      type: String,
      enum: ['users', 'products', 'orders', 'analytics', 'settings', 'content'],
      required: true
    },
    actions: [{
      type: String,
      enum: [
        'manage_products', 'manage_categories', 'manage_orders',
        'manage_users', 'manage_reviews', 'manage_payments',
        'view_analytics', 'manage_settings', 'manage_admins'
      ]
  }],
   
  // Activity tracking
  activities: [adminActivitySchema],
  lastActivity: Date,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  hiredDate: Date,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
adminSchema.index({ user: 1 });
adminSchema.index({ department: 1 });
adminSchema.index({ 'activities.timestamp': -1 });

// Methods
adminSchema.methods.logActivity = function(action, description, targetId = null, targetModel = null, req = null) {
  const activity = {
    action,
    description,
    targetId,
    targetModel,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get('User-Agent')
  };
  
  this.activities.unshift(activity);
  
  // Keep only last 100 activities
  if (this.activities.length > 100) {
    this.activities = this.activities.slice(0, 100);
  }
  
  this.lastActivity = new Date();
  return this.save();
};

adminSchema.methods.hasPermission = function(module, action) {
  const permission = this.permissions.find(p => p.module === module);
  return permission && permission.actions.includes(action);
};

// Create models
const AdminLog = mongoose.model('AdminLog', adminLogSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { Admin, AdminLog };