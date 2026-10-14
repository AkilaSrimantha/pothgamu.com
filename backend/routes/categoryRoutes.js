const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Book = require('../models/Book');

// GET all categories with book count
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    
    // Calculate book count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Book.countDocuments({ category: cat.name });
        return {
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          displayOrder: cat.displayOrder,
          bookCount: count
        };
      })
    );

    res.json({ success: true, count: categoriesWithCount.length, data: categoriesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add new category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const newCategory = new Category({
      name: name.trim(),
      description: description ? description.trim() : ''
    });

    const saved = await newCategory.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category removed successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

