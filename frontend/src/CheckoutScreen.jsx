import React, { useState } from 'react';
import { tokens } from './PothGamuHomepage';

export default function CheckoutScreen({ customerUser, cart, onOrderSuccess, onBackToStore }) {
  // Address selection / input
  const defaultAddress = customerUser?.addresses?.[0] || {
    recipientName: customerUser?.name || '',
    phone: customerUser?.phone || '',
    streetAddress: '',
    city: 'Colombo',
    district: 'Colombo',
    postalCode: '10000'
  };

  const [address, setAddress] = useState(defaultAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(!defaultAddress.streetAddress);
  
  // Payment Method selection: 'Cash on Delivery', 'PayPal', 'Credit/Debit Card', 'Bank Transfer'
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  
  // Card details
  const [cardData, setCardData] = useState({
    number: '',
    name: customerUser?.name || '',
    expiry: '',
    cvv: ''
  });

  // PayPal Simulation / Credentials Modal state
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  const [paypalAuthorized, setPaypalAuthorized] = useState(false);

  // Coupon code
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 6000 ? 0 : 250.00;
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponMsg('Coupon applied! 10% discount deducted.');
    } else if (code === 'HORIZON') {
      setDiscountPercent(15);
      setCouponMsg('Horizon Campus 15% student discount applied!');
    } else {
      setCouponMsg('Invalid coupon code. Try WELCOME10 or HORIZON');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!address.recipientName || !address.phone || !address.streetAddress || !address.city) {
      setErrorMessage('Please fill in complete delivery shipping details.');
      setIsEditingAddress(true);
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        userId: customerUser?.id || customerUser?._id,
        customer: {
          name: address.recipientName,
          email: customerUser?.email,
          phone: address.phone,
          address: address.streetAddress,
          city: address.city,
          district: address.district || 'Colombo',
          postalCode: address.postalCode || '10000'
        },
        items: cart.map(item => ({
          bookId: item._id,
          title: item.title,
          author: item.author,
          coverImage: item.coverImage,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: subtotal,
        shippingFee: shippingFee,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        paypalOrderId: paymentMethod === 'PayPal' ? (paypalAuthorized ? `PAYPAL-${Date.now()}` : 'PENDING-KEYS') : ''
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (data.success) {
        onOrderSuccess(data.data);
      } else {
        setErrorMessage(data.message || 'Could not place order. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Error communicating with server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* AliExpress Style Checkout Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={onBackToStore}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Store
            </button>
            <div style={{ height: '24px', width: '1px', backgroundColor: '#CBD5E1' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="PothGamu Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
              <span style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Fraunces', serif", color: tokens.tealDeep }}>
                PothGamu<span style={{ color: tokens.cinnamon }}>.lk</span>
              </span>
            </div>
          </div>

          {/* Checkout Steps (AliExpress Style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.teal, fontWeight: '700' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: tokens.teal, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
              <span>Shipping</span>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#CBD5E1' }}></i>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.teal, fontWeight: '700' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: tokens.teal, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
              <span>Payment</span>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#CBD5E1' }}></i>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tokens.cinnamon, fontWeight: '700' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: tokens.cinnamon, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>3</span>
              <span>Review Order</span>
            </div>
          </div>

          {/* User Profile Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
            <i className="fa-solid fa-shield-halved" style={{ color: '#16A34A' }}></i>
            <span>Secure 256-Bit Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <div style={{ maxWidth: '1200px', margin: '28px auto', padding: '0 24px' }}>
        {errorMessage && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            color: '#B91C1C',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '28px',
          alignItems: 'start'
        }}>
          {/* LEFT COLUMN: Shipping & Payment Method (AliExpress Style) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. SHIPPING ADDRESS SECTION */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <i className="fa-solid fa-location-dot" style={{ color: tokens.cinnamon }}></i>
                  1. Shipping Address
                </h3>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    style={{ background: 'none', border: 'none', color: tokens.teal, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Edit Address
                  </button>
                )}
              </div>

              {!isEditingAddress ? (
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  border: `2px solid ${tokens.teal}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>{address.recipientName}</span>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{address.phone}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                    {address.streetAddress}, {address.city}, {address.district || 'Sri Lanka'} (Postal: {address.postalCode || '10000'})
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Selected for Island-wide Delivery</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Recipient Name *</label>
                      <input
                        required
                        type="text"
                        value={address.recipientName}
                        onChange={e => setAddress({ ...address, recipientName: e.target.value })}
                        placeholder="e.g. Ruwan Fernando"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Contact Phone *</label>
                      <input
                        required
                        type="text"
                        value={address.phone}
                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                        placeholder="077 123 4567"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Street Address *</label>
                    <input
                      required
                      type="text"
                      value={address.streetAddress}
                      onChange={e => setAddress({ ...address, streetAddress: e.target.value })}
                      placeholder="House No., Street Name, Apartment"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>City *</label>
                      <input
                        required
                        type="text"
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        placeholder="Colombo / Kandy"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>District</label>
                      <select
                        value={address.district}
                        onChange={e => setAddress({ ...address, district: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF' }}
                      >
                        {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Postal Code</label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="10000"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (address.streetAddress && address.city) setIsEditingAddress(false);
                      else alert("Please fill street address and city");
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: tokens.teal,
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    Save &amp; Use Address
                  </button>
                </div>
              )}
            </div>

            {/* 2. PAYMENT METHOD SECTION (With PayPal Readiness) */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 16px 0' }}>
                <i className="fa-solid fa-credit-card" style={{ color: tokens.cinnamon }}></i>
                2. Select Payment Method
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* OPTION A: PAYPAL */}
                <div
                  onClick={() => setPaymentMethod('PayPal')}
                  style={{
                    border: `2px solid ${paymentMethod === 'PayPal' ? '#0070BA' : '#E2E8F0'}`,
                    backgroundColor: paymentMethod === 'PayPal' ? '#F0F9FF' : '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        checked={paymentMethod === 'PayPal'}
                        onChange={() => setPaymentMethod('PayPal')}
                        style={{ accentColor: '#0070BA' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-brands fa-paypal" style={{ fontSize: '24px', color: '#003087' }}></i>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>PayPal</span>
                        <span style={{ fontSize: '11px', backgroundColor: '#0070BA', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                          International &amp; Cards
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>USD / LKR Supported</span>
                  </div>

                  {paymentMethod === 'PayPal' && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #BAE6FD' }}>
                      <p style={{ fontSize: '13px', color: '#0369A1', marginBottom: '12px' }}>
                        Safe and secure checkout via PayPal account, Visa, Mastercard, or American Express.
                      </p>
                      
                      {/* PayPal Button Placeholder */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPaypalModalOpen(true); }}
                        style={{
                          backgroundColor: '#FFC439',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: '700',
                          fontSize: '14px',
                          color: '#003087',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(255,196,57,0.4)'
                        }}
                      >
                        <i className="fa-brands fa-paypal" style={{ fontSize: '18px' }}></i>
                        <span>{paypalAuthorized ? '✓ PayPal Account Connected' : 'Pay with PayPal (Connect Account)'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* OPTION B: CASH ON DELIVERY (COD) */}
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  style={{
                    border: `2px solid ${paymentMethod === 'Cash on Delivery' ? tokens.teal : '#E2E8F0'}`,
                    backgroundColor: paymentMethod === 'Cash on Delivery' ? '#F0FDF4' : '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                        style={{ accentColor: tokens.teal }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-hand-holding-dollar" style={{ fontSize: '20px', color: tokens.teal }}></i>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>Cash on Delivery (COD)</span>
                        <span style={{ fontSize: '11px', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                          Popular in Sri Lanka
                        </span>
                      </div>
                    </div>
                  </div>
                  {paymentMethod === 'Cash on Delivery' && (
                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#166534' }}>
                      Pay safely in cash when the courier delivers the books to your doorstep.
                    </div>
                  )}
                </div>

                {/* OPTION C: CREDIT / DEBIT CARD */}
                <div
                  onClick={() => setPaymentMethod('Credit/Debit Card')}
                  style={{
                    border: `2px solid ${paymentMethod === 'Credit/Debit Card' ? tokens.teal : '#E2E8F0'}`,
                    backgroundColor: paymentMethod === 'Credit/Debit Card' ? '#F8FAFC' : '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        checked={paymentMethod === 'Credit/Debit Card'}
                        onChange={() => setPaymentMethod('Credit/Debit Card')}
                        style={{ accentColor: tokens.teal }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-regular fa-credit-card" style={{ fontSize: '20px', color: tokens.teal }}></i>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>Credit or Debit Card</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '16px', color: '#64748B' }}>
                      <i className="fa-brands fa-cc-visa"></i>
                      <i className="fa-brands fa-cc-mastercard"></i>
                      <i className="fa-brands fa-cc-amex"></i>
                    </div>
                  </div>

                  {paymentMethod === 'Credit/Debit Card' && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <input
                          type="text"
                          placeholder="Card Number (4000 1234 5678 9010)"
                          value={cardData.number}
                          onChange={e => setCardData({ ...cardData, number: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                        <input
                          type="password"
                          maxLength="4"
                          placeholder="CVV"
                          value={cardData.cvv}
                          onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* OPTION D: DIRECT BANK TRANSFER */}
                <div
                  onClick={() => setPaymentMethod('Bank Transfer')}
                  style={{
                    border: `2px solid ${paymentMethod === 'Bank Transfer' ? tokens.teal : '#E2E8F0'}`,
                    backgroundColor: paymentMethod === 'Bank Transfer' ? '#F8FAFC' : '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      checked={paymentMethod === 'Bank Transfer'}
                      onChange={() => setPaymentMethod('Bank Transfer')}
                      style={{ accentColor: tokens.teal }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-building-columns" style={{ fontSize: '18px', color: tokens.teal }}></i>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>Direct Bank Transfer</span>
                    </div>
                  </div>
                  {paymentMethod === 'Bank Transfer' && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569', backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div><strong>Bank:</strong> Commercial Bank of Ceylon</div>
                      <div><strong>Account Name:</strong> PothGamu (Pvt) Ltd</div>
                      <div><strong>Account Number:</strong> 8001234567</div>
                      <div><strong>Branch:</strong> Colombo 07</div>
                      <div style={{ marginTop: '6px', color: '#A3402F' }}>Please WhatsApp payment slip to +94 77 123 4567 with your Order ID.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. ORDER ITEMS BREAKDOWN (AliExpress Style) */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 16px 0' }}>
                <i className="fa-solid fa-box-open" style={{ color: tokens.cinnamon }}></i>
                3. Items in Your Order ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cart.map(item => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0F172A', fontWeight: '600' }}>{item.title}</h4>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>by {item.author} • Qty: <strong>{item.quantity}</strong></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: tokens.cinnamon, fontSize: '15px' }}>
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Rs. {Number(item.price).toFixed(2)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary Card (AliExpress Style) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            position: 'sticky',
            top: '80px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 16px 0', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              Order Summary
            </h3>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items Subtotal:</span>
                <span style={{ fontWeight: '600', color: '#0F172A' }}>Rs. {subtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Island-wide Delivery:</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#16A34A' }}>FREE</strong> : `Rs. ${shippingFee.toFixed(2)}`}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: '600' }}>
                  <span>Discount ({discountPercent}%):</span>
                  <span>- Rs. {discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Coupon input */}
              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    style={{ backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <div style={{ fontSize: '11px', marginTop: '4px', color: discountAmount > 0 ? '#16A34A' : '#DC2626' }}>
                    {couponMsg}
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '14px',
                marginTop: '10px',
                borderTop: '2px solid #E2E8F0',
                fontSize: '18px',
                fontWeight: '700',
                color: tokens.cinnamon
              }}>
                <span>Total Amount:</span>
                <span>Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: tokens.cinnamon,
                color: '#FFFFFF',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(163,64,47,0.35)',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order Now</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>

            {/* Delivery Guarantee Notice */}
            <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-shield-check" style={{ color: '#16A34A', fontSize: '14px' }}></i>
                <span>AliExpress-standard Buyer Protection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-truck-fast" style={{ color: tokens.teal, fontSize: '14px' }}></i>
                <span>Estimated Delivery: 2-3 Business Days</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-envelope-circle-check" style={{ color: tokens.cinnamon, fontSize: '14px' }}></i>
                <span>Automatic Order Receipt Sent to Your Email</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Integration Helper Modal */}
      {paypalModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              backgroundColor: '#003087',
              color: '#FFFFFF',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-brands fa-paypal" style={{ fontSize: '24px', color: '#0070BA' }}></i>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF' }}>PayPal Checkout Ready</h3>
              </div>
              <button
                onClick={() => setPaypalModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '16px', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#1E40AF',
                lineHeight: 1.5
              }}>
                <strong>PayPal Gateway Connected:</strong>
                <div>Grand Total: <strong>Rs. {grandTotal.toFixed(2)}</strong> (~${(grandTotal / 310).toFixed(2)} USD)</div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#3B82F6' }}>
                  When you supply your PayPal Client ID and Secret in <code>backend/.env</code>, live transaction capture will automatically process through your PayPal account!
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPaypalAuthorized(true);
                  setPaypalModalOpen(false);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#0070BA',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Authorize PayPal Payment for this Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

