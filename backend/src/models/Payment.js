const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  method: {
    type: String,
    enum: ['chapa', 'cod', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // Chapa specific fields
  chapa: {
    checkoutUrl: String,
    reference: String,
    transactionId: String,
    webhookData: mongoose.Schema.Types.Mixed
  },
  // Bank transfer specific fields
  bankTransfer: {
    bankName: String,
    accountNumber: String,
    referenceNumber: String,
    depositSlip: {
      url: String,
      publicId: String
    }
  },
  // Refund information
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundTransactionId: String
  },
  metadata: mongoose.Schema.Types.Mixed,
  notes: String,
  processedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
