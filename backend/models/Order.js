const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String
  },
  coverImage: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      default: 'Colombo'
    },
    postalCode: {
      type: String,
      default: '10000'
    }
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 250.00
  },
  grandTotal: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Bank Transfer', 'Credit/Debit Card', 'PayPal'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Pending Verification', 'Refunded'],
    default: 'Unpaid'
  },
  paypalOrderId: {
    type: String,
    default: ''
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
