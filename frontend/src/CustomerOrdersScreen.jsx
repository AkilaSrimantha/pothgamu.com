import React, { useState, useEffect } from 'react';
import { tokens } from './PothGamuHomepage';

export default function CustomerOrdersScreen({ customerUser, onBackToStore }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All'); // 'All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'

  useEffect(() => {
    fetchCustomerOrders();
  }, [customerUser]);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const userId = customerUser?.id || customerUser?._id;
      let url = 'http://localhost:5000/api/orders';
      if (userId) {
        url = `http://localhost:5000/api/orders/user/${userId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        // If user has orders, show them, or filter by email
        let list = data.data;
        if (!userId && customerUser?.email) {
          list = list.filter(o => o.customer?.email?.toLowerCase() === customerUser.email.toLowerCase());
        }
        setOrders(list);
      }
    } catch (err) {
      console.warn("Error fetching customer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => filterTab === 'All' || o.status === filterTab);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onBackToStore}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Bookstore
            </button>
            <div style={{ height: '20px', width: '1px', backgroundColor: '#CBD5E1' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="Logo" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
              <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Fraunces', serif", color: tokens.tealDeep }}>
                My Orders &amp; Tracking
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: tokens.teal,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px'
            }}>
              {customerUser?.name ? customerUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
              {customerUser?.name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1000px', margin: '28px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 4px 0', fontFamily: "'Fraunces', serif" }}>
              Purchase History &amp; Orders
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Track shipments, review item receipts and download delivery confirmations
            </p>
          </div>
          <button
            onClick={fetchCustomerOrders}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
        </div>

        {/* Status Tabs (AliExpress Style) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px'
        }}>
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #E2E8F0',
                backgroundColor: filterTab === tab ? tokens.cinnamon : '#FFFFFF',
                color: filterTab === tab ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'All' ? 'All Orders' : tab}
            </button>
          ))}
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: tokens.teal }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', marginBottom: '10px' }}></i>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px dashed #CBD5E1'
          }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '14px' }}></i>
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px' }}>No orders found</h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>You haven't placed any orders in this category yet.</p>
            <button
              onClick={onBackToStore}
              style={{
                backgroundColor: tokens.cinnamon,
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredOrders.map(order => (
              <div
                key={order._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                {/* Order Top Bar */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  padding: '16px 20px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Order ID</span>
                      <strong style={{ fontSize: '15px', color: tokens.tealDeep }}>{order.orderId}</strong>
                    </div>
                    <div style={{ height: '24px', width: '1px', backgroundColor: '#E2E8F0' }}></div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Order Date</span>
                      <span style={{ fontSize: '13px', color: '#0F172A' }}>
                        {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: order.status === 'Delivered' ? '#DCFCE7' :
                                       order.status === 'Cancelled' ? '#FEE2E2' :
                                       order.status === 'Shipped' ? '#E0F2FE' : '#FEF3C7',
                      color: order.status === 'Delivered' ? '#166534' :
                             order.status === 'Cancelled' ? '#991B1B' :
                             order.status === 'Shipped' ? '#075985' : '#92400E'
                    }}>
                      ● {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '44px',
                            height: '56px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {item.coverImage ? (
                              <img src={item.coverImage} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <i className="fa-solid fa-book" style={{ color: '#94A3B8' }}></i>
                            )}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '14px', color: '#0F172A', fontWeight: '600' }}>{item.title}</h4>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: tokens.cinnamon, fontSize: '14px' }}>
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Bottom Bar */}
                  <div style={{
                    paddingTop: '16px',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      Payment: <strong>{order.paymentMethod}</strong> • Destination: <strong>{order.customer?.city}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '14px', color: '#64748B' }}>Grand Total:</span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: tokens.tealDeep }}>
                        Rs. {(order.grandTotal || order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

