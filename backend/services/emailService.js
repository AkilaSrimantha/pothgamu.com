const nodemailer = require('nodemailer');

// Create email transporter
async function getTransporter() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass }
    });
  } else if (process.env.EMAIL_SERVICE === 'gmail' && user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  // Fallback to ethereal mock test account or log-only transporter
  return null;
}

/**
 * Send Order Confirmation Email to Customer and Store Owner
 */
async function sendOrderConfirmationEmail(order) {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || '"PothGamu.lk Orders" <orders@pothgamu.lk>';
    const storeOwnerEmail = process.env.STORE_OWNER_EMAIL || process.env.EMAIL_USER || 'admin@pothgamu.lk';

    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 8px; font-weight: 600; color: #0F172A;">${item.title}</td>
        <td style="padding: 12px 8px; text-align: center; color: #64748B;">x${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #A3402F;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF5EA; border: 1px solid #DED0B0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #154D4A; color: #FAF5EA; padding: 28px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; font-family: Georgia, serif; color: #DE9F2A;">PothGamu.lk</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Sri Lanka's Heritage of Books</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px 24px; background-color: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #DCFCE7; color: #166534; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
              ✓ Order Confirmed: ${order.orderId}
            </div>
            <h2 style="color: #0E3634; margin: 16px 0 6px 0; font-size: 22px;">Thank you for your order, ${order.customer.name}!</h2>
            <p style="color: #475569; font-size: 14px; margin: 0;">We have received your book order and our team is preparing it for island-wide delivery.</p>
          </div>

          <!-- Items Table -->
          <div style="margin: 24px 0;">
            <h3 style="color: #154D4A; font-size: 16px; border-bottom: 2px solid #DED0B0; padding-bottom: 8px; margin-bottom: 12px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="color: #64748B; text-align: left; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 8px;">Book</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Calculation -->
          <div style="background-color: #F8FAFC; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #64748B;">
              <span>Subtotal:</span>
              <span>Rs. ${Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #64748B;">
              <span>Island-wide Delivery:</span>
              <span>Rs. ${(order.shippingFee || 250).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: #A3402F; border-top: 1px solid #CBD5E1; padding-top: 8px; margin-top: 8px;">
              <span>Grand Total:</span>
              <span>Rs. ${(order.grandTotal || (order.totalAmount + (order.shippingFee || 250))).toFixed(2)}</span>
            </div>
          </div>

          <!-- Delivery Address & Payment Method -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px; color: #334155; margin-bottom: 24px;">
            <div style="background-color: #FAF5EA; padding: 14px; border-radius: 8px; border: 1px solid #DED0B0;">
              <strong style="color: #154D4A; display: block; margin-bottom: 6px;">Shipping Address:</strong>
              <div>${order.customer.name}</div>
              <div>${order.customer.address}</div>
              <div>${order.customer.city}, ${order.customer.district || 'Sri Lanka'}</div>
              <div>Phone: ${order.customer.phone}</div>
            </div>
            <div style="background-color: #FAF5EA; padding: 14px; border-radius: 8px; border: 1px solid #DED0B0;">
              <strong style="color: #154D4A; display: block; margin-bottom: 6px;">Payment Method:</strong>
              <div>${order.paymentMethod}</div>
              <div style="margin-top: 6px; color: #166534; font-weight: 600;">Status: ${order.paymentStatus || 'Pending Delivery'}</div>
            </div>
          </div>

          <div style="text-align: center; color: #64748B; font-size: 12px; line-height: 1.5;">
            <p>You can track your order status anytime using Order ID <strong>${order.orderId}</strong> on PothGamu.lk.</p>
            <p>Hotline: +94 11 234 5678 | Email: support@pothgamu.lk</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #0E3634; color: #FAF5EA; padding: 16px; text-align: center; font-size: 11px; opacity: 0.8;">
          &copy; 2026 PothGamu.lk Bookstore • Group 16 Horizon Campus
        </div>
      </div>
    `;

    if (transporter) {
      const mailOptions = {
        from: fromAddress,
        to: order.customer.email,
        bcc: storeOwnerEmail, // Send copy to store owner
        subject: `Order Confirmed: ${order.orderId} - PothGamu.lk`,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Order confirmation sent: ${info.messageId} to ${order.customer.email}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`\n======================================================`);
      console.log(`[EmailService - Simulation] (Configure SMTP in .env to send real email)`);
      console.log(`To Customer: ${order.customer.email}`);
      console.log(`BCC Store Owner: ${storeOwnerEmail}`);
      console.log(`Subject: Order Confirmed: ${order.orderId} - PothGamu.lk`);
      console.log(`Order ID: ${order.orderId} | Total: Rs. ${order.grandTotal || order.totalAmount}`);
      console.log(`======================================================\n`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error('[EmailService] Error dispatching email:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendOrderConfirmationEmail };

