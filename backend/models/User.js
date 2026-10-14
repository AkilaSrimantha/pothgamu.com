const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, default: 'Colombo' },
  postalCode: { type: String, default: '10000' },
  isDefault: { type: Boolean, default: true }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  username: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'manager'],
    default: 'customer'
  },
  phone: {
    type: String,
    default: ''
  },
  addresses: [addressSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
