const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Customer & Admin Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, streetAddress, city, district, postalCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already in use
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const initialAddress = (streetAddress && city) ? [{
      recipientName: name,
      phone: phone || '',
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      district: district || 'Colombo',
      postalCode: postalCode || '10000',
      isDefault: true
    }] : [];

    const newUser = new User({
      name: name.trim(),
      username: cleanEmail.split('@')[0],
      email: cleanEmail,
      password: password,
      phone: phone || '',
      role: 'customer',
      addresses: initialAddress
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        addresses: savedUser.addresses
      },
      token: `customer-token-${Date.now()}`
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Universal Login (Customer or Admin)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and Password are required.'
      });
    }

    const cleanInput = username.trim().toLowerCase();

    // 1. Check in MongoDB User collection
    let user = await User.findOne({
      $or: [{ email: cleanInput }, { username: cleanInput }]
    });

    if (user) {
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password. Please verify your credentials.'
        });
      }

      return res.json({
        success: true,
        message: `${user.role === 'admin' ? 'Admin' : 'Customer'} login successful`,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          addresses: user.addresses || []
        },
        token: `${user.role}-token-${Date.now()}`
      });
    }

    // 2. Default Admin Credentials Fallback
    const isDefaultAdmin =
      (cleanInput === 'admin' || cleanInput === 'admin@pothgamu.lk') &&
      password === 'admin123';

    if (isDefaultAdmin) {
      return res.json({
        success: true,
        message: 'Admin login successful',
        user: {
          name: 'PothGamu Administrator',
          username: 'admin',
          email: 'admin@pothgamu.lk',
          role: 'admin'
        },
        token: `admin-token-${Date.now()}`
      });
    }

    return res.status(401).json({
      success: false,
      message: 'No account found with these credentials. Please check your email or create an account.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update or Add Address
router.post('/address/:userId', async (req, res) => {
  try {
    const { recipientName, phone, streetAddress, city, district, postalCode } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.addresses.push({
      recipientName,
      phone,
      streetAddress,
      city,
      district: district || 'Colombo',
      postalCode: postalCode || '10000',
      isDefault: user.addresses.length === 0
    });

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
