import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ adminUser, onSwitchToStore, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'books', 'categories', 'orders', 'stock'
  const [orderFilter, setOrderFilter] = useState('All'); // 'All', 'Pending', 'Delivered', 'Cancelled'
  const [stats, setStats] = useState({
    totalBooks: 128,
    ordersPlaced: 54,
    totalRevenue: 92400,
    outOfStock: 3
  });
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Book Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    category: 'Novel',
    price: '',
    quantityInStock: '',
    minRequiredStock: 10,
    description: '',
    coverImage: '',
    publisher: '',
    publishedYear: 2024
  });

  // Add Category State
  const [newCatName, setNewCatName] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load Analytics
      const resStats = await fetch(`${API_BASE}/analytics/dashboard`);
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.data);

      // Load Books
      const resBooks = await fetch(`${API_BASE}/books`);
      const dataBooks = await resBooks.json();
      if (dataBooks.success) setBooks(dataBooks.data);

      // Load Categories
      const resCats = await fetch(`${API_BASE}/categories`);
      const dataCats = await resCats.json();
      if (dataCats.success) setCategories(dataCats.data);

      // Load Orders
      const resOrders = await fetch(`${API_BASE}/orders`);
      const dataOrders = await resOrders.json();
      if (dataOrders.success) setOrders(dataOrders.data);

      // Load Low Stock
      const resLow = await fetch(`${API_BASE}/books/low-stock`);
      const dataLow = await resLow.json();
      if (dataLow.success) setLowStockBooks(dataLow.data);
    } catch (err) {
      console.warn("Failed to load admin data from API:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const url = editingBook ? `${API_BASE}/books/${editingBook._id}` : `${API_BASE}/books`;
      const method = editingBook ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookForm,
          price: Number(bookForm.price),
          quantityInStock: Number(bookForm.quantityInStock),
          minRequiredStock: Number(bookForm.minRequiredStock) || 10,
          publishedYear: Number(bookForm.publishedYear) || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setEditingBook(null);
        resetBookForm();
        loadAllData();
      } else {
        alert(data.message || 'Error saving book');
      }
    } catch (err) {
      alert("Error saving book: " + err.message);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book from the catalog?")) return;
    try {
      const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (err) {
      alert("Error deleting book: " + err.message);
    }
  };

  const handleRestock = async (bookId, currentTitle) => {
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}/restock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 15 })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully restocked 15 units of ${currentTitle}!`);
        loadAllData();
      }
    } catch (err) {
      alert("Error restocking: " + err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName('');
        loadAllData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error adding category: " + err.message);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (err) {
      alert("Error updating order: " + err.message);
    }
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setBookForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price,
      quantityInStock: book.quantityInStock,
      minRequiredStock: book.minRequiredStock || 10,
      description: book.description || '',
      coverImage: book.coverImage || '',
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || 2024
    });
    setShowAddModal(true);
  };

  const resetBookForm = () => {
    setBookForm({
      isbn: '',
      title: '',
      author: '',
      category: 'Novel',
      price: '',
      quantityInStock: '',
      minRequiredStock: 10,
      description: '',
      coverImage: '',
      publisher: '',
      publishedYear: 2024
    });
  };

  const filteredOrders = orders.filter(o => orderFilter === 'All' || o.status === orderFilter);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#1E293B' }}>
      {/* Sidebar - Matching report screenshots exactly */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1E293B',
        flexShrink: 0
      }}>
        {/* Brand */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#F8FAFC',
          fontSize: '18px',
          fontWeight: '700'
        }}>
          <img
            src="/logo.png"
            alt="PothGamu Logo"
            style={{
              height: '34px',
              width: '34px',
              objectFit: 'contain',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              padding: '2px'
            }}
          />
          <span>PothGamu<span style={{ color: '#F97316' }}>.com</span></span>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {/* Main Overview */}
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', padding: '8px 12px' }}>
            MAIN OVERVIEW
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'dashboard' ? '#1E293B' : 'transparent',
              color: activeTab === 'dashboard' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '2px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-chart-pie" style={{ width: '16px' }}></i>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-chart-line" style={{ width: '16px' }}></i>
            <span>Analytics &amp; Reports</span>
          </button>

          {/* Book Catalog */}
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', padding: '12px 12px 6px 12px' }}>
            BOOK CATALOG
          </div>
          <button
            onClick={() => setActiveTab('books')}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'books' ? '#1E293B' : 'transparent',
              color: activeTab === 'books' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '2px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-book" style={{ width: '16px' }}></i>
            <span>All Books</span>
          </button>
          <button
            onClick={() => { resetBookForm(); setEditingBook(null); setShowAddModal(true); }}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '2px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-circle-plus" style={{ width: '16px' }}></i>
            <span>+ Add New Book</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'categories' ? '#1E293B' : 'transparent',
              color: activeTab === 'categories' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-tags" style={{ width: '16px' }}></i>
            <span>Categories &amp; Genres</span>
          </button>
          <button
            onClick={() => setActiveTab('books')}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-feather" style={{ width: '16px' }}></i>
            <span>Authors &amp; Publishers</span>
          </button>

          {/* Sales & Orders */}
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', padding: '12px 12px 6px 12px' }}>
            SALES &amp; ORDERS
          </div>
          <button
            onClick={() => { setActiveTab('orders'); setOrderFilter('All'); }}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'orders' && orderFilter === 'All' ? '#1E293B' : 'transparent',
              color: activeTab === 'orders' && orderFilter === 'All' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '2px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-bag-shopping" style={{ width: '16px' }}></i>
            <span>All Orders</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setOrderFilter('Pending'); }}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'orders' && orderFilter === 'Pending' ? '#1E293B' : 'transparent',
              color: activeTab === 'orders' && orderFilter === 'Pending' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '2px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-clock" style={{ width: '16px' }}></i>
            <span>Pending Orders</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setOrderFilter('Shipped'); }}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'orders' && orderFilter === 'Shipped' ? '#1E293B' : 'transparent',
              color: activeTab === 'orders' && orderFilter === 'Shipped' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '2px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-truck" style={{ width: '16px' }}></i>
            <span>Shipped &amp; Delivered</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setOrderFilter('Cancelled'); }}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'orders' && orderFilter === 'Cancelled' ? '#1E293B' : 'transparent',
              color: activeTab === 'orders' && orderFilter === 'Cancelled' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-ban" style={{ width: '16px' }}></i>
            <span>Returns / Cancelled</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'reviews' ? '#1E293B' : 'transparent',
              color: activeTab === 'reviews' ? '#38BDF8' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '6px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-star" style={{ width: '16px', color: '#F59E0B' }}></i>
            <span>Customer Reviews</span>
          </button>

          {/* Inventory */}
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', padding: '12px 12px 6px 12px' }}>
            INVENTORY
          </div>
          <button
            onClick={() => setActiveTab('stock')}
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'stock' ? '#1E293B' : 'transparent',
              color: activeTab === 'stock' ? '#F59E0B' : '#94A3B8',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '2px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-triangle-exclamation" style={{ width: '16px', color: '#F59E0B' }}></i>
            <span>Low Stock Alerts</span>
          </button>
        </nav>

        {/* User Footer in Sidebar */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1px solid #1E293B',
          fontSize: '12px',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ color: '#F1F5F9', fontWeight: '600' }}>{adminUser?.username || 'admin'}</div>
            <div>Group_16 • Horizon Campus</div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out of Admin"
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '6px'
            }}
          >
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Navbar */}
        <header style={{
          height: '60px',
          backgroundColor: '#0F172A',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          color: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>PothGamu Administration Console</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Admin identity chip */}
            <span style={{
              fontSize: '13px',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1E293B',
              padding: '6px 12px',
              borderRadius: '8px'
            }}>
              <i className="fa-solid fa-user-shield" style={{ color: '#38BDF8' }}></i>
              <span>{adminUser?.name || 'System Administrator'}</span>
            </span>

            {/* Back to Customer Store */}
            <button
              onClick={onSwitchToStore}
              style={{
                backgroundColor: 'transparent',
                color: '#94A3B8',
                border: '1px solid #334155',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-store"></i>
              <span>Customer Store</span>
            </button>

            {/* Secure Logout */}
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(239,68,68,0.3)'
              }}
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Views */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {/* VIEW: MAIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Admin Dashboard
                  </h1>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Overview of bookstore performance and catalog metrics
                  </p>
                </div>

                <button
                  onClick={() => { resetBookForm(); setEditingBook(null); setShowAddModal(true); }}
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-plus"></i> Add New Book
                </button>
              </div>

              {/* 4 Metric KPI Cards - Matching Page 3 screenshot */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                {/* Total Books */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Total Books</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#0F172A', margin: '8px 0 4px 0' }}>
                    {books.length > 0 ? books.length : stats.totalBooks}
                  </div>
                  <div style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-arrow-up"></i> +12% this month
                  </div>
                </div>

                {/* Orders Placed */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Orders Placed</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#0F172A', margin: '8px 0 4px 0' }}>
                    {orders.length > 0 ? orders.length : stats.ordersPlaced}
                  </div>
                  <div style={{ fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-arrow-down"></i> -8% this week
                  </div>
                </div>

                {/* Total Revenue */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Total Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#0F172A', margin: '8px 0 4px 0' }}>
                    Rs. {Number(stats.totalRevenue).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-arrow-up"></i> +24% vs last month
                  </div>
                </div>

                {/* Out of Stock */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Out of Stock</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#DC2626', margin: '8px 0 4px 0' }}>
                    {books.filter(b => b.quantityInStock <= 0).length || stats.outOfStock}
                  </div>
                  <div style={{ fontSize: '12px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i> Requires attention
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Catalog */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                marginBottom: '28px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                    Recent Inventory Highlights
                  </h3>
                  <button
                    onClick={() => setActiveTab('books')}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    View All Books &rarr;
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '10px 14px' }}>Book Title &amp; Author</th>
                        <th style={{ padding: '10px 14px' }}>Category</th>
                        <th style={{ padding: '10px 14px' }}>Price</th>
                        <th style={{ padding: '10px 14px' }}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.slice(0, 5).map(b => (
                        <tr key={b._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <strong>{b.title}</strong>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{b.author}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>{b.category}</td>
                          <td style={{ padding: '12px 14px' }}>Rs. {Number(b.price).toFixed(2)}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: b.quantityInStock <= 0 ? '#FEE2E2' : b.quantityInStock <= 5 ? '#FEF3C7' : '#DCFCE7',
                              color: b.quantityInStock <= 0 ? '#991B1B' : b.quantityInStock <= 5 ? '#92400E' : '#166534'
                            }}>
                              {b.quantityInStock <= 0 ? 'Out of Stock' : `${b.quantityInStock} in Stock`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BOOK CATALOG (Page 4 top screenshot) */}
          {activeTab === 'books' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    Book Library Catalog
                  </h1>
                  <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Manage and update all books in the inventory
                  </p>
                </div>

                <button
                  onClick={() => { resetBookForm(); setEditingBook(null); setShowAddModal(true); }}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-plus"></i> Add New Book
                </button>
              </div>

              {/* Table of Books matching Page 4 */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '600' }}>
                      <th style={{ padding: '14px 20px' }}>Title &amp; Author</th>
                      <th style={{ padding: '14px 20px' }}>Category</th>
                      <th style={{ padding: '14px 20px' }}>Price</th>
                      <th style={{ padding: '14px 20px' }}>Stock Status</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map(b => (
                      <tr key={b._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>{b.title}</div>
                          <div style={{ color: '#64748B', fontSize: '12px' }}>{b.author}</div>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#475569' }}>{b.category}</td>
                        <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0F172A' }}>
                          Rs. {Number(b.price).toFixed(2)}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: b.quantityInStock <= 0 ? '#FEE2E2' : b.quantityInStock <= 5 ? '#FEF3C7' : '#DCFCE7',
                            color: b.quantityInStock <= 0 ? '#991B1B' : b.quantityInStock <= 5 ? '#92400E' : '#166534'
                          }}>
                            {b.quantityInStock <= 0 ? '0 In Stock' : `${b.quantityInStock} In Stock`}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '12px' }}>
                            <button
                              onClick={() => openEditModal(b)}
                              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBook(b._id)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: CATEGORIES & GENRES (Page 4 bottom screenshot) */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Categories &amp; Genres
                </h1>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
                  Organize books into genres for easy browsing
                </p>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', maxWidth: '540px', marginBottom: '28px' }}>
                <input
                  type="text"
                  placeholder="New Category Name (e.g. Science Fiction)"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Add Category
                </button>
              </form>

              {/* Category Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px'
              }}>
                {categories.map(cat => {
                  const currentCount = books.filter(b => b.category === cat.name).length;
                  return (
                    <div
                      key={cat._id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '6px' }}>
                        {cat.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        {currentCount > 0 ? `${currentCount} Books Available` : '0 Books Available'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: LOW STOCK ALERTS (Page 5 top screenshot) */}
          {activeTab === 'stock' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Inventory &amp; Stock Alerts
                </h1>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
                  Keep track of low stock items and restock orders
                </p>
              </div>

              {/* Immediate Restock Container */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                maxWidth: '700px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#D97706',
                  fontWeight: '700',
                  fontSize: '15px',
                  marginBottom: '18px'
                }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>Immediate Restock Required</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {books.filter(b => b.quantityInStock <= (b.minRequiredStock || 10)).map(book => (
                    <div
                      key={book._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>{book.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Minimum required: {book.minRequiredStock || 10} units
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                          {book.quantityInStock} left
                        </span>
                        <button
                          onClick={() => handleRestock(book._id, book.title)}
                          style={{
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}

                  {books.filter(b => b.quantityInStock <= (b.minRequiredStock || 10)).length === 0 && (
                    <p style={{ color: '#16A34A', fontSize: '14px' }}>
                      All items in the library catalog are adequately stocked!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CUSTOMER ORDERS (Page 5 bottom screenshot) */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Customer Orders
                </h1>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
                  Track, fulfill and review customer purchases
                </p>
              </div>

              {/* Order Filter Tabs matching Page 5 */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['All', 'Pending', 'Delivered', 'Cancelled'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setOrderFilter(tab)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      backgroundColor: orderFilter === tab ? '#4F46E5' : '#FFFFFF',
                      color: orderFilter === tab ? '#FFFFFF' : '#64748B'
                    }}
                  >
                    {tab === 'All' ? 'All Orders' : `${tab} Orders`}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '14px 20px' }}>Order ID</th>
                      <th style={{ padding: '14px 20px' }}>Customer</th>
                      <th style={{ padding: '14px 20px' }}>Items</th>
                      <th style={{ padding: '14px 20px' }}>Total Amount</th>
                      <th style={{ padding: '14px 20px' }}>Status</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '700', color: '#2563EB' }}>
                          {order.orderId}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: '600', color: '#0F172A' }}>{order.customer?.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{order.customer?.phone || order.customer?.city}</div>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#475569' }}>
                          {order.items?.map(i => `${i.title} x ${i.quantity}`).join(', ') || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: '600' }}>
                          Rs. {Number(order.totalAmount).toFixed(2)}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: order.status === 'Cancelled' ? '#FEE2E2' :
                                             order.status === 'Delivered' ? '#DCFCE7' :
                                             order.status === 'Shipped' ? '#E0F2FE' : '#FEF3C7',
                            color: order.status === 'Cancelled' ? '#991B1B' :
                                   order.status === 'Delivered' ? '#166534' :
                                   order.status === 'Shipped' ? '#075985' : '#92400E'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <select
                            value={order.status}
                            onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                          No orders in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customer Reviews Tab */}
          {activeTab === 'reviews' && (() => {
            const allReviews = [];
            books.forEach(b => {
              (b.reviews || []).forEach(r => {
                allReviews.push({
                  ...r,
                  bookTitle: b.title,
                  bookCover: b.coverImage,
                  category: b.category,
                  bookId: b._id
                });
              });
            });
            allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const avgStoreRating = allReviews.length > 0 
              ? (allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / allReviews.length).toFixed(1)
              : '5.0';

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0F172A' }}>
                      Customer Reviews &amp; Ratings
                    </h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                      All verified customer feedback, star ratings, and comments across book catalog
                    </p>
                  </div>
                </div>

                {/* Rating Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Total Customer Reviews</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginTop: '6px' }}>{allReviews.length}</div>
                    <div style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>Across {books.length} publications</div>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Average Store Rating</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B', marginTop: '6px' }}>
                      ⭐ {avgStoreRating} / 5.0
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>High customer satisfaction</div>
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>5-Star Reviews</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981', marginTop: '6px' }}>
                      {allReviews.filter(r => Number(r.rating) >= 5).length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {allReviews.length > 0 ? Math.round((allReviews.filter(r => Number(r.rating) >= 5).length / allReviews.length) * 100) : 100}% of all reviews
                    </div>
                  </div>
                </div>

                {/* Reviews Table */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '600' }}>
                        <th style={{ padding: '14px 20px' }}>Book</th>
                        <th style={{ padding: '14px 20px' }}>Customer</th>
                        <th style={{ padding: '14px 20px' }}>Rating</th>
                        <th style={{ padding: '14px 20px' }}>Customer Review / Comment</th>
                        <th style={{ padding: '14px 20px' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allReviews.map((rev, idx) => (
                        <tr key={rev._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={rev.bookCover} alt="" style={{ width: '36px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                              <div>
                                <strong style={{ color: '#0F172A', display: 'block' }}>{rev.bookTitle}</strong>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>{rev.category}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: '600', color: '#0F172A' }}>{rev.userName}</div>
                            {rev.verifiedPurchase && (
                              <span style={{ fontSize: '10px', color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>
                                ✓ Verified Buyer
                              </span>
                            )}
                            {rev.orderId && (
                              <div style={{ fontSize: '11px', color: '#64748B' }}>{rev.orderId}</div>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ color: '#F59E0B', fontSize: '14px' }}>
                              {'★'.repeat(Math.round(rev.rating || 5))}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '700', marginLeft: '6px', color: '#0F172A' }}>
                              {rev.rating}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', maxWidth: '340px' }}>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.4 }}>
                              {rev.comment}
                            </p>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      ))}
                      {allReviews.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                            No customer reviews recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Add / Edit Book Modal */}
      {showAddModal && (
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
            maxWidth: '540px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F8FAFC'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                {editingBook ? 'Edit Book Record' : 'Add New Book to Catalog'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingBook(null); }}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveBook} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>ISBN *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 978-955-21-0015-8"
                      value={bookForm.isbn}
                      onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Category *</label>
                    <select
                      value={bookForm.category}
                      onChange={e => setBookForm({ ...bookForm, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                    >
                      <option value="Novel">Novel</option>
                      <option value="Children">Children</option>
                      <option value="Past Papers">Past Papers</option>
                      <option value="Medical">Medical</option>
                      <option value="Academic">Academic</option>
                      <option value="Historical & Classic">Historical &amp; Classic</option>
                      <option value="Educational & School">Educational &amp; School</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Book Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Madol Doova"
                    value={bookForm.title}
                    onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Author / Publisher *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Martin Wickramasinghe"
                    value={bookForm.author}
                    onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Price (LKR) *</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="650.00"
                      value={bookForm.price}
                      onChange={e => setBookForm({ ...bookForm, price: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Quantity In Stock *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="25"
                      value={bookForm.quantityInStock}
                      onChange={e => setBookForm({ ...bookForm, quantityInStock: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={bookForm.coverImage}
                    onChange={e => setBookForm({ ...bookForm, coverImage: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Description / Synopsis</label>
                  <textarea
                    rows="3"
                    placeholder="Brief synopsis of the book..."
                    value={bookForm.description}
                    onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '4px' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingBook(null); }}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#2563EB', color: '#FFFFFF', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {editingBook ? 'Update Book' : 'Save Book'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

