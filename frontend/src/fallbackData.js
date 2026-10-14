export const sampleCategories = [
  'All',
  'Novel',
  'Children',
  'Past Papers',
  'Medical',
  'Academic',
  'Historical & Classic',
  'Educational & School'
];

export const sampleBooks = [
  {
    _id: "book-1",
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
    publisher: "Tisara Prakasakayo",
    averageRating: 4.9,
    totalReviews: 3,
    reviews: [
      {
        _id: "rev-1-1",
        userName: "Nimal Perera",
        rating: 5,
        comment: "Excellent print quality and fast delivery by PothGamu! Madol Doova brought back childhood memories.",
        verifiedPurchase: true,
        orderId: "ORD-8918",
        createdAt: "2026-03-20T10:15:00.000Z"
      },
      {
        _id: "rev-1-2",
        userName: "Sanduni Jayawardena",
        rating: 5,
        comment: "A true classic that every young reader must read. Very safely packaged.",
        verifiedPurchase: true,
        orderId: "ORD-8912",
        createdAt: "2026-03-25T14:30:00.000Z"
      },
      {
        _id: "rev-1-3",
        userName: "Chaminda Alwis",
        rating: 4.8,
        comment: "Original publication edition with crisp text. Value for money.",
        verifiedPurchase: true,
        orderId: "ORD-8901",
        createdAt: "2026-04-01T08:45:00.000Z"
      }
    ]
  },
  {
    _id: "book-2",
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
    publisher: "Sarasavi Publishers",
    averageRating: 5.0,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-2-1",
        userName: "Priyantha Jayasuriya",
        rating: 5,
        comment: "Unmatched depth in character portrayal. Martin Wickramasinghe at his absolute best.",
        verifiedPurchase: true,
        orderId: "ORD-8876",
        createdAt: "2026-03-12T16:20:00.000Z"
      },
      {
        _id: "rev-2-2",
        userName: "Dilani Kariyawasam",
        rating: 5,
        comment: "Must read for A/L Sinhala students. Super fast delivery in Colombo within 24 hrs.",
        verifiedPurchase: true,
        orderId: "ORD-8850",
        createdAt: "2026-03-18T11:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-3",
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
    publisher: "Santhawa Prakashana",
    averageRating: 4.8,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-3-1",
        userName: "Roshan Wickramasinghe",
        rating: 5,
        comment: "Touching story with raw emotional impact. One of the finest contemporary novels.",
        verifiedPurchase: true,
        orderId: "ORD-8799",
        createdAt: "2026-02-14T09:30:00.000Z"
      },
      {
        _id: "rev-3-2",
        userName: "Anoma Senanayake",
        rating: 4.5,
        comment: "Beautiful writing and authentic language.",
        verifiedPurchase: true,
        orderId: "ORD-8780",
        createdAt: "2026-02-28T18:15:00.000Z"
      }
    ]
  },
  {
    _id: "book-4",
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
    publisher: "Tisara Prakasakayo",
    averageRating: 4.7,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-4-1",
        userName: "Sujith Fernando",
        rating: 5,
        comment: "Brought back tears remembering the serene southern coastal village life.",
        verifiedPurchase: true,
        createdAt: "2026-01-20T12:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-5",
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
    publisher: "Pradeepa Publishers",
    averageRating: 4.6,
    totalReviews: 1,
    reviews: [
      {
        _id: "rev-5-1",
        userName: "Manel Wijeratne",
        rating: 4.6,
        comment: "Realistic depiction of rural family conflict. Great book.",
        verifiedPurchase: true,
        createdAt: "2026-03-05T14:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-6",
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
    publisher: "Tisara Prakasakayo",
    averageRating: 5.0,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-6-1",
        userName: "Dr. Upul Senarath",
        rating: 5,
        comment: "A pinnacle of Sri Lankan psychological literature. Brilliant.",
        verifiedPurchase: true,
        createdAt: "2026-03-10T10:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-7",
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
    publisher: "Sarasavi Publishers",
    averageRating: 4.8,
    totalReviews: 1,
    reviews: [
      {
        _id: "rev-7-1",
        userName: "Harsha De Silva",
        rating: 5,
        comment: "Great social reflection on modern industrial transition in Ceylon.",
        verifiedPurchase: true,
        createdAt: "2026-03-01T15:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-8",
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
    publisher: "Dayawansa Jayakody & Co.",
    averageRating: 5.0,
    totalReviews: 3,
    reviews: [
      {
        _id: "rev-8-1",
        userName: "Kumari Bandara",
        rating: 5,
        comment: "Bought this for my 10-year-old son, he finished it in two days and loved it!",
        verifiedPurchase: true,
        orderId: "ORD-8918",
        createdAt: "2026-03-15T11:20:00.000Z"
      },
      {
        _id: "rev-8-2",
        userName: "Pradeep Weerasinghe",
        rating: 5,
        comment: "Pure nostalgia. T.B. Ilangaratne teaches real life values.",
        verifiedPurchase: true,
        createdAt: "2026-03-19T09:40:00.000Z"
      }
    ]
  },
  {
    _id: "book-9",
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
    publisher: "M.D. Gunasena",
    averageRating: 4.9,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-9-1",
        userName: "Tharaka Mendis",
        rating: 5,
        comment: "Pure Sinhala idiom and wonderful wit! Essential for primary school children.",
        verifiedPurchase: true,
        createdAt: "2026-02-18T13:30:00.000Z"
      }
    ]
  },
  {
    _id: "book-10",
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
    publisher: "M.D. Gunasena",
    averageRating: 4.8,
    totalReviews: 1,
    reviews: [
      {
        _id: "rev-10-1",
        userName: "Gimhani Jayakody",
        rating: 5,
        comment: "Timeless humor and wonderful vocabulary.",
        verifiedPurchase: true,
        createdAt: "2026-03-02T10:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-11",
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
    publisher: "Dayawansa Jayakody & Co.",
    averageRating: 4.7,
    totalReviews: 1,
    reviews: [
      {
        _id: "rev-11-1",
        userName: "Subhashini Peiris",
        rating: 5,
        comment: "Great moral story for young teens.",
        verifiedPurchase: true,
        createdAt: "2026-02-22T16:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-12",
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
    publisher: "State Printing Corporation",
    averageRating: 5.0,
    totalReviews: 3,
    reviews: [
      {
        _id: "rev-12-1",
        userName: "Akash Dissanayake",
        rating: 5,
        comment: "Essential for every A/L Physical Science student! Clear step-by-step marking schemes.",
        verifiedPurchase: true,
        orderId: "ORD-8910",
        createdAt: "2026-03-28T18:00:00.000Z"
      },
      {
        _id: "rev-12-2",
        userName: "Buddhika Gunawardena",
        rating: 5,
        comment: "Original papers without missing diagrams. Delivered safely.",
        verifiedPurchase: true,
        createdAt: "2026-03-29T10:15:00.000Z"
      }
    ]
  },
  {
    _id: "book-13",
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
    publisher: "DoE Publications",
    averageRating: 4.8,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-13-1",
        userName: "Nethmi Hansika",
        rating: 5,
        comment: "Very helpful for O/L preparation. Covers every single question from 2015-2023.",
        verifiedPurchase: true,
        createdAt: "2026-03-14T11:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-14",
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
    publisher: "NIE Sri Lanka",
    averageRating: 4.9,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-14-1",
        userName: "Sachini Ranatunga",
        rating: 5,
        comment: "Full color diagrams and strict NIE resource book syllabus alignment. Perfect for bio stream.",
        verifiedPurchase: true,
        createdAt: "2026-03-22T15:20:00.000Z"
      }
    ]
  },
  {
    _id: "book-15",
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
    publisher: "Elsevier Medical",
    averageRating: 5.0,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-15-1",
        userName: "Dr. Janaka Kulatunga",
        rating: 5,
        comment: "Gold standard reference book. Highly recommended for clinical students.",
        verifiedPurchase: true,
        createdAt: "2026-02-11T12:00:00.000Z"
      }
    ]
  },
  {
    _id: "book-16",
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
    publisher: "Saunders",
    averageRating: 4.9,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-16-1",
        userName: "Madushan Ekanayake",
        rating: 5,
        comment: "Indispensable book for MBBS students. Fast express delivery from PothGamu.",
        verifiedPurchase: true,
        createdAt: "2026-03-03T17:40:00.000Z"
      }
    ]
  },
  {
    _id: "book-17",
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
    publisher: "Churchill Livingstone",
    averageRating: 5.0,
    totalReviews: 1,
    reviews: [
      {
        _id: "rev-17-1",
        userName: "Dinithi Samaraweera",
        rating: 5,
        comment: "Crystal clear anatomy diagrams. Authentic international edition.",
        verifiedPurchase: true,
        createdAt: "2026-03-16T14:10:00.000Z"
      }
    ]
  },
  {
    _id: "book-18",
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
    publisher: "University Science Press",
    averageRating: 4.8,
    totalReviews: 1,
    reviews: [
      {
        _id: "rev-18-1",
        userName: "Isuru Karunaratne",
        rating: 5,
        comment: "Very comprehensive explanations of quantum physics and electrodynamics.",
        verifiedPurchase: true,
        createdAt: "2026-02-19T09:25:00.000Z"
      }
    ]
  },
  {
    _id: "book-19",
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
    publisher: "MIT Press",
    averageRating: 5.0,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-19-1",
        userName: "Dhanushka Gamage",
        rating: 5,
        comment: "The Bible of Computer Science. A must have for every software engineer.",
        verifiedPurchase: true,
        createdAt: "2026-03-27T16:50:00.000Z"
      }
    ]
  },
  {
    _id: "book-20",
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
    publisher: "Vijitha Yapa Publications",
    averageRating: 4.9,
    totalReviews: 2,
    reviews: [
      {
        _id: "rev-20-1",
        userName: "Rohana Pathirana",
        rating: 5,
        comment: "Most balanced and detailed historical narrative on Sri Lanka. Essential reading.",
        verifiedPurchase: true,
        createdAt: "2026-03-08T11:15:00.000Z"
      }
    ]
  },
  {
    _id: "book-21",
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
    publisher: "Buddhist Cultural Centre",
    averageRating: 5.0,
    totalReviews: 3,
    reviews: [
      {
        _id: "rev-21-1",
        userName: "Venerable Medhananda",
        rating: 5,
        comment: "High quality hardcover edition. Complete with historical footnotes and Geiger translation.",
        verifiedPurchase: true,
        createdAt: "2026-03-17T09:00:00.000Z"
      },
      {
        _id: "rev-21-2",
        userName: "Sanath Jayawardena",
        rating: 5,
        comment: "Invaluable national treasure. PothGamu delivered in pristine condition.",
        verifiedPurchase: true,
        createdAt: "2026-03-21T13:45:00.000Z"
      }
    ]
  }
];
