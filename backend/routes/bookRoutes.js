const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET all books with filtering and search
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'title-asc') sortOption = { title: 1 };

    const books = await Book.find(query).sort(sortOption);
    res.json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET low stock books (Inventory & Stock Alerts)
router.get('/low-stock', async (req, res) => {
  try {
    // Books with stock <= 5 or stock <= minRequiredStock
    const books = await Book.find({
      $expr: { $lte: ['$quantityInStock', '$minRequiredStock'] }
    }).sort({ quantityInStock: 1 });

    res.json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create book
router.post('/', async (req, res) => {
  try {
    const { isbn, title, author, category, price, quantityInStock, description, coverImage, publishedYear, publisher, minRequiredStock } = req.body;
    
    // Check for duplicate ISBN
    const existing = await Book.findOne({ isbn });
    if (existing) {
      return res.status(400).json({ success: false, message: `Book with ISBN ${isbn} already exists.` });
    }

    const newBook = new Book({
      isbn,
      title,
      author,
      category,
      price: Number(price),
      quantityInStock: Number(quantityInStock),
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      publishedYear: publishedYear ? Number(publishedYear) : undefined,
      publisher,
      minRequiredStock: minRequiredStock ? Number(minRequiredStock) : 10
    });

    const saved = await newBook.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH restock quantity
router.patch('/:id/restock', async (req, res) => {
  try {
    const amount = Number(req.body.amount) || 10;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    book.quantityInStock += amount;
    await book.save();
    res.json({ success: true, message: `Successfully restocked ${book.title}`, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add a review to a book
router.post('/:id/reviews', async (req, res) => {
  try {
    const { userName, rating, comment, verifiedPurchase, orderId } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment cannot be empty' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const newReview = {
      userName: userName ? userName.trim() : 'Anonymous Reader',
      rating: Number(rating),
      comment: comment.trim(),
      verifiedPurchase: verifiedPurchase !== undefined ? verifiedPurchase : true,
      orderId: orderId || '',
      createdAt: new Date()
    };

    if (!book.reviews) {
      book.reviews = [];
    }

    book.reviews.unshift(newReview);
    book.totalReviews = book.reviews.length;
    const sumRatings = book.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    book.averageRating = Number((sumRatings / book.totalReviews).toFixed(1));

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: book
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET reviews for a book
router.get('/:id/reviews', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({
      success: true,
      totalReviews: book.reviews?.length || 0,
      averageRating: book.averageRating || 5.0,
      data: book.reviews || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all reviews summary for admin
router.get('/all-reviews/summary', async (req, res) => {
  try {
    const books = await Book.find({ 'reviews.0': { $exists: true } });
    const allReviews = [];
    books.forEach(b => {
      b.reviews.forEach(r => {
        allReviews.push({
          bookId: b._id,
          bookTitle: b.title,
          bookCover: b.coverImage,
          category: b.category,
          reviewId: r._id,
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          verifiedPurchase: r.verifiedPurchase,
          orderId: r.orderId,
          createdAt: r.createdAt
        });
      });
    });

    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: allReviews.length, data: allReviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, message: 'Book deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

