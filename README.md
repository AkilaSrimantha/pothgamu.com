# PothGamu.lk — Online Bookstore E-Commerce Platform
**Horizon Campus — IT32053 (Group 16) | Interim Progress Project (CA 02)**

---

## 📖 Overview / හැඳින්වීම
**PothGamu.lk** is a full-stack MERN-compatible e-commerce bookstore application developed for Sri Lankan readers. It incorporates an aesthetic inspired by Sri Lankan ola-leaf manuscripts (*පුස්කොළ පොත්*), cultural colors (aged paper, deep teal library ink, cinnamon red, turmeric gold), and modern digital convenience.

### Features
1. **Customer Storefront (`http://localhost:5173`)**:
   - Modern cultural header with Sri Lankan identity and search bar.
   - Interactive hero banner with ola-leaf manuscript feature badge.
   - **LeafBind** SVG separator honoring traditional ola-leaf binding cords.
   - Category filtering (*Novel, Children, Past Papers, Medical, Academic, etc.*).
   - Dynamic book catalog with cover images, live stock indicators, and price tags.
   - Book detail popup modal with ISBN, publisher, and synopsis.
   - Interactive shopping cart drawer with quantity adjustment.
   - Full checkout modal with shipping address and Sri Lankan payment methods (COD, Bank Transfer, Card).
   - Live Order Tracking system by Order ID (e.g. `ORD-8918`).
   - Wishlist functionality.

2. **Admin Management Console (`http://localhost:5173` -> Click 'Admin Login')**:
   - **Secure Authentication**: Admin credentials required to access the dashboard.
     - **Default Username:** `admin` හෝ `admin@pothgamu.lk`
     - **Default Password:** `admin123`
   - **Dashboard**: Live KPIs for Total Books, Orders Placed, Total Revenue, and Out of Stock alerts.
   - **Book Library Catalog**: Inventory table with real-time stock pills, book editing, and deletion.
   - **+ Add New Book**: Modal with validation adhering to the MongoDB `$jsonSchema`.
   - **Categories & Genres**: View real-time book count per category and add new genres.
   - **Inventory & Stock Alerts**: "Immediate Restock Required" alert cards with 1-click `[Restock]` buttons.
   - **Customer Orders**: Track order fulfillment with status tabs (*All, Pending, Delivered, Cancelled*) and status switcher.
   - **Logout**: Secure session termination from header and sidebar.

3. **Backend API (`http://localhost:5000`)**:
   - Built with **Node.js, Express, and Mongoose**.
   - Connected to MongoDB (`pothgamuDB`) with a zero-config local fallback engine ensuring instant execution even without MongoDB installed locally!
   - Full RESTful endpoints for books, categories, orders, and analytics.

---

## 🚀 How to Run the Project / Project එක Run කරගන්නේ කෙසේද?

### Option 1: One-Click Run (ලෙහෙසිම ක්‍රමය)
Root directory එකේ ඇති `run.bat` file එක double-click කරන්න.
Backend (Port 5000) සහ Frontend (Port 5173) එකවරම run වේ.

### Option 2: Using NPM (Terminal හරහා)
Terminal එකක් open කර `d:\Project\E-com` directory එක තුලදී පහත command එක run කරන්න:

```bash
npm run dev
```

මෙමගින් Backend එක (`http://localhost:5000`) සහ Frontend එක (`http://localhost:5173`) එකවර start වේ.

---

### Separate Terminal Run (වෙන වෙනම Run කිරීමට අවශ්‍ය නම්):

**1. Backend Server Run කිරීම:**
```bash
cd d:\Project\E-com\backend
npm start
```
*Backend එක `http://localhost:5000` හි ක්‍රියාත්මක වේ.*

**2. Frontend App Run කිරීම:**
```bash
cd d:\Project\E-com\frontend
npm run dev
```
*Frontend එක `http://localhost:5173` හි ක්‍රියාත්මක වේ. Browser එකෙන් එම link එක open කරන්න.*

---

## 🗄️ Database Configuration (MongoDB)
- Schema Validator: `db-schema.json`
- Default Connection: `mongodb://127.0.0.1:27017/pothgamuDB` (හෝ `.env` හි ඇති `MONGO_URI`)
- **Zero-Config Resilience**: ඔබේ පරිගණකයේ MongoDB install කර නොමැති වුවද, system එකෙහි සකස් කර ඇති **Local JSON Persistence Engine** මගින් app එක කිසිදු error එකකින් තොරව ක්‍රියාත්මක වේ.
- Database Seed කිරීම සඳහා:
  ```bash
  npm run seed
  ```

---

## 📡 API Endpoints
- `GET /api/books` - සියලුම පොත් ලබා ගැනීම (category/search filter සමග)
- `GET /api/books/low-stock` - තොග අවම පොත් (Low Stock Alerts)
- `POST /api/books` - නව පොතක් ඇතුලත් කිරීම
- `PUT /api/books/:id` - පොතක තොරතුරු යාවත්කාලීන කිරීම
- `PATCH /api/books/:id/restock` - පොතක stock වැඩි කිරීම
- `DELETE /api/books/:id` - පොතක් ඉවත් කිරීම
- `GET /api/categories` - පොත් ප්‍රමාණය සහිත categories
- `POST /api/categories` - නව category එකක් එකතු කිරීම
- `GET /api/orders` - Orders ලැයිස්තුව (status filter සමග)
- `POST /api/orders` - නව order එකක් දැමීම (checkout)
- `PATCH /api/orders/:id/status` - Order status එක වෙනස් කිරීම
- `GET /api/analytics/dashboard` - Admin dashboard metrics
- `GET /api/health` - Server health status check

