const express = require('express');
const router = express.Router();
const paypalService = require('../services/paypalService');
const Order = require('../models/Order');
const LocalDB = require('../localDb');

// GET PayPal configuration for client
router.get('/config', (req, res) => {
  const config = paypalService.getConfig();
  res.json({
    success: true,
    data: {
      mode: config.mode,
      currency: config.currency,
      usdRate: config.usdRate,
      isConfigured: config.isConfigured,
      isRest: config.isRest,
      businessEmail: config.clientId.includes('@') ? config.clientId : ''
    }
  });
});

// POST create PayPal order
router.post('/create-order', async (req, res) => {
  try {
    const { lkrAmount, orderId } = req.body;
    if (!lkrAmount || Number(lkrAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const orderData = await paypalService.createOrder(Number(lkrAmount), orderId);
    res.json({ success: true, data: orderData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST capture PayPal order
router.post('/capture-order', async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    if (!paypalOrderId) {
      return res.status(400).json({ success: false, message: 'paypalOrderId is required' });
    }

    const captureResult = await paypalService.captureOrder(paypalOrderId);

    // If an existing order was supplied, update its payment status to Paid
    if (orderId) {
      try {
        let updatedOrder = await Order.findOneAndUpdate(
          { $or: [{ _id: orderId }, { orderId: orderId }] },
          {
            paymentStatus: 'Paid',
            paypalOrderId: paypalOrderId,
            paypalCaptureId: captureResult.captureId || '',
            paymentMethod: 'PayPal'
          },
          { new: true }
        );

        if (!updatedOrder) {
          // Check LocalDB
          updatedOrder = LocalDB.orders.findByIdAndUpdate(orderId, {
            paymentStatus: 'Paid',
            paypalOrderId: paypalOrderId,
            paypalCaptureId: captureResult.captureId || '',
            paymentMethod: 'PayPal'
          });
        }
      } catch (dbErr) {
        console.warn('Could not update order payment status:', dbErr.message);
      }
    }

    res.json({
      success: true,
      message: 'PayPal payment captured successfully! Payment status marked as Paid.',
      data: captureResult
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
