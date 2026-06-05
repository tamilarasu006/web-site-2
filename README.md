# FreshGlobal Trade Co. E-Commerce Platform

A complete, fully functional e-commerce website for importing and exporting fresh products (fruits, vegetables, seafood, meat, dairy, and frozen goods).

## Features

### Customer Features
- **Product Catalog**: 20 sample products across 6 categories with filtering by origin, price, certification, and seasonality
- **Search**: Auto-suggest search bar
- **Product Details**: Full specifications including origin, certifications, shelf life, storage temp, lead time, MOQ
- **Shipping Calculator**: Real-time cost estimation by destination and weight with temperature-controlled option
- **Shopping Cart**: Add/remove items, update quantities, shipping calculation
- **Checkout**: 3-step process (Shipping → Payment → Review) with multiple payment methods
- **User Accounts**: Registration/Login for Individual and Business buyers
- **B2B Pricing**: Automatic volume discounts for business accounts
- **Wishlist**: Save products for later
- **Order Tracking**: View order history and tracking numbers
- **Responsive Design**: Works on desktop, tablet, and mobile

### Admin Features
- **Order Management**: View all orders, update status (pending → processing → shipped → delivered)
- **Inventory Management**: Auto-stock updates, low stock alerts
- **Product Management**: Add, edit, delete products
- **Export**: Download orders as CSV

### Pages
- Home (hero, categories, featured, seasonal, why us, certifications)
- Products (with filters)
- Product Detail (with tabs, shipping calculator)
- Cart & Checkout
- Login & Register (Individual/Business)
- Dashboard & Orders
- Wishlist
- About Us (company story, quality control, team)
- Contact Us (form, phone, email, WhatsApp, offices)
- FAQ (10 common questions)
- Admin Panel

## Tech Stack

- **Frontend**: React 18, React Router 6, CSS3
- **State Management**: React Context + useReducer pattern
- **Storage**: LocalStorage (persists cart, wishlist, orders, user session)
- **Data**: 20 sample products with real Unsplash images
- **Architecture**: Single Page Application (SPA)

## Project Structure

```
freshglobal-ecommerce/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main application (all components & pages)
│   ├── App.css         # Complete stylesheet
│   ├── index.js        # Entry point
│   └── index.css       # Base styles
├── .env.example        # Environment variables template
├── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# 1. Create the project directory and navigate into it
mkdir freshglobal-ecommerce
cd freshglobal-ecommerce

# 2. Copy all provided files into the structure shown above

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

The app will open at `http://localhost:3000`

### Admin Access
- Login with: `admin@freshglobal.com` / any password
- This unlocks the Admin Panel link in the navigation

## Backend Integration Guide

This frontend is architected to connect to a real backend. Here's where to integrate:

### 1. Authentication (`login()`, `register()` in AppContext)
**Current**: Mock authentication with localStorage
**Replace with**: API calls to your Node.js/Express or Python/Django backend
```javascript
// Replace this:
const login = (email, password, userType) => {
  const mockUser = { ... };
  setUser(mockUser);
};

// With this:
const login = async (email, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  setUser(data.user);
  localStorage.setItem('token', data.token);
};
```

### 2. Products (`products` state)
**Current**: Static sample data
**Replace with**: Fetch from database
```javascript
useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

### 3. Orders (`placeOrder()`)
**Current**: Saves to localStorage
**Replace with**: POST to backend API
```javascript
const placeOrder = async (orderData) => {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(orderData)
  });
  return await res.json();
};
```

### 4. Cart/Wishlist
**Current**: localStorage only
**Replace with**: Sync with user account in database

### Recommended Backend Stack
- **Node.js**: Express + MongoDB (Mongoose) or PostgreSQL (Sequelize/Prisma)
- **Python**: Django REST Framework + PostgreSQL, or Flask + SQLAlchemy
- **Authentication**: JWT tokens, bcrypt for password hashing
- **Payments**: Stripe for cards, PayPal SDK, manual bank transfer tracking

## Design System

- **Primary**: `#2d7a3e` (Fresh Green)
- **Secondary**: `#f97316` (Orange Accent)
- **Background**: `#ffffff` / `#f9fafb`
- **Text**: `#1f2937` / `#6b7280`
- **Font**: System UI stack (Segoe UI, Roboto, etc.)
- **Border Radius**: 8px (standard), 16px (large cards)
- **Shadows**: Subtle layered shadows for depth

## License

MIT License - Free for commercial use

## Support

For questions or custom development, contact: info@freshglobal.com
