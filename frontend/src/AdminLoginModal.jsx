import React, { useState } from 'react';
import { tokens } from './PothGamuHomepage';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success && data.user?.role === 'admin') {
        localStorage.setItem('pothgamu_admin_token', data.token);
        localStorage.setItem('pothgamu_admin_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setErrorMessage('Could not connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setUsername('admin@pothgamu.lk');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 350,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        position: 'relative'
      }}>
        {/* Close button */}
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

        {/* Modal Header */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '30px 24px 24px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}>
            <img src="/logo.png" alt="PothGamu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 6px 0', fontFamily: "'Fraunces', serif", color: '#F8FAFC' }}>
            Administrator Access
          </h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
            Enter your credentials to manage the bookstore catalog &amp; orders
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleLogin} style={{ padding: '24px' }}>
          {errorMessage && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-user" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  fontSize: '14px'
                }}></i>
                <input
                  required
                  type="text"
                  placeholder="e.g. admin@pothgamu.lk"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  fontSize: '14px'
                }}></i>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>Login to Admin Console</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            fontSize: '12px',
            color: '#64748B'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#0F172A' }}>Demo Credentials:</span>
              <button
                type="button"
                onClick={handleAutoFill}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontWeight: '600',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Auto-fill
              </button>
            </div>
            <div>Username: <code>admin</code> or <code>admin@pothgamu.lk</code></div>
            <div>Password: <code>admin123</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}

