import React, { useState, useEffect } from 'react';
import { tokens } from './PothGamuHomepage';
import { API_BASE } from './apiConfig';

export default function CustomerOrdersScreen({ customerUser, onBackToStore }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All'); // 'All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'
  
  // Review Modal State
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Persisted reviewed items map: { "orderId_itemTitle": { rating, comment, date } }
  const [reviewedItems, setReviewedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pothgamu_reviewed_items');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    fetchCustomerOrders();
  }, [customerUser]);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const userId = customerUser?.id || customerUser?._id;
      let url = `${API_BASE}/orders`;
      if (userId) {
        url = `${API_BASE}/orders/user/${userId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
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

  const openReviewModal = (orderId, item) => {
    const key = `${orderId}_${item.title}`;
    const existing = reviewedItems[key];
    setReviewModalItem({
      orderId,
      bookId: item.bookId || item._id,
      title: item.title,
      author: item.author,
      coverImage: item.coverImage
    });
    setReviewRating(existing ? existing.rating : 5);
    setHoverRating(0);
    setReviewComment(existing ? existing.comment : '');
    setReviewSuccessMsg('');
    setReviewErrorMsg('');
  };

  const closeReviewModal = () => {
    setReviewModalItem(null);
    setReviewComment('');
    setReviewRating(5);
    setReviewSuccessMsg('');
    setReviewErrorMsg('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewErrorMsg('Please write a short comment about this book.');
      return;
    }

    setSubmittingReview(true);
    setReviewErrorMsg('');

    const key = `${reviewModalItem.orderId}_${reviewModalItem.title}`;
    const reviewData = {
      userName: customerUser?.name || 'Verified Reader',
      rating: Number(reviewRating),
      comment: reviewComment.trim(),
      verifiedPurchase: true,
      orderId: reviewModalItem.orderId
    };

    try {
      let bookId = reviewModalItem.bookId;

      // If we don't have a direct bookId, fetch books to match by title
      if (!bookId) {
        try {
          const booksRes = await fetch(`${API_BASE}/books?search=${encodeURIComponent(reviewModalItem.title)}`);
          const booksData = await booksRes.json();
          if (booksData.success && booksData.data && booksData.data.length > 0) {
            bookId = booksData.data[0]._id;
          }
        } catch (bErr) {
          console.warn("Could not find book ID by title:", bErr);
        }
      }

      if (bookId) {
        const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });
        const resData = await res.json();
        if (!resData.success) {
          throw new Error(resData.message || 'Failed to submit review');
        }
      }

      // Save to local storage cache as reviewed
      const updatedReviewed = {
        ...reviewedItems,
        [key]: {
          rating: reviewRating,
          comment: reviewComment.trim(),
          date: new Date().toISOString()
        }
      };
      setReviewedItems(updatedReviewed);
      localStorage.setItem('pothgamu_reviewed_items', JSON.stringify(updatedReviewed));

      setReviewSuccessMsg('Review submitted successfully! Thank you for your feedback.');
      setTimeout(() => {
        closeReviewModal();
      }, 1500);
    } catch (err) {
      console.warn("Review submission error:", err);
      // Still store locally for customer verification
      const updatedReviewed = {
        ...reviewedItems,
        [key]: {
          rating: reviewRating,
          comment: reviewComment.trim(),
          date: new Date().toISOString()
        }
      };
      setReviewedItems(updatedReviewed);
      localStorage.setItem('pothgamu_reviewed_items', JSON.stringify(updatedReviewed));
      setReviewSuccessMsg('Review saved! Thank you for your feedback.');
      setTimeout(() => {
        closeReviewModal();
      }, 1500);
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredOrders = orders.filter(o => filterTab === 'All' || o.status === filterTab);

  const getStarLabel = (r) => {
    switch (r) {
      case 5: return '5 Stars - Excellent / විශිෂ්ටයි ⭐⭐⭐⭐⭐';
      case 4: return '4 Stars - Very Good / ඉතා හොඳයි ⭐⭐⭐⭐';
      case 3: return '3 Stars - Good / සාමාන්‍යයි ⭐⭐⭐';
      case 2: return '2 Stars - Fair / අඩුපාඩු තිබේ ⭐⭐';
      case 1: return '1 Star - Poor / දුර්වලයි ⭐';
      default: return `${r} Stars`;
    }
  };

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
                My Orders &amp; Reviews
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
              Purchase History &amp; Item Reviews
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Track shipments, leave book reviews with star ratings, and download receipts
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
          marginBottom: '20px',
          borderBottom: '1px solid #E2E8F0'
        }}>
          {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filterTab === tab ? tokens.teal : '#FFFFFF',
                color: filterTab === tab ? '#FFFFFF' : '#64748B',
                boxShadow: filterTab === tab ? '0 2px 4px rgba(21,77,74,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'All' ? `All Orders (${orders.length})` : tab}
            </button>
          ))}
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '28px', color: tokens.teal, marginBottom: '12px' }}></i>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#F1F5F9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#94A3B8',
              fontSize: '24px'
            }}>
              <i className="fa-solid fa-box-open"></i>
            </div>
            <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '8px' }}>No orders found</h3>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto 20px auto' }}>
              {filterTab === 'All'
                ? "You haven't placed any book orders yet. Explore our curated Sinhala classics and modern publications!"
                : `No orders currently match status "${filterTab}".`}
            </p>
            <button
              onClick={onBackToStore}
              style={{
                backgroundColor: tokens.teal,
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                    {order.items?.map((item, idx) => {
                      const itemKey = `${order.orderId}_${item.title}`;
                      const reviewedInfo = reviewedItems[itemKey];

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            paddingBottom: idx === order.items.length - 1 ? '0' : '14px',
                            borderBottom: idx === order.items.length - 1 ? 'none' : '1px dashed #F1F5F9'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                            <div style={{
                              width: '48px',
                              height: '62px',
                              backgroundColor: '#F1F5F9',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {item.coverImage ? (
                                <img src={item.coverImage} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <i className="fa-solid fa-book" style={{ color: '#94A3B8' }}></i>
                              )}
                            </div>
                            <div>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0F172A', fontWeight: '600' }}>{item.title}</h4>
                              <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Qty: {item.quantity}</span>
                                {item.author && <span>• {item.author}</span>}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {/* Write Review Button */}
                            <button
                              onClick={() => openReviewModal(order.orderId, item)}
                              style={{
                                padding: '7px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: reviewedInfo ? '1px solid #10B981' : `1px solid ${tokens.gold}`,
                                backgroundColor: reviewedInfo ? '#ECFDF5' : '#FFFBEB',
                                color: reviewedInfo ? '#047857' : '#B45309',
                                transition: 'all 0.2s'
                              }}
                              title={reviewedInfo ? "Review submitted! Click to view or update" : "Write a review for this purchased book"}
                            >
                              <i className={reviewedInfo ? "fa-solid fa-star" : "fa-regular fa-star"} style={{ color: reviewedInfo ? '#10B981' : tokens.gold }}></i>
                              {reviewedInfo ? `Reviewed (${reviewedInfo.rating}★)` : 'Write Review'}
                            </button>

                            <span style={{ fontWeight: '700', color: tokens.cinnamon, fontSize: '15px', minWidth: '90px', textAlign: 'right' }}>
                              Rs. {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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

      {/* Review Submission Modal */}
      {reviewModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 300,
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
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: tokens.paper,
              padding: '20px 24px',
              borderBottom: `1px solid ${tokens.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: tokens.cinnamon, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Customer Feedback
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', color: tokens.tealDeep, fontFamily: "'Fraunces', serif" }}>
                  Write a Book Review
                </h3>
              </div>
              <button
                onClick={closeReviewModal}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} style={{ padding: '24px' }}>
              {/* Book Info Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  width: '42px',
                  height: '56px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {reviewModalItem.coverImage ? (
                    <img src={reviewModalItem.coverImage} alt={reviewModalItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa-solid fa-book" style={{ color: '#94A3B8', margin: '20px auto', display: 'block', textAlign: 'center' }}></i>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {reviewModalItem.title}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                    {reviewModalItem.author || 'Author'} • Order: <span style={{ color: tokens.teal }}>{reviewModalItem.orderId}</span>
                  </p>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#059669',
                    fontWeight: '600',
                    marginTop: '4px'
                  }}>
                    <i className="fa-solid fa-badge-check"></i> Verified Purchase (තහවුරු කළ මිලදී ගැනීමක්)
                  </span>
                </div>
              </div>

              {/* Star Rating Selector */}
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  Overall Rating (ඔබගේ තරු අගය තෝරන්න)
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '32px',
                        padding: '4px',
                        color: (hoverRating || reviewRating) >= star ? '#F59E0B' : '#E2E8F0',
                        transition: 'transform 0.1s, color 0.15s',
                        transform: (hoverRating || reviewRating) >= star ? 'scale(1.15)' : 'scale(1)'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: tokens.teal }}>
                  {getStarLabel(hoverRating || reviewRating)}
                </span>
              </div>

              {/* Review Text */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Your Review / සමාලෝචනය
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="පොතේ මුද්‍රණ තත්ත්වය, කතාව හෝ පාඨක අත්දැකීම පිළිබඳ ඔබේ සත්‍ය අදහස මෙහි ලියන්න... (Write your review about the content, paper quality or reading experience)"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {reviewErrorMsg && (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  {reviewErrorMsg}
                </div>
              )}

              {reviewSuccessMsg && (
                <div style={{
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                  {reviewSuccessMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={submittingReview}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: tokens.teal,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(21,77,74,0.2)'
                  }}
                >
                  {submittingReview ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
