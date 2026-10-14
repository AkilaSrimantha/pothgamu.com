const fs = require('fs');
const path = require('path');
const { sampleBooks, sampleCategories, sampleOrders } = require('./seed');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const booksFile = path.join(dataDir, 'books.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const ordersFile = path.join(dataDir, 'orders.json');

// Initialize files if not present
if (!fs.existsSync(booksFile)) {
  const booksWithIds = sampleBooks.map((b, i) => ({
    ...b,
    _id: `66000000000000000000000${(i + 1).toString(16).padStart(2, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  fs.writeFileSync(booksFile, JSON.stringify(booksWithIds, null, 2));
}

if (!fs.existsSync(categoriesFile)) {
  const categoriesWithIds = sampleCategories.map((c, i) => ({
    ...c,
    _id: `67000000000000000000000${(i + 1).toString(16).padStart(2, '0')}`,
    createdAt: new Date().toISOString()
  }));
  fs.writeFileSync(categoriesFile, JSON.stringify(categoriesWithIds, null, 2));
}

if (!fs.existsSync(ordersFile)) {
  const ordersWithIds = sampleOrders.map((o, i) => ({
    ...o,
    _id: `68000000000000000000000${(i + 1).toString(16).padStart(2, '0')}`,
    createdAt: new Date(Date.now() - (i * 3600000 * 4)).toISOString(),
    updatedAt: new Date().toISOString()
  }));
  fs.writeFileSync(ordersFile, JSON.stringify(ordersWithIds, null, 2));
}

function readData(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

const LocalDB = {
  books: {
    find: (filter = {}) => {
      let items = readData(booksFile);
      if (filter.category && filter.category !== 'All') {
        items = items.filter(b => b.category === filter.category);
      }
      if (filter.search) {
        const s = filter.search.toLowerCase();
        items = items.filter(b => 
          b.title?.toLowerCase().includes(s) ||
          b.author?.toLowerCase().includes(s) ||
          b.isbn?.toLowerCase().includes(s) ||
          b.category?.toLowerCase().includes(s)
        );
      }
      return items;
    },
    findById: (id) => {
      return readData(booksFile).find(b => b._id === id);
    },
    create: (data) => {
      const items = readData(booksFile);
      const newBook = {
        _id: '66' + Math.random().toString(16).slice(2, 24).padStart(22, '0'),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.unshift(newBook);
      writeData(booksFile, items);
      return newBook;
    },
    findByIdAndUpdate: (id, update) => {
      const items = readData(booksFile);
      const index = items.findIndex(b => b._id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...update, updatedAt: new Date().toISOString() };
      writeData(booksFile, items);
      return items[index];
    },
    findByIdAndDelete: (id) => {
      let items = readData(booksFile);
      const book = items.find(b => b._id === id);
      if (!book) return null;
      items = items.filter(b => b._id !== id);
      writeData(booksFile, items);
      return book;
    },
    count: (filter = {}) => {
      return LocalDB.books.find(filter).length;
    }
  },

  categories: {
    find: () => readData(categoriesFile),
    create: (data) => {
      const items = readData(categoriesFile);
      const newCat = {
        _id: '67' + Math.random().toString(16).slice(2, 24).padStart(22, '0'),
        ...data,
        createdAt: new Date().toISOString()
      };
      items.push(newCat);
      writeData(categoriesFile, items);
      return newCat;
    },
    findByIdAndDelete: (id) => {
      let items = readData(categoriesFile);
      const cat = items.find(c => c._id === id);
      if (!cat) return null;
      items = items.filter(c => c._id !== id);
      writeData(categoriesFile, items);
      return cat;
    }
  },

  orders: {
    find: (filter = {}) => {
      let items = readData(ordersFile);
      if (filter.status && filter.status !== 'All') {
        items = items.filter(o => o.status === filter.status);
      }
      return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findById: (id) => readData(ordersFile).find(o => o._id === id),
    create: (data) => {
      const items = readData(ordersFile);
      const newOrder = {
        _id: '68' + Math.random().toString(16).slice(2, 24).padStart(22, '0'),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.unshift(newOrder);
      writeData(ordersFile, items);
      return newOrder;
    },
    findByIdAndUpdate: (id, update) => {
      const items = readData(ordersFile);
      const index = items.findIndex(o => o._id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...update, updatedAt: new Date().toISOString() };
      writeData(ordersFile, items);
      return items[index];
    },
    findByIdAndDelete: (id) => {
      let items = readData(ordersFile);
      const order = items.find(o => o._id === id);
      if (!order) return null;
      items = items.filter(o => o._id !== id);
      writeData(ordersFile, items);
      return order;
    }
  }
};

module.exports = LocalDB;

