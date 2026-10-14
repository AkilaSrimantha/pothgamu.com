const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');
const Category = require('./models/Category');
const Order = require('./models/Order');
const User = require('./models/User');

dotenv.config();

const sampleCategories = [
  { name: 'Novel', description: 'Novels & Fiction from Sri Lankan and global authors', displayOrder: 1 },
  { name: 'Children', description: 'Children stories and classic illustrated folk tales', displayOrder: 2 },
  { name: 'Past Papers', description: 'G.C.E. O/L and A/L past paper collections & model papers', displayOrder: 3 },
  { name: 'Medical', description: 'Clinical medicine textbooks, anatomy & pharmacy guides', displayOrder: 4 },
  { name: 'Academic', description: 'University level higher education, science, IT & engineering', displayOrder: 5 },
  { name: 'Historical & Classic', description: 'Historical manuscripts, heritage and classical chronicles', displayOrder: 6 },
  { name: 'Educational & School', description: 'Grade 1-13 school syllabus workbooks and reference guides', displayOrder: 7 }
];

const sampleBooks = [
  // --- NOVELS ---
  {
    isbn: "978-955-21-0001-1",
    title: "Madol Doova",
    author: "Martin Wickramasinghe",
    category: "Novel",
    price: 650.00,
    quantityInStock: 32,
    minRequiredStock: 10,
    description: "The celebrated Sri Lankan coming-of-age classic chronicling Upali and Jinadasa's adventures on the deserted island of Madol Doova.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80",
    publishedYear: 1947,
    publisher: "Tisara Prakasakayo"
  },
  {
    isbn: "978-955-21-0002-8",
    title: "Gamperaliya",
    author: "Martin Wickramasinghe",
    category: "Novel",
    price: 850.00,
    quantityInStock: 12,
    minRequiredStock: 10,
    description: "The pioneering realistic Sinhala novel detailing the downfall of a traditional Southern aristocratic family amidst modernization.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80",
    publishedYear: 1944,
    publisher: "Sarasavi Publishers"
  },
  {
    isbn: "978-955-21-0004-2",
    title: "Senkottan",
    author: "Mahinda Prasad Masimbula",
    category: "Novel",
    price: 950.00,
    quantityInStock: 4,
    minRequiredStock: 15,
    description: "Acclaimed award-winning novel depicting social caste realities and rural Sri Lankan life in the Sabaragamuwa region.",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80",
    publishedYear: 2012,
    publisher: "Santhawa Prakashana"
  },
  {
    isbn: "978-955-21-0005-9",
    title: "Ape Gama",
    author: "Martin Wickramasinghe",
    category: "Novel",
    price: 500.00,
    quantityInStock: 1,
    minRequiredStock: 10,
    description: "An evocative biographical depiction of boyhood in the coastal village of Koggala at the turn of the 20th century.",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80",
    publishedYear: 1940,
    publisher: "Tisara Prakasakayo"
  },
  {
    isbn: "978-955-21-0010-3",
    title: "Kaluwara Gedara",
    author: "K. Jayathilake",
    category: "Novel",
    price: 720.00,
    quantityInStock: 0,
    minRequiredStock: 5,
    description: "A poignant exploration of generational friction, rural land dispute, and the breakdown of village harmony.",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80",
    publishedYear: 1963,
    publisher: "Pradeepa Publishers"
  },
  {
    isbn: "978-955-21-0013-4",
    title: "Viragaya",
    author: "Martin Wickramasinghe",
    category: "Novel",
    price: 680.00,
    quantityInStock: 15,
    minRequiredStock: 8,
    description: "A profound psychological masterpiece analyzing the inner conflicts, attachments, and spiritual detachment of Aravinda.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80",
    publishedYear: 1956,
    publisher: "Tisara Prakasakayo"
  },
  {
    isbn: "978-955-21-0014-1",
    title: "Yuganthaya",
    author: "Martin Wickramasinghe",
    category: "Novel",
    price: 800.00,
    quantityInStock: 10,
    minRequiredStock: 6,
    description: "The concluding chapter of the celebrated Koggala trilogy examining trade union struggles and the rise of the working class.",
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&q=80",
    publishedYear: 1949,
    publisher: "Sarasavi Publishers"
  },

  // --- CHILDREN ---
  {
    isbn: "978-955-21-0003-5",
    title: "Amba Yahaluwo",
    author: "T.B. Ilangaratne",
    category: "Children",
    price: 550.00,
    quantityInStock: 2,
    minRequiredStock: 10,
    description: "An enduring youth classic celebrating true childhood friendship across social boundaries between Sunil and Nimal.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
    publishedYear: 1957,
    publisher: "Dayawansa Jayakody & Co."
  },
  {
    isbn: "978-955-21-0008-0",
    title: "Hath Pana",
    author: "Kumaratunga Munidasa",
    category: "Children",
    price: 450.00,
    quantityInStock: 20,
    minRequiredStock: 8,
    description: "Delightful humorous tale of Kiri Hamy and traditional wisdom from the Father of modern Hela Havula Sinhala literature.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80",
    publishedYear: 1935,
    publisher: "M.D. Gunasena"
  },
  {
    isbn: "978-955-21-0015-8",
    title: "Magul Kema",
    author: "Kumaratunga Munidasa",
    category: "Children",
    price: 380.00,
    quantityInStock: 25,
    minRequiredStock: 10,
    description: "Classic witty Sinhala children's narrative celebrated for its pure linguistic styling and timeless humor.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
    publishedYear: 1938,
    publisher: "M.D. Gunasena"
  },
  {
    isbn: "978-955-21-0016-5",
    title: "Vilasitha",
    author: "T.B. Ilangaratne",
    category: "Children",
    price: 490.00,
    quantityInStock: 14,
    minRequiredStock: 5,
    description: "An inspiring school story highlighting simplicity, moral values, and youth resilience in Sri Lankan schools.",
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
    publishedYear: 1960,
    publisher: "Dayawansa Jayakody & Co."
  },

  // --- PAST PAPERS ---
  {
    isbn: "978-955-21-0007-3",
    title: "A/L Combined Maths Past Papers (15 Years)",
    author: "Department of Examinations",
    category: "Past Papers",
    price: 1200.00,
    quantityInStock: 48,
    minRequiredStock: 10,
    description: "Comprehensive Sri Lanka G.C.E. Advanced Level Combined Mathematics past examination question papers with model answers.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80",
    publishedYear: 2023,
    publisher: "State Printing Corporation"
  },
  {
    isbn: "978-955-21-0012-7",
    title: "G.C.E. O/L Science Past Papers with Schemes",
    author: "DoE Sri Lanka",
    category: "Past Papers",
    price: 890.00,
    quantityInStock: 0,
    minRequiredStock: 10,
    description: "Official G.C.E. Ordinary Level Science past examination papers with comprehensive marking schemes and model step answers.",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    publishedYear: 2024,
    publisher: "DoE Publications"
  },
  {
    isbn: "978-955-21-0017-2",
    title: "A/L Biology Past Papers & Model Answers",
    author: "National Institute of Education",
    category: "Past Papers",
    price: 1350.00,
    quantityInStock: 30,
    minRequiredStock: 12,
    description: "G.C.E. A/L Biology past papers from 2012 to 2023 categorized by syllabus units with resource book references.",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&q=80",
    publishedYear: 2024,
    publisher: "NIE Sri Lanka"
  },

  // --- MEDICAL ---
  {
    isbn: "978-955-21-0006-6",
    title: "Clinical Medicine Essentials",
    author: "Dr. Kumar & Clark",
    category: "Medical",
    price: 4500.00,
    quantityInStock: 25,
    minRequiredStock: 5,
    description: "Essential medical reference covering diagnosis, pathology, clinical examinations and pharmacology for healthcare professionals.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd3?w=500&q=80",
    publishedYear: 2021,
    publisher: "Elsevier Medical"
  },
  {
    isbn: "978-955-21-0011-0",
    title: "Guyton and Hall Textbook of Medical Physiology",
    author: "John E. Hall",
    category: "Medical",
    price: 6800.00,
    quantityInStock: 0,
    minRequiredStock: 5,
    description: "The world's leading medical physiology text, presenting complex principles in clear language with vibrant clinical illustrations.",
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80",
    publishedYear: 2020,
    publisher: "Saunders"
  },
  {
    isbn: "978-955-21-0018-9",
    title: "Gray's Anatomy for Students",
    author: "Richard Drake",
    category: "Medical",
    price: 8500.00,
    quantityInStock: 8,
    minRequiredStock: 4,
    description: "Clinically relevant anatomical resource featuring high-yield diagrams, surface anatomy, and clinical imaging.",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80",
    publishedYear: 2023,
    publisher: "Churchill Livingstone"
  },

  // --- ACADEMIC ---
  {
    isbn: "978-955-21-0009-7",
    title: "Advanced Physics Theory",
    author: "Prof. K. Tennakoon",
    category: "Academic",
    price: 2100.00,
    quantityInStock: 18,
    minRequiredStock: 8,
    description: "In-depth undergraduate physics manual covering mechanics, wave theory, quantum principles and electromagnetic fields.",
    coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80",
    publishedYear: 2022,
    publisher: "University Science Press"
  },
  {
    isbn: "978-955-21-0019-6",
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen",
    category: "Academic",
    price: 5400.00,
    quantityInStock: 12,
    minRequiredStock: 5,
    description: "The universally revered standard handbook for computer science algorithms, data structures, and computational complexity.",
    coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&q=80",
    publishedYear: 2022,
    publisher: "MIT Press"
  },

  // --- HISTORICAL & CLASSIC ---
  {
    isbn: "978-955-21-0020-2",
    title: "A History of Sri Lanka",
    author: "Prof. K.M. de Silva",
    category: "Historical & Classic",
    price: 1850.00,
    quantityInStock: 16,
    minRequiredStock: 6,
    description: "The definitive scholarly historical chronicle of Sri Lanka from ancient Anuradhapura to contemporary constitutional eras.",
    coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&q=80",
    publishedYear: 2005,
    publisher: "Vijitha Yapa Publications"
  },
  {
    isbn: "978-955-21-0021-9",
    title: "Mahavamsa - The Great Chronicle",
    author: "Mahanama Thero (Tr. Wilhelm Geiger)",
    category: "Historical & Classic",
    price: 2400.00,
    quantityInStock: 10,
    minRequiredStock: 5,
    description: "Ancient epic historical chronicle documenting the monarchs, Buddhist heritage, and legendary foundation of Sri Lanka.",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&q=80",
    publishedYear: 2018,
    publisher: "Buddhist Cultural Centre"
  }
];

const sampleOrders = [
  {
    orderId: "ORD-8918",
    customer: {
      name: "Ruwan Fernando",
      email: "ruwan.fernando@gmail.com",
      phone: "+94 77 123 4567",
      address: "No. 45, Temple Road",
      city: "Galle"
    },
    items: [
      {
        title: "Amba Yahaluwo",
        author: "T.B. Ilangaratne",
        price: 550.00,
        quantity: 1
      }
    ],
    totalAmount: 550.00,
    status: "Cancelled",
    paymentMethod: "Cash on Delivery"
  },
  {
    orderId: "ORD-8919",
    customer: {
      name: "Kavindu Perera",
      email: "kavindu.p@horizoncampus.edu.lk",
      phone: "+94 71 892 3412",
      address: "12/A, Kandy Road",
      city: "Malabe"
    },
    items: [
      {
        title: "Clinical Medicine Essentials",
        author: "Dr. Kumar & Clark",
        price: 4500.00,
        quantity: 1
      }
    ],
    totalAmount: 4500.00,
    status: "Pending",
    paymentMethod: "Bank Transfer"
  },
  {
    orderId: "ORD-8920",
    customer: {
      name: "Sanduni Jayawardena",
      email: "sanduni.j@yahoo.com",
      phone: "+94 76 543 2109",
      address: "78, Flower Road",
      city: "Colombo 07"
    },
    items: [
      {
        title: "Madol Doova",
        author: "Martin Wickramasinghe",
        price: 650.00,
        quantity: 1
      },
      {
        title: "Gamperaliya",
        author: "Martin Wickramasinghe",
        price: 850.00,
        quantity: 1
      }
    ],
    totalAmount: 1500.00,
    status: "Delivered",
    paymentMethod: "Credit/Debit Card"
  },
  {
    orderId: "ORD-8921",
    customer: {
      name: "Nimal Wickramasinghe",
      email: "nimal.w@gmail.com",
      phone: "+94 72 345 6789",
      address: "Station Road",
      city: "Kurunegala"
    },
    items: [
      {
        title: "A/L Combined Maths Past Papers (15 Years)",
        author: "Department of Examinations",
        price: 1200.00,
        quantity: 1
      }
    ],
    totalAmount: 1200.00,
    status: "Shipped",
    paymentMethod: "Cash on Delivery"
  }
];

async function seedDatabase() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pothgamuDB";
  console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("Connected to MongoDB successfully!");

    // Clear existing data
    await Category.deleteMany({});
    await Book.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});
    console.log("Existing collections cleared.");

    // Insert Admin User
    await User.create({
      name: "System Administrator",
      username: "admin",
      email: "admin@pothgamu.lk",
      password: "admin123",
      role: "admin"
    });
    console.log("Admin user seeded: admin@pothgamu.lk / admin123");

    // Insert categories
    const categories = await Category.insertMany(sampleCategories);
    console.log(`Inserted ${categories.length} categories.`);

    // Insert books
    const books = await Book.insertMany(sampleBooks);
    console.log(`Inserted ${books.length} books.`);

    // Insert orders (link bookIds where applicable)
    const ordersWithLinks = sampleOrders.map(order => {
      const matchedBook = books.find(b => b.title === order.items[0].title);
      if (matchedBook) {
        order.items[0].bookId = matchedBook._id;
      }
      return order;
    });

    const orders = await Order.insertMany(ordersWithLinks);
    console.log(`Inserted ${orders.length} orders.`);

    console.log("\n*** Database seeding completed successfully! ***");
    process.exit(0);
  } catch (err) {
    console.warn("MongoDB connection failed during seed script:", err.message);
    console.log("Falling back to local data file initialization...");
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(dataDir, 'books.json'), JSON.stringify(sampleBooks, null, 2));
    fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(sampleCategories, null, 2));
    fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(sampleOrders, null, 2));
    console.log("Local JSON fallback files seeded successfully in backend/data/!");
    process.exit(0);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleCategories, sampleBooks, sampleOrders };
