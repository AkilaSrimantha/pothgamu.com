import React, { useState, useEffect } from 'react';
import { sampleBooks, sampleCategories } from './fallbackData';

// Design Tokens for PothGamu.lk
// Palette drawn from Sri Lankan reading culture: aged ola-leaf paper,
// deep teal library ink, cinnamon-bark red, and turmeric gold.
export const tokens = {
  paper: "#FAF5EA",
  paperDeep: "#F1E9D8",
  ink: "#20302F",
  teal: "#154D4A",
  tealDeep: "#0E3634",
  cinnamon: "#A3402F",
  gold: "#DE9F2A",
  sage: "#7C9A79",
  line: "#DED0B0",
  white: "#FFFFFF"
};

// Signature LeafBind SVG Component inspired by Sri Lankan ola-leaf manuscripts
export function LeafBind() {
  return (
    <div style={{ width: '100%', overflow: 'hidden', margin: '20px 0' }}>
      <svg
        viewBox="0 0 1200 32"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "24px", display: "block" }}
      >
        <line x1="0" y1="16" x2="1200" y2="16" stroke={tokens.line} strokeWidth="1.5" strokeDasharray="6 4" />
        <circle cx="200" cy="16" r="4" fill={tokens.gold} />
        <circle cx="400" cy="16" r="4" fill={tokens.cinnamon} />
        <circle cx="600" cy="16" r="6" fill={tokens.teal} />
        <circle cx="600" cy="16" r="2" fill={tokens.paper} />
        <circle cx="800" cy="16" r="4" fill={tokens.cinnamon} />
        <circle cx="1000" cy="16" r="4" fill={tokens.gold} />
      </svg>
    </div>
  );
}

export default function PothGamuHomepage({
  adminUser,
  customerUser,
  onSwitchToAdmin,
  onOpenCustomerAuth,
  onOpenMyOrders,
  onCustomerLogout,
  onAdminLogout,
  onProceedToCheckout,
  cart,
  setCart,
  wishlist,
  setWishlist
}) {
  const [books, setBooks] = useState(sampleBooks);
  const [categories, setCategories] = useState(sampleCategories);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Checkout form state
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Colombo',
    paymentMethod: 'Cash on Delivery'
  });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [selectedCategory]);

  const fetchBooks = async () => {
    try {
      let url = `${API_BASE}/books`;
      if (selectedCategory !== 'All') {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setBooks(data.data);
      } else {
        applyFallbackBooks();
      }
    } catch (err) {
      applyFallbackBooks();
    } finally {
      setLoading(false);
    }
  };

  const applyFallbackBooks = () => {
    if (selectedCategory === 'All') {
      setBooks(sampleBooks);
    } else {
      setBooks(sampleBooks.filter(b => b.category === selectedCategory));
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const catNames = ['All', ...data.data.map(c => c.name)];
        setCategories(catNames);
      } else {
        setCategories(sampleCategories);
      }
    } catch (err) {
      setCategories(sampleCategories);
    }
  };

  const filteredBooks = books.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q)
    );
  });

  const addToCart = (book) => {
    if (book.quantityInStock <= 0) {
      alert("This book is currently out of stock!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item._id === book._id);
      if (existing) {
        return prev.map(item =>
          item._id === book._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const toggleWishlist = (book) => {
    setWishlist(prev => {
      const exists = prev.some(item => item._id === book._id);
      if (exists) {
        return prev.filter(item => item._id !== book._id);
      }
      return [...prev, book];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const orderPayload = {
        customer: {
          name: checkoutData.name,
          email: checkoutData.email,
          phone: checkoutData.phone,
          address: checkoutData.address,
          city: checkoutData.city
        },
        items: cart.map(item => ({
          bookId: item._id,
          title: item.title,
          author: item.author,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cartTotal,
        paymentMethod: checkoutData.paymentMethod
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (data.success) {
        setOrderSuccess(data.data);
        setCart([]);
        setIsCheckoutOpen(false);
        fetchBooks(); // refresh stock numbers
      } else {
        alert("Failed to place order: " + data.message);
      }
    } catch (err) {
      alert("Error contacting backend server: " + err.message);
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      if (data.success) {
        const found = data.data.find(o => o.orderId.toLowerCase() === trackingId.trim().toLowerCase());
        if (found) {
          setTrackedOrder(found);
        } else {
          setTrackError(`No order found matching "${trackingId}". Example: ORD-8918`);
        }
      }
    } catch (err) {
      setTrackError("Unable to reach order server.");
    }
  };

  return (
    <div style={{ backgroundColor: tokens.paper, minHeight: '100vh', color: tokens.ink }}>
      {/* Navigation Header */}
      <header style={{
        backgroundColor: tokens.paperDeep,
        borderBottom: `1px solid ${tokens.line}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: tokens.tealDeep,
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: "'Fraunces', serif"
            }}>
              <img
                src="/logo.png"
                alt="PothGamu.lk Logo"
                style={{
                  height: '42px',
                  width: '42px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  padding: '2px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}
              />
              <span>PothGamu<span style={{ color: tokens.cinnamon }}>.lk</span></span>
            </a>
            <span style={{
              fontSize: '11px',
              backgroundColor: tokens.paper,
              border: `1px solid ${tokens.line}`,
              color: tokens.teal,
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '600'
            }}>
              Sri Lanka
            </span>
          </div>

          {/* Search Box */}
          <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: tokens.ink,
              opacity: 0.5
            }}></i>
            <input
              type="text"
              placeholder="Search by Title, Author, or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '30px',
                border: `1px solid ${tokens.line}`,
                backgroundColor: tokens.white,
                color: tokens.ink,
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Customer User Account / Sign In (AliExpress style) */}
            {customerUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={onOpenMyOrders}
                  style={{
                    backgroundColor: tokens.white,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    color: tokens.tealDeep,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-box" style={{ color: tokens.cinnamon }}></i>
                  <span>My Orders</span>
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: tokens.paper,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: `1px solid ${tokens.line}`,
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  <i className="fa-solid fa-circle-user" style={{ color: tokens.teal, fontSize: '15px' }}></i>
                  <span>{customerUser.name?.split(' ')[0]}</span>
                  <button
                    onClick={onCustomerLogout}
                    title="Sign Out"
                    style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                style={{
                  backgroundColor: tokens.white,
                  color: tokens.tealDeep,
                  border: `1px solid ${tokens.line}`,
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <i className="fa-regular fa-user" style={{ color: tokens.cinnamon }}></i>
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Track order */}
            <button
              onClick={() => { setTrackingModalOpen(true); setTrackError(''); setTrackedOrder(null); }}
              title="Track Order"
              style={{
                background: 'none',
                border: `1px solid ${tokens.line}`,
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '13px',
                color: tokens.ink,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-truck-fast" style={{ color: tokens.teal }}></i>
              <span>Track</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => alert(`You have ${wishlist.length} item(s) in your wishlist.`)}
              title="Wishlist"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: tokens.ink,
                position: 'relative',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <i className="fa-regular fa-heart"></i>
              {wishlist.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  backgroundColor: tokens.cinnamon,
                  color: tokens.white,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  padding: '2px 6px'
                }}>
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              title="Cart"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: tokens.ink,
                position: 'relative',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-cart-shopping"></i>
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                backgroundColor: tokens.cinnamon,
                color: tokens.white,
                fontSize: '11px',
                fontWeight: 'bold',
                borderRadius: '50%',
                padding: '2px 6px'
              }}>
                {cartItemCount}
              </span>
            </button>

            {/* Admin Authentication & Console Access */}
            {adminUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={onSwitchToAdmin}
                  style={{
                    backgroundColor: '#2563EB',
                    color: tokens.white,
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-chart-line"></i> Admin Console
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Log out of Admin"
                  style={{
                    background: 'none',
                    border: `1px solid ${tokens.line}`,
                    padding: '7px 10px',
                    borderRadius: '20px',
                    color: '#DC2626',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <button
                onClick={onSwitchToAdmin}
                style={{
                  backgroundColor: '#0F172A',
                  color: tokens.white,
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(15,23,42,0.25)',
                  cursor: 'pointer'
                }}
              >
                <i className="fa-solid fa-lock" style={{ fontSize: '10px', color: '#F59E0B' }}></i>
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section matching report Figure 3 and page 7 */}
      <div style={{ maxWidth: '1200px', margin: '28px auto 10px auto', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #F1E9D8 0%, #EDE2CE 100%)',
          border: `1px solid ${tokens.line}`,
          borderRadius: '16px',
          padding: '44px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(222, 159, 42, 0.25)',
              color: tokens.cinnamon,
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              padding: '5px 14px',
              borderRadius: '20px',
              marginBottom: '14px'
            }}>
              SRI LANKA'S HERITAGE OF BOOKS
            </span>
            <h1 style={{
              fontSize: '40px',
              color: tokens.tealDeep,
              lineHeight: 1.2,
              marginBottom: '16px',
              fontFamily: "'Fraunces', serif"
            }}>
              Read, Learn &amp; Rediscover the Joy of Books.
            </h1>
            <p style={{
              color: tokens.ink,
              opacity: 0.88,
              fontSize: '15px',
              lineHeight: 1.6,
              marginBottom: '26px'
            }}>
              Explore thousands of novels, academic past papers, medical textbooks, and classic Sinhala/English literature delivered straight to your doorstep across Sri Lanka.
            </p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <a
                href="#catalog"
                style={{
                  backgroundColor: tokens.cinnamon,
                  color: tokens.white,
                  border: 'none',
                  padding: '13px 28px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(163,64,47,0.25)'
                }}
              >
                Explore Catalog <i className="fa-solid fa-arrow-right"></i>
              </a>
              <span style={{ fontSize: '13px', color: tokens.tealDeep, fontWeight: '500' }}>
                <i className="fa-solid fa-circle-check" style={{ color: tokens.sage, marginRight: '4px' }}></i>
                Island-wide COD Available
              </span>
            </div>
          </div>

          {/* Ola-Leaf Manuscript Motif Feature Card */}
          <div style={{
            backgroundColor: tokens.teal,
            color: tokens.paper,
            borderRadius: '16px',
            padding: '28px 24px',
            width: '280px',
            textAlign: 'center',
            boxShadow: '0 6px 20px rgba(21,77,74,0.3)',
            border: `2px solid ${tokens.gold}`
          }}>
            <div style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 14px auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <img
                src="/logo.png"
                alt="PothGamu Emblem"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <h3 style={{
              fontSize: '19px',
              marginBottom: '8px',
              fontFamily: "'Fraunces', serif",
              color: tokens.paper
            }}>
              PothGamu.lk
            </h3>
            <p style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.5 }}>
              Preserving reading heritage with modern digital convenience.
            </p>
            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              fontSize: '11px',
              color: tokens.gold,
              fontWeight: '600'
            }}>
              IT32053 • Group 16
            </div>
          </div>
        </div>
      </div>

      {/* Ola-Leaf Manuscript Binding Cord Graphic */}
      <LeafBind />

      {/* Category Tabs */}
      <div id="catalog" style={{ maxWidth: '1200px', margin: '0 auto 24px auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isActive ? tokens.teal : tokens.white,
                  border: `1px solid ${isActive ? tokens.teal : tokens.line}`,
                  color: isActive ? tokens.white : tokens.ink,
                  padding: '9px 20px',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 8px rgba(21,77,74,0.2)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Book Catalog Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px'
        }}>
          <h2 style={{
            fontSize: '26px',
            color: tokens.tealDeep,
            fontFamily: "'Fraunces', serif"
          }}>
            {selectedCategory === 'All' ? 'All Books' : `${selectedCategory} Books`}
          </h2>
          <span style={{ fontSize: '14px', color: tokens.ink, opacity: 0.7 }}>
            Showing {filteredBooks.length} book{filteredBooks.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: tokens.teal }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
            <p>Loading books from pothgamuDB catalog...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: tokens.white,
            borderRadius: '12px',
            border: `1px dashed ${tokens.line}`
          }}>
            <i className="fa-solid fa-book" style={{ fontSize: '40px', color: tokens.line, marginBottom: '12px' }}></i>
            <h3 style={{ color: tokens.tealDeep, marginBottom: '6px' }}>No books found</h3>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Try choosing another category or clearing your search term.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {filteredBooks.map(book => {
              const isWishlisted = wishlist.some(w => w._id === book._id);
              const isLowStock = book.quantityInStock > 0 && book.quantityInStock <= 4;
              const isOutOfStock = book.quantityInStock <= 0;

              return (
                <div
                  key={book._id}
                  style={{
                    backgroundColor: tokens.white,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Stock tag */}
                  {isOutOfStock ? (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: '#DC2626',
                      color: tokens.white,
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      zIndex: 2
                    }}>
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: '#D97706',
                      color: tokens.white,
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      zIndex: 2
                    }}>
                      Only {book.quantityInStock} left!
                    </span>
                  ) : null}

                  {/* Wishlist button */}
                  <button
                    onClick={() => toggleWishlist(book)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    <i className={`fa-heart ${isWishlisted ? 'fa-solid' : 'fa-regular'}`}
                      style={{ color: isWishlisted ? tokens.cinnamon : tokens.ink }}
                    ></i>
                  </button>

                  {/* Cover Image */}
                  <div
                    onClick={() => setSelectedBook(book)}
                    style={{
                      height: '220px',
                      backgroundColor: tokens.paperDeep,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80'}
                      alt={book.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>

                  {/* Book Body */}
                  <div style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: tokens.sage,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {book.category}
                      </span>
                      <h4
                        onClick={() => setSelectedBook(book)}
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: tokens.tealDeep,
                          margin: '6px 0 2px 0',
                          lineHeight: 1.3,
                          cursor: 'pointer',
                          fontFamily: "'Fraunces', serif"
                        }}
                      >
                        {book.title}
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: tokens.ink,
                        opacity: 0.7,
                        marginBottom: '12px'
                      }}>
                        {book.author}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: '8px',
                      borderTop: `1px solid ${tokens.paperDeep}`
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: tokens.cinnamon
                      }}>
                        Rs. {Number(book.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(book)}
                        disabled={isOutOfStock}
                        style={{
                          backgroundColor: isOutOfStock ? '#9CA3AF' : tokens.teal,
                          color: tokens.white,
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fa-solid fa-cart-plus"></i>
                        <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Book Details Modal */}
      {selectedBook && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: tokens.white,
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'row',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedBook(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: tokens.paperDeep,
                color: tokens.ink,
                cursor: 'pointer',
                fontSize: '14px',
                zIndex: 10
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ width: '40%', backgroundColor: tokens.paperDeep }}>
              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ width: '60%', padding: '28px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: tokens.sage, textTransform: 'uppercase' }}>
                {selectedBook.category}
              </span>
              <h2 style={{ fontSize: '22px', color: tokens.tealDeep, margin: '6px 0', fontFamily: "'Fraunces', serif" }}>
                {selectedBook.title}
              </h2>
              <p style={{ fontSize: '14px', color: tokens.ink, opacity: 0.8, marginBottom: '14px' }}>
                by <strong style={{ color: tokens.teal }}>{selectedBook.author}</strong>
              </p>

              <div style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.85, marginBottom: '16px', flex: 1 }}>
                {selectedBook.description || 'No detailed description available for this volume.'}
              </div>

              <div style={{
                backgroundColor: tokens.paper,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                marginBottom: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                <div><strong>ISBN:</strong> {selectedBook.isbn}</div>
                <div><strong>Stock:</strong> {selectedBook.quantityInStock} available</div>
                <div><strong>Publisher:</strong> {selectedBook.publisher || 'N/A'}</div>
                <div><strong>Year:</strong> {selectedBook.publishedYear || 'N/A'}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '22px', fontWeight: '700', color: tokens.cinnamon }}>
                  Rs. {Number(selectedBook.price).toFixed(2)}
                </span>
                <button
                  onClick={() => { addToCart(selectedBook); setSelectedBook(null); }}
                  disabled={selectedBook.quantityInStock <= 0}
                  style={{
                    backgroundColor: tokens.teal,
                    color: tokens.white,
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-cart-shopping" style={{ marginRight: '8px' }}></i>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 200,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '420px',
            maxWidth: '100%',
            height: '100%',
            backgroundColor: tokens.white,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${tokens.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: tokens.paperDeep
            }}>
              <h3 style={{ fontSize: '18px', color: tokens.tealDeep, fontFamily: "'Fraunces', serif" }}>
                <i className="fa-solid fa-cart-shopping" style={{ marginRight: '10px' }}></i>
                Your Shopping Cart ({cartItemCount})
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: tokens.ink, cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: tokens.ink, opacity: 0.6 }}>
                  <i className="fa-solid fa-bag-shopping" style={{ fontSize: '48px', marginBottom: '14px' }}></i>
                  <p>Your shopping cart is empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {cart.map(item => (
                    <div
                      key={item._id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: tokens.paper,
                        border: `1px solid ${tokens.line}`
                      }}
                    >
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', color: tokens.tealDeep, margin: 0 }}>{item.title}</h4>
                          <span style={{ fontSize: '12px', color: tokens.ink, opacity: 0.7 }}>{item.author}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: tokens.cinnamon }}>
                            Rs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => updateCartQuantity(item._id, -1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${tokens.line}`, background: tokens.white }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item._id, 1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px', border: `1px solid ${tokens.line}`, background: tokens.white }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '20px', borderTop: `1px solid ${tokens.line}`, backgroundColor: tokens.paperDeep }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '16px' }}>
                  <span>Subtotal:</span>
                  <strong style={{ color: tokens.cinnamon }}>Rs. {cartTotal.toFixed(2)}</strong>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); onProceedToCheckout(); }}
                  style={{
                    width: '100%',
                    backgroundColor: tokens.cinnamon,
                    color: tokens.white,
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  Proceed to Checkout <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: tokens.white,
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              backgroundColor: tokens.paperDeep,
              borderBottom: `1px solid ${tokens.line}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: tokens.tealDeep, fontFamily: "'Fraunces', serif" }}>
                Complete Your Order
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.ink }}>Full Name *</label>
                  <input
                    required
                    type="text"
                    value={checkoutData.name}
                    onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })}
                    placeholder="e.g. Ruwan Fernando"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: `1px solid ${tokens.line}`, marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.ink }}>Phone Number *</label>
                    <input
                      required
                      type="text"
                      value={checkoutData.phone}
                      onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                      placeholder="077 123 4567"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: `1px solid ${tokens.line}`, marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.ink }}>Email</label>
                    <input
                      type="email"
                      value={checkoutData.email}
                      onChange={e => setCheckoutData({ ...checkoutData, email: e.target.value })}
                      placeholder="ruwan@example.com"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: `1px solid ${tokens.line}`, marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.ink }}>Delivery Street Address *</label>
                  <input
                    required
                    type="text"
                    value={checkoutData.address}
                    onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })}
                    placeholder="No. 45, Temple Road"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: `1px solid ${tokens.line}`, marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.ink }}>City / District *</label>
                    <input
                      required
                      type="text"
                      value={checkoutData.city}
                      onChange={e => setCheckoutData({ ...checkoutData, city: e.target.value })}
                      placeholder="Colombo, Kandy, Galle..."
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: `1px solid ${tokens.line}`, marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.ink }}>Payment Method</label>
                    <select
                      value={checkoutData.paymentMethod}
                      onChange={e => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: `1px solid ${tokens.line}`, marginTop: '4px' }}
                    >
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                      <option value="Bank Transfer">Direct Bank Transfer</option>
                      <option value="Credit/Debit Card">Credit / Debit Card</option>
                    </select>
                  </div>
                </div>

                <div style={{
                  backgroundColor: tokens.paper,
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: '600'
                }}>
                  <span>Total Amount Payable:</span>
                  <span style={{ color: tokens.cinnamon, fontSize: '17px' }}>Rs. {cartTotal.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: tokens.teal,
                    color: tokens.white,
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    marginTop: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Confirm &amp; Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: tokens.white,
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '28px'
            }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 style={{ color: tokens.tealDeep, marginBottom: '8px', fontFamily: "'Fraunces', serif" }}>
              Order Placed Successfully!
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '16px' }}>
              Thank you for shopping with PothGamu.lk. Your book order has been recorded in the database.
            </p>
            <div style={{
              backgroundColor: tokens.paper,
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <div>Tracking Order ID: <strong>{orderSuccess.orderId}</strong></div>
              <div>Total: <strong>Rs. {Number(orderSuccess.totalAmount).toFixed(2)}</strong></div>
            </div>
            <button
              onClick={() => setOrderSuccess(null)}
              style={{
                backgroundColor: tokens.teal,
                color: tokens.white,
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {trackingModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: tokens.white,
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              backgroundColor: tokens.paperDeep,
              borderBottom: `1px solid ${tokens.line}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: tokens.tealDeep, fontFamily: "'Fraunces', serif" }}>
                <i className="fa-solid fa-truck-fast" style={{ marginRight: '8px' }}></i>
                Track Your Order
              </h3>
              <button onClick={() => setTrackingModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <form onSubmit={handleTrackOrder} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g. ORD-8918)"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', border: `1px solid ${tokens.line}` }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: tokens.teal,
                    color: tokens.white,
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}
                >
                  Track
                </button>
              </form>

              {trackError && (
                <div style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>
                  {trackError}
                </div>
              )}

              {trackedOrder && (
                <div style={{
                  backgroundColor: tokens.paper,
                  padding: '14px',
                  borderRadius: '8px',
                  border: `1px solid ${tokens.line}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', color: tokens.tealDeep }}>{trackedOrder.orderId}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: trackedOrder.status === 'Delivered' ? '#DCFCE7' :
                                       trackedOrder.status === 'Cancelled' ? '#FEE2E2' :
                                       trackedOrder.status === 'Shipped' ? '#E0F2FE' : '#FEF3C7',
                      color: trackedOrder.status === 'Delivered' ? '#166534' :
                             trackedOrder.status === 'Cancelled' ? '#991B1B' :
                             trackedOrder.status === 'Shipped' ? '#075985' : '#92400E'
                    }}>
                      {trackedOrder.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '6px' }}>
                    Customer: {trackedOrder.customer?.name} ({trackedOrder.customer?.city || 'Sri Lanka'})
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '6px' }}>
                    Total: <strong>Rs. {Number(trackedOrder.totalAmount).toFixed(2)}</strong> ({trackedOrder.paymentMethod})
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    Items: {trackedOrder.items?.map(i => `${i.title} (x${i.quantity})`).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        backgroundColor: tokens.tealDeep,
        color: tokens.paper,
        padding: '48px 24px 24px 24px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '36px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '32px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: tokens.gold,
              fontSize: '20px',
              fontFamily: "'Fraunces', serif",
              marginBottom: '12px'
            }}>
              <img
                src="/logo.png"
                alt="PothGamu.lk Logo"
                style={{
                  height: '34px',
                  width: '34px',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  padding: '2px'
                }}
              />
              <span>PothGamu.lk</span>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6, maxWidth: '340px' }}>
              Sri Lanka's dedicated digital bookstore offering academic past papers, medical textbooks, novels, and children's literature with swift delivery.
            </p>
          </div>
          <div>
            <h4 style={{ color: tokens.gold, marginBottom: '14px', fontSize: '15px' }}>Catalog Collections</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', opacity: 0.8, lineHeight: 2 }}>
              <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Past Papers')}>G.C.E. Past Paper Archive</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Medical')}>Clinical Medicine Essentials</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Novel')}>Novels &amp; Sinhala Literature</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Children')}>Children's Storybooks</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: tokens.gold, marginBottom: '14px', fontSize: '15px' }}>Island-wide Delivery</h4>
            <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6, marginBottom: '10px' }}>
              Island-wide Cash on Delivery (COD), Card Payments &amp; Direct Bank Transfer available across all 25 districts.
            </p>
            <div style={{ fontSize: '12px', color: tokens.gold }}>
              <i className="fa-solid fa-phone" style={{ marginRight: '6px' }}></i> Hotline: +94 11 234 5678
            </div>
          </div>
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '24px auto 0 auto',
          textAlign: 'center',
          fontSize: '12px',
          opacity: 0.65
        }}>
          &copy; 2026 PothGamu.lk — Group_16 (IT32053) Horizon Campus. Online Bookstore E-Commerce Platform.
        </div>
      </footer>
    </div>
  );
}

