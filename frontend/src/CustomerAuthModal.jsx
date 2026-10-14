import React, { useState } from 'react';
import { tokens } from './PothGamuHomepage';

export default function CustomerAuthModal({ isOpen, onClose, onAuthSuccess, redirectMessage }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    streetAddress: '',
    city: 'Colombo',
    district: 'Colombo'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = activeTab === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = activeTab === 'register' ? {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        streetAddress: formData.streetAddress,
        city: formData.city,
        district: formData.district
      } : {
        username: formData.email,
        password: formData.password
      };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('pothgamu_customer_token', data.token);
        localStorage.setItem('pothgamu_customer_user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.message || 'Authentication failed. Please verify your details.');
      }
    } catch (err) {
      setErrorMessage('Server error. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCustomer = () => {
    if (activeTab === 'login') {
      setFormData(prev => ({ ...prev, email: 'customer@gmail.com', password: 'password123' }));
    } else {
      setFormData({
        name: 'Kasun Wickramasinghe',
        email: `kasun.${Date.now().toString().slice(-4)}@gmail.com`,
        password: 'password123',
        confirmPassword: 'password123',
        phone: '077 456 7890',
        streetAddress: '15/3, Temple Road',
        city: 'Kandy',
        district: 'Kandy'
      });
    }
    setErrorMessage('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      zIndex: 350,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '480px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#F1F5F9',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            zIndex: 10
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Modal Top Header with AliExpress style badge */}
        <div style={{
          backgroundColor: tokens.teal,
          color: tokens.paper,
          padding: '28px 24px 20px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}>
            <img src="/logo.png" alt="PothGamu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 6px 0', fontFamily: "'Fraunces', serif" }}>
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Customer Account'}
          </h2>
          <p style={{ fontSize: '13px', opacity: 0.88, margin: 0 }}>
            {redirectMessage || 'Sign in or register to complete your order and track delivery'}
          </p>
        </div>

        {/* Tabs: Sign In vs Register (AliExpress Style) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            style={{
              padding: '14px',
              border: 'none',
              backgroundColor: activeTab === 'login' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'login' ? tokens.cinnamon : '#64748B',
              fontWeight: '700',
              fontSize: '14px',
              borderBottom: activeTab === 'login' ? `3px solid ${tokens.cinnamon}` : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            style={{
              padding: '14px',
              border: 'none',
              backgroundColor: activeTab === 'register' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'register' ? tokens.cinnamon : '#64748B',
              fontWeight: '700',
              fontSize: '14px',
              borderBottom: activeTab === 'register' ? `3px solid ${tokens.cinnamon}` : 'none',
              cursor: 'pointer'
            }}
          >
            New Customer? Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMessage && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Full Name for Registration */}
            {activeTab === 'register' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ruwan Fernando"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Email Address *
              </label>
              <input
                required
                type="email"
                placeholder="yourname@gmail.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            {/* Phone Number for Registration */}
            {activeTab === 'register' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Phone Number (For Delivery Confirmation) *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="077 123 4567"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            )}

            {/* Delivery Address for Registration */}
            {activeTab === 'register' && (
              <>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Street Address (Delivery Destination) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="No. 45, Temple Road"
                    value={formData.streetAddress}
                    onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      City *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Colombo / Kandy"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      District
                    </label>
                    <select
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF' }}
                    >
                      {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Kurunegala', 'Anuradhapura', 'Badulla', 'Ratnapura'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password for Registration */}
            {activeTab === 'register' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Confirm Password *
                </label>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: tokens.cinnamon,
                color: '#FFFFFF',
                border: 'none',
                padding: '13px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(163,64,47,0.3)'
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In & Proceed' : 'Create Account & Proceed'}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </div>

          {/* Quick Auto-fill assistant */}
          <div style={{
            marginTop: '18px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748B'
          }}>
            <span>Testing out? Auto-fill sample info:</span>
            <button
              type="button"
              onClick={handleDemoCustomer}
              style={{
                background: 'none',
                border: 'none',
                color: tokens.teal,
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Fill Sample
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

