const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Book = require('../models/Book');
const { sendOrderConfirmationEmail } = require('../services/emailService');

// GET all orders with status filter (for admin)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET customer orders (AliExpress My Orders screen)
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single order by ID or orderId (e.g. ORD-8918)
router.get('/:idOrCode', async (req, res) => {
  try {
    const param = req.params.idOrCode;
    let order = null;
    if (param.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: param.toUpperCase() });
    } else {
      order = await Order.findById(param);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new order (with user association, PayPal & email dispatch)
router.post('/', async (req, res) => {
  try {
    const { userId, customer, items, totalAmount, paymentMethod, paypalOrderId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, email, phone, and delivery address are required.' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randomSuffix}`;
    const shippingFee = 250.00;
    const grandTotal = Number(totalAmount) + shippingFee;

    const isPaid = paymentMethod === 'PayPal' || paymentMethod === 'Credit/Debit Card';

    const newOrder = new Order({
      orderId,
      user: userId || undefined,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : 'Colombo',
        district: customer.district ? customer.district.trim() : 'Colombo',
        postalCode: customer.postalCode || '10000'
      },
      items,
      totalAmount: Number(totalAmount),
      shippingFee,
      grandTotal,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: isPaid ? 'Paid' : 'Unpaid',
      paypalOrderId: paypalOrderId || '',
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();

    // Deduct stock for each book
    for (const item of items) {
      if (item.bookId) {
        await Book.findByIdAndUpdate(item.bookId, {
          $inc: { quantityInStock: -Number(item.quantity || 1) }
        });
      }
    }

    // Trigger email notification to customer and store owner (async)
    sendOrderConfirmationEmail(savedOrder)
      .then(emailResult => {
        if (emailResult.success) {
          Order.findByIdAndUpdate(savedOrder._id, { emailNotificationSent: true }).exec();
        }
      })
      .catch(err => console.error('Email dispatch error:', err));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Confirmation email has been sent.',
      data: savedOrder
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST capture / complete PayPal payment
router.post('/:id/paypal-capture', async (req, res) => {
  try {
    const { paypalOrderId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentMethod: 'PayPal',
        paymentStatus: 'Paid',
        paypalOrderId: paypalOrderId || `PAYPAL-${Date.now()}`
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'PayPal payment verified', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
