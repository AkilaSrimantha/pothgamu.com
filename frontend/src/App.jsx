import React, { useState, useEffect } from 'react';
import PothGamuHomepage from './PothGamuHomepage';
import AdminDashboard from './AdminDashboard';
import AdminLoginModal from './AdminLoginModal';
import CustomerAuthModal from './CustomerAuthModal';
import CheckoutScreen from './CheckoutScreen';
import CustomerOrdersScreen from './CustomerOrdersScreen';

export default function App() {
  // Current Active Screen: 'store', 'checkout', 'my-orders', 'admin'
  const [currentScreen, setCurrentScreen] = useState('store');

  // Admin User State
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pothgamu_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Customer User State (AliExpress style)
  const [showCustomerAuthModal, setShowCustomerAuthModal] = useState(false);
  const [authRedirectAction, setAuthRedirectAction] = useState(null); // 'checkout' or null
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pothgamu_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Shopping Cart & Wishlist
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Order Success Modal State
  const [recentCompletedOrder, setRecentCompletedOrder] = useState(null);

  // --- Handlers ---
  const handleAdminModeClick = () => {
    if (adminUser) {
      setCurrentScreen('admin');
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
    setCurrentScreen('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('pothgamu_admin_token');
    localStorage.removeItem('pothgamu_admin_user');
    setAdminUser(null);
    setCurrentScreen('store');
  };

  const handleCustomerAuthSuccess = (user) => {
    setCustomerUser(user);
    setShowCustomerAuthModal(false);
    if (authRedirectAction === 'checkout') {
      setCurrentScreen('checkout');
      setAuthRedirectAction(null);
    }
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('pothgamu_customer_token');
    localStorage.removeItem('pothgamu_customer_user');
    setCustomerUser(null);
    if (currentScreen === 'checkout' || currentScreen === 'my-orders') {
      setCurrentScreen('store');
    }
  };

  // Called from Cart Drawer "Proceed to Checkout"
  const handleProceedToCheckout = () => {
    if (customerUser) {
      setCurrentScreen('checkout');
    } else {
      setAuthRedirectAction('checkout');
      setShowCustomerAuthModal(true);
    }
  };

  const handleOrderCompleted = (orderData) => {
    setCart([]);
    setRecentCompletedOrder(orderData);
  };

  return (
    <div className="app-container">
      {/* 1. ADMIN DASHBOARD SCREEN */}
      {currentScreen === 'admin' && adminUser && (
        <AdminDashboard
          adminUser={adminUser}
          onSwitchToStore={() => setCurrentScreen('store')}
          onLogout={handleAdminLogout}
        />
      )}

      {/* 2. DEDICATED ALIEXPRESS STYLE CHECKOUT SCREEN */}
      {currentScreen === 'checkout' && customerUser && (
        <CheckoutScreen
          customerUser={customerUser}
          cart={cart}
          onOrderSuccess={handleOrderCompleted}
          onBackToStore={() => setCurrentScreen('store')}
        />
      )}

      {/* 3. DEDICATED CUSTOMER ORDERS SCREEN ("My Orders") */}
      {currentScreen === 'my-orders' && customerUser && (
        <CustomerOrdersScreen
          customerUser={customerUser}
          onBackToStore={() => setCurrentScreen('store')}
        />
      )}

      {/* 4. MAIN CUSTOMER STOREFRONT */}
      {currentScreen === 'store' && (
        <PothGamuHomepage
          adminUser={adminUser}
          customerUser={customerUser}
          onSwitchToAdmin={handleAdminModeClick}
          onOpenCustomerAuth={() => { setAuthRedirectAction(null); setShowCustomerAuthModal(true); }}
          onOpenMyOrders={() => {
            if (customerUser) setCurrentScreen('my-orders');
            else { setAuthRedirectAction(null); setShowCustomerAuthModal(true); }
          }}
          onCustomerLogout={handleCustomerLogout}
          onAdminLogout={handleAdminLogout}
          onProceedToCheckout={handleProceedToCheckout}
          cart={cart}
          setCart={setCart}
          wishlist={wishlist}
          setWishlist={setWishlist}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* AliExpress Style Customer Sign In / Register Modal */}
      <CustomerAuthModal
        isOpen={showCustomerAuthModal}
        onClose={() => { setShowCustomerAuthModal(false); setAuthRedirectAction(null); }}
        onAuthSuccess={handleCustomerAuthSuccess}
        redirectMessage={authRedirectAction === 'checkout' ? 'Sign in or create an account to proceed with your order checkout' : null}
      />

      {/* Order Completed Full Modal (Email Dispatched & PayPal notice) */}
      {recentCompletedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{ backgroundColor: '#154D4A', color: '#FAF5EA', padding: '32px 24px 24px 24px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '32px'
              }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', fontFamily: "'Fraunces', serif", color: '#DE9F2A' }}>
                Order Placed Successfully!
              </h2>
              <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
                Order Tracking ID: <strong>{recentCompletedOrder.orderId}</strong>
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Email dispatch banner */}
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '20px',
                textAlign: 'left',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <i className="fa-solid fa-envelope-circle-check" style={{ color: '#16A34A', fontSize: '22px', marginTop: '2px' }}></i>
                <div style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
                  <strong>Confirmation Email Dispatched:</strong>
                  <div>A copy has been dispatched to <strong>{recentCompletedOrder.customer?.email}</strong> and store management.</div>
                </div>
              </div>

              {/* Order breakdown */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '13px',
                color: '#334155',
                marginBottom: '24px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Customer:</span>
                  <strong>{recentCompletedOrder.customer?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment Method:</span>
                  <strong>{recentCompletedOrder.paymentMethod}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Address:</span>
                  <span>{recentCompletedOrder.customer?.city}, {recentCompletedOrder.customer?.district || 'Sri Lanka'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '4px', fontSize: '15px', color: '#A3402F' }}>
                  <span>Total Paid:</span>
                  <strong>Rs. {(recentCompletedOrder.grandTotal || recentCompletedOrder.totalAmount).toFixed(2)}</strong>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setRecentCompletedOrder(null); setCurrentScreen('my-orders'); }}
                  style={{
                    flex: 1,
                    backgroundColor: '#154D4A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-box" style={{ marginRight: '6px' }}></i>
                  View My Orders
                </button>
                <button
                  onClick={() => { setRecentCompletedOrder(null); setCurrentScreen('store'); }}
                  style={{
                    flex: 1,
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
