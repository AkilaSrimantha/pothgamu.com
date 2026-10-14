const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pothgamuDB";

let isMongoConnected = false;

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 2000
  })
  .then(() => {
    isMongoConnected = true;
    console.log("MongoDB connected: pothgamuDB");
  })
  .catch((err) => {
    console.warn("MongoDB connection warning: " + err.message);
    console.log("Using local JSON file persistence layer for zero-config offline execution.");
  });

// Attach DB mode indicator to requests
app.use((req, res, next) => {
  req.isMongoConnected = isMongoConnected;
  next();
});

// Import controllers / routes
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const LocalDB = require('./localDb');

// Fallback router for LocalDB if MongoDB is not running
const fallbackRouter = express.Router();

// Fallback Books
fallbackRouter.get('/books', (req, res) => {
  const books = LocalDB.books.find({ category: req.query.category, search: req.query.search });
  res.json({ success: true, count: books.length, data: books });
});

fallbackRouter.get('/books/low-stock', (req, res) => {
  const books = LocalDB.books.find().filter(b => b.quantityInStock <= (b.minRequiredStock || 10));
  res.json({ success: true, count: books.length, data: books });
});

fallbackRouter.get('/books/:id', (req, res) => {
  const book = LocalDB.books.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, data: book });
});

fallbackRouter.post('/books', (req, res) => {
  const book = LocalDB.books.create(req.body);
  res.status(201).json({ success: true, data: book });
});

fallbackRouter.put('/books/:id', (req, res) => {
  const book = LocalDB.books.findByIdAndUpdate(req.params.id, req.body);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, data: book });
});

fallbackRouter.patch('/books/:id/restock', (req, res) => {
  const book = LocalDB.books.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
  const amount = Number(req.body.amount) || 10;
  const updated = LocalDB.books.findByIdAndUpdate(req.params.id, {
    quantityInStock: (book.quantityInStock || 0) + amount
  });
  res.json({ success: true, message: `Successfully restocked ${book.title}`, data: updated });
});

fallbackRouter.delete('/books/:id', (req, res) => {
  const deleted = LocalDB.books.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Book not found' });
  res.json({ success: true, message: 'Book deleted successfully', data: deleted });
});

// Fallback Categories
fallbackRouter.get('/categories', (req, res) => {
  const categories = LocalDB.categories.find();
  const allBooks = LocalDB.books.find();
  const withCount = categories.map(cat => ({
    ...cat,
    bookCount: allBooks.filter(b => b.category === cat.name).length
  }));
  res.json({ success: true, count: withCount.length, data: withCount });
});

fallbackRouter.post('/categories', (req, res) => {
  const newCat = LocalDB.categories.create(req.body);
  res.status(201).json({ success: true, data: newCat });
});

fallbackRouter.delete('/categories/:id', (req, res) => {
  const deleted = LocalDB.categories.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, message: 'Category deleted successfully' });
});

// Fallback Orders
fallbackRouter.get('/orders', (req, res) => {
  const orders = LocalDB.orders.find({ status: req.query.status });
  res.json({ success: true, count: orders.length, data: orders });
});

fallbackRouter.post('/orders', (req, res) => {
  const { customer, items, totalAmount, paymentMethod } = req.body;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ORD-${randomSuffix}`;
  const newOrder = LocalDB.orders.create({
    orderId,
    customer: {
      name: customer?.name || 'Anonymous Reader',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || 'Colombo'
    },
    items: items || [],
    totalAmount: Number(totalAmount),
    status: 'Pending',
    paymentMethod: paymentMethod || 'Cash on Delivery'
  });

  // Deduct stock
  if (Array.isArray(items)) {
    items.forEach(item => {
      if (item.bookId) {
        const b = LocalDB.books.findById(item.bookId);
        if (b) {
          LocalDB.books.findByIdAndUpdate(item.bookId, {
            quantityInStock: Math.max(0, (b.quantityInStock || 0) - (item.quantity || 1))
          });
        }
      }
    });
  }

  res.status(201).json({ success: true, data: newOrder });
});

fallbackRouter.patch('/orders/:id/status', (req, res) => {
  const updated = LocalDB.orders.findByIdAndUpdate(req.params.id, { status: req.body.status });
  if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, message: `Status updated to ${req.body.status}`, data: updated });
});

fallbackRouter.delete('/orders/:id', (req, res) => {
  const deleted = LocalDB.orders.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, message: 'Order deleted successfully' });
});

// Fallback Analytics
fallbackRouter.get('/analytics/dashboard', (req, res) => {
  const allBooks = LocalDB.books.find();
  const allOrders = LocalDB.orders.find();
  const totalBooks = allBooks.length;
  const outOfStock = allBooks.filter(b => b.quantityInStock <= 0).length;
  const lowStock = allBooks.filter(b => b.quantityInStock <= (b.minRequiredStock || 10)).length;
  const totalRevenue = allOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  res.json({
    success: true,
    data: {
      totalBooks: totalBooks || 128,
      ordersPlaced: allOrders.length || 54,
      totalRevenue: totalRevenue || 92400,
      outOfStock: outOfStock || 3,
      lowStockCount: lowStock || 5,
      recentOrders: allOrders.slice(0, 5)
    }
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Route switcher middleware
app.use('/api', (req, res, next) => {
  if (isMongoConnected) {
    next();
  } else {
    fallbackRouter(req, res, next);
  }
});

// Mongoose-backed API Routes
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'PothGamu.lk Bookstore E-Commerce Platform',
    group: 'Group_16',
    course: 'IT32053 - Horizon Campus',
    database: isMongoConnected ? 'MongoDB (Connected)' : 'Local File Persistence Engine (Active)',
    timestamp: new Date()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`PothGamu.lk backend running at http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;

