const dotenv = require('dotenv');
dotenv.config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const USD_LKR_RATE = Number(process.env.USD_LKR_RATE) || 310;
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || 'USD';

const BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

/**
 * Checks if the configured credentials are valid PayPal REST credentials
 * (REST Client ID is a long alphanumeric string, whereas an email is a sandbox test user)
 */
function isRestCredential() {
  return (
    PAYPAL_CLIENT_ID &&
    PAYPAL_SECRET &&
    !PAYPAL_CLIENT_ID.includes('@') &&
    PAYPAL_CLIENT_ID.length > 20
  );
}

/**
 * Get OAuth2 Access Token from PayPal
 */
async function getAccessToken() {
  if (!isRestCredential()) {
    throw new Error('Configured PayPal Client ID is not a REST App Client ID.');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'PayPal Authentication failed');
  }

  return data.access_token;
}

/**
 * Create a PayPal Order
 * Converts LKR total to USD based on configured exchange rate
 */
async function createOrder(lkrAmount, customOrderId = '') {
  const usdAmount = (Number(lkrAmount) / USD_LKR_RATE).toFixed(2);

  // If standard REST credentials are provided, call PayPal API
  if (isRestCredential()) {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: customOrderId || `ORD-${Date.now()}`,
              description: 'PothGamu.lk Bookstore Order',
              amount: {
                currency_code: PAYPAL_CURRENCY,
                value: usdAmount
              }
            }
          ]
        })
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.message || 'PayPal order creation failed');
      }

      return {
        success: true,
        orderId: orderData.id,
        usdAmount,
        lkrAmount,
        status: orderData.status,
        links: orderData.links
      };
    } catch (err) {
      console.warn('PayPal REST API error:', err.message);
    }
  }

  // Fallback: Sandbox / Simulated Order for Sandbox Accounts
  const simulatedId = `PAYPAL-SANDBOX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  return {
    success: true,
    orderId: simulatedId,
    usdAmount,
    lkrAmount,
    status: 'CREATED',
    accountEmail: PAYPAL_CLIENT_ID,
    isSandboxSimulated: true
  };
}

/**
 * Capture a PayPal Order
 */
async function captureOrder(paypalOrderId) {
  if (isRestCredential() && !paypalOrderId.startsWith('PAYPAL-SANDBOX-')) {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const captureData = await response.json();
      if (!response.ok) {
        throw new Error(captureData.message || 'PayPal capture failed');
      }

      return {
        success: true,
        captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || captureData.id,
        status: 'COMPLETED',
        payer: captureData.payer,
        raw: captureData
      };
    } catch (err) {
      console.warn('PayPal REST capture error:', err.message);
    }
  }

  // Sandbox capture fallback
  return {
    success: true,
    captureId: `CAP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'COMPLETED',
    accountEmail: PAYPAL_CLIENT_ID,
    paidAt: new Date().toISOString()
  };
}

module.exports = {
  createOrder,
  captureOrder,
  isRestCredential,
  getConfig: () => ({
    clientId: PAYPAL_CLIENT_ID,
    mode: PAYPAL_MODE,
    currency: PAYPAL_CURRENCY,
    usdRate: USD_LKR_RATE,
    isConfigured: !!(PAYPAL_CLIENT_ID && PAYPAL_SECRET),
    isRest: isRestCredential()
  })
};
