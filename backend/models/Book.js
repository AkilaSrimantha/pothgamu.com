const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author or publisher name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Past Papers',
        'Medical',
        'Novel',
        'Children',
        'Academic',
        'Historical & Classic',
        'Educational & School'
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be non-negative']
  },
  quantityInStock: {
    type: Number,
    required: [true, 'Quantity in stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minRequiredStock: {
    type: Number,
    default: 10
  },
  description: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  publishedYear: {
    type: Number
  },
  publisher: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);

