import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import './App.css';

// ============================================
// CONTEXT & DATA
// ============================================
const AppContext = createContext();
const useApp = () => useContext(AppContext);

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Alphonso Mangoes", category: "Fruits", origin: "India", price: 5.00, unit: "kg", quantity: 500, certification: ["Organic", "Fair Trade"], shelfLife: "14 days", storageTemp: "4-8°C", leadTime: 2, moq: 50, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400", description: "Premium Alphonso mangoes from Ratnagiri, Maharashtra. Known as the 'King of Mangoes' for their rich flavor and aroma.", season: "April-June", rating: 4.8, reviews: 124, b2bDiscount: 0.15 },
  { id: 2, name: "Norwegian Atlantic Salmon", category: "Seafood", origin: "Norway", price: 12.00, unit: "kg", quantity: 200, certification: ["ASC Certified", "Sustainable"], shelfLife: "7 days", storageTemp: "0-2°C", leadTime: 3, moq: 20, image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400", description: "Fresh Atlantic salmon from the cold, clear waters of Norway. Rich in Omega-3 fatty acids.", season: "Year-round", rating: 4.9, reviews: 89, b2bDiscount: 0.10 },
  { id: 3, name: "Dutch Vine Tomatoes", category: "Vegetables", origin: "Netherlands", price: 3.00, unit: "kg", quantity: 1000, certification: ["Global G.A.P."], shelfLife: "10 days", storageTemp: "8-12°C", leadTime: 1, moq: 100, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", description: "Sweet, vine-ripened tomatoes grown in advanced Dutch greenhouses using hydroponic technology.", season: "Year-round", rating: 4.6, reviews: 203, b2bDiscount: 0.20 },
  { id: 4, name: "Vietnamese Dragon Fruit", category: "Fruits", origin: "Vietnam", price: 8.00, unit: "kg", quantity: 300, certification: ["Organic"], shelfLife: "21 days", storageTemp: "5-10°C", leadTime: 4, moq: 30, image: "https://images.unsplash.com/photo-1527325678964-54921661f888?w=400", description: "Vibrant pink and white dragon fruit from the Mekong Delta. Mildly sweet with kiwi-like texture.", season: "June-November", rating: 4.5, reviews: 67, b2bDiscount: 0.12 },
  { id: 5, name: "Australian Wagyu Beef", category: "Meat & Poultry", origin: "Australia", price: 45.00, unit: "kg", quantity: 50, certification: ["Halal", "Premium Grade"], shelfLife: "30 days (frozen)", storageTemp: "-18°C", leadTime: 5, moq: 10, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=400", description: "Marble score 8-9 Wagyu beef from premium Australian farms. Exceptional tenderness and flavor.", season: "Year-round", rating: 4.9, reviews: 45, b2bDiscount: 0.08 },
  { id: 6, name: "New Zealand Lamb Chops", category: "Meat & Poultry", origin: "New Zealand", price: 28.00, unit: "kg", quantity: 80, certification: ["Free Range", "Halal"], shelfLife: "25 days (frozen)", storageTemp: "-18°C", leadTime: 4, moq: 15, image: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?w=400", description: "Grass-fed lamb from the pristine pastures of New Zealand. Tender and naturally flavorful.", season: "Year-round", rating: 4.7, reviews: 78, b2bDiscount: 0.10 },
  { id: 7, name: "Greek Feta Cheese", category: "Dairy", origin: "Greece", price: 15.00, unit: "kg", quantity: 150, certification: ["PDO", "Organic"], shelfLife: "90 days", storageTemp: "2-4°C", leadTime: 3, moq: 20, image: "https://images.unsplash.com/photo-1624806992066-5ffcf7ca1866?w=400", description: "Authentic Greek feta made from sheep and goat milk. Creamy, tangy, and perfect for salads.", season: "Year-round", rating: 4.6, reviews: 112, b2bDiscount: 0.15 },
  { id: 8, name: "Japanese Scallops", category: "Seafood", origin: "Japan", price: 35.00, unit: "kg", quantity: 60, certification: ["Sustainable", "MSC"], shelfLife: "14 days (frozen)", storageTemp: "-18°C", leadTime: 5, moq: 10, image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400", description: "Hokkaido scallops known for their sweet, delicate flavor and firm texture. Sashimi-grade quality.", season: "November-March", rating: 4.8, reviews: 56, b2bDiscount: 0.10 },
  { id: 9, name: "Spanish Manchego Cheese", category: "Dairy", origin: "Spain", price: 22.00, unit: "kg", quantity: 120, certification: ["PDO"], shelfLife: "180 days", storageTemp: "8-12°C", leadTime: 2, moq: 15, image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400", description: "Aged Manchego cheese from La Mancha region. Nutty, caramel notes with a firm texture.", season: "Year-round", rating: 4.7, reviews: 94, b2bDiscount: 0.12 },
  { id: 10, name: "Thai Jasmine Rice", category: "Frozen Foods", origin: "Thailand", price: 4.00, unit: "kg", quantity: 2000, certification: ["Organic", "Fair Trade"], shelfLife: "365 days", storageTemp: "Room temp", leadTime: 1, moq: 500, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", description: "Fragrant long-grain jasmine rice from Northeast Thailand. Perfect accompaniment to Asian cuisine.", season: "Year-round", rating: 4.5, reviews: 267, b2bDiscount: 0.25 },
  { id: 11, name: "Peruvian Asparagus", category: "Vegetables", origin: "Peru", price: 6.50, unit: "kg", quantity: 400, certification: ["Global G.A.P.", "Fair Trade"], shelfLife: "12 days", storageTemp: "0-2°C", leadTime: 3, moq: 40, image: "https://images.unsplash.com/photo-1515471209610-dae1c92d8777?w=400", description: "Tender green asparagus from the Ica Valley. Harvested at optimal maturity for peak flavor.", season: "September-December", rating: 4.6, reviews: 83, b2bDiscount: 0.15 },
  { id: 12, name: "Italian Prosciutto di Parma", category: "Meat & Poultry", origin: "Italy", price: 55.00, unit: "kg", quantity: 40, certification: ["PDO", "DOP"], shelfLife: "120 days", storageTemp: "8-12°C", leadTime: 2, moq: 5, image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400", description: "Aged 24 months in Parma, Italy. Silky texture with a perfect balance of sweet and salty.", season: "Year-round", rating: 4.9, reviews: 34, b2bDiscount: 0.05 },
  { id: 13, name: "Ecuadorian Bananas", category: "Fruits", origin: "Ecuador", price: 2.50, unit: "kg", quantity: 3000, certification: ["Rainforest Alliance", "Fair Trade"], shelfLife: "14 days", storageTemp: "13-14°C", leadTime: 1, moq: 1000, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", description: "Premium Cavendish bananas from the coastal regions of Ecuador. Consistent quality and ripeness.", season: "Year-round", rating: 4.4, reviews: 312, b2bDiscount: 0.30 },
  { id: 14, name: "Canadian Lobster", category: "Seafood", origin: "Canada", price: 40.00, unit: "kg", quantity: 30, certification: ["MSC", "Sustainable"], shelfLife: "3 days (live)", storageTemp: "0-2°C", leadTime: 2, moq: 5, image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400", description: "Live Atlantic lobster from the cold waters of Nova Scotia. Sweet, succulent meat.", season: "May-December", rating: 4.8, reviews: 42, b2bDiscount: 0.08 },
  { id: 15, name: "French Butter (Beurre de Baratte)", category: "Dairy", origin: "France", price: 18.00, unit: "kg", quantity: 100, certification: ["AOP", "Organic"], shelfLife: "60 days", storageTemp: "2-4°C", leadTime: 3, moq: 20, image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400", description: "Artisanal churned butter from Normandy. 82% fat content with a distinctive cultured flavor.", season: "Year-round", rating: 4.7, reviews: 67, b2bDiscount: 0.10 },
  { id: 16, name: "Frozen Edamame", category: "Frozen Foods", origin: "China", price: 7.00, unit: "kg", quantity: 500, certification: ["Organic", "Non-GMO"], shelfLife: "730 days", storageTemp: "-18°C", leadTime: 1, moq: 100, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400", description: "Flash-frozen young soybeans picked at peak freshness. Ready to steam in minutes.", season: "Year-round", rating: 4.5, reviews: 145, b2bDiscount: 0.20 },
  { id: 17, name: "Moroccan Dates (Medjool)", category: "Fruits", origin: "Morocco", price: 10.00, unit: "kg", quantity: 250, certification: ["Organic", "Fair Trade"], shelfLife: "180 days", storageTemp: "Room temp", leadTime: 4, moq: 25, image: "https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=400", description: "Large, caramel-like Medjool dates from the palm groves of Morocco. Nature's candy.", season: "September-January", rating: 4.8, reviews: 98, b2bDiscount: 0.12 },
  { id: 18, name: "Brazilian Coffee Beans", category: "Frozen Foods", origin: "Brazil", price: 12.00, unit: "kg", quantity: 800, certification: ["Fair Trade", "Rainforest Alliance"], shelfLife: "365 days", storageTemp: "Room temp", leadTime: 2, moq: 50, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400", description: "Single-origin Arabica from Minas Gerais. Chocolate and nut notes with low acidity.", season: "Year-round", rating: 4.6, reviews: 178, b2bDiscount: 0.18 },
  { id: 19, name: "Scottish Smoked Salmon", category: "Seafood", origin: "United Kingdom", price: 30.00, unit: "kg", quantity: 70, certification: ["RSPCA Assured", "Organic"], shelfLife: "21 days", storageTemp: "0-4°C", leadTime: 2, moq: 10, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400", description: "Traditionally smoked over oak in the Scottish Highlands. Silky texture with a delicate smoky flavor.", season: "Year-round", rating: 4.9, reviews: 76, b2bDiscount: 0.10 },
  { id: 20, name: "Belgian Endive", category: "Vegetables", origin: "Belgium", price: 9.00, unit: "kg", quantity: 180, certification: ["Global G.A.P."], shelfLife: "21 days", storageTemp: "0-2°C", leadTime: 2, moq: 20, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400", description: "Crisp, slightly bitter Belgian endive grown in dark forcing sheds. Elegant addition to salads.", season: "October-April", rating: 4.4, reviews: 54, b2bDiscount: 0.15 }
];

const COUNTRIES = ["India", "Norway", "Netherlands", "Vietnam", "Australia", "New Zealand", "Greece", "Japan", "Spain", "Thailand", "Peru", "Italy", "Ecuador", "Canada", "France", "China", "Morocco", "Brazil", "United Kingdom", "Belgium"];

const SHIPPING_RATES = {
  "USA": { base: 25, perKg: 3.5 }, "UK": { base: 20, perKg: 2.8 },
  "Germany": { base: 22, perKg: 2.5 }, "France": { base: 22, perKg: 2.5 },
  "UAE": { base: 30, perKg: 4.0 }, "Japan": { base: 35, perKg: 5.0 },
  "Singapore": { base: 28, perKg: 3.8 }, "Australia": { base: 32, perKg: 4.5 },
  "Canada": { base: 26, perKg: 3.2 }, "Netherlands": { base: 18, perKg: 2.2 },
  "India": { base: 15, perKg: 1.5 }, "China": { base: 28, perKg: 3.5 },
  "Brazil": { base: 30, perKg: 4.0 }, "South Africa": { base: 35, perKg: 4.5 },
  "Saudi Arabia": { base: 32, perKg: 4.2 }
};

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => { const saved = localStorage.getItem('freshglobal_user'); return saved ? JSON.parse(saved) : null; });
  const [cart, setCart] = useState(() => { const saved = localStorage.getItem('freshglobal_cart'); return saved ? JSON.parse(saved) : []; });
  const [wishlist, setWishlist] = useState(() => { const saved = localStorage.getItem('freshglobal_wishlist'); return saved ? JSON.parse(saved) : []; });
  const [orders, setOrders] = useState(() => { const saved = localStorage.getItem('freshglobal_orders'); return saved ? JSON.parse(saved) : []; });
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'All', origin: 'All', priceMin: 0, priceMax: 100, certification: 'All', seasonal: 'All' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => { localStorage.setItem('freshglobal_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('freshglobal_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('freshglobal_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('freshglobal_user', JSON.stringify(user)); }, [user]);

  const showNotification = (message, type = 'success') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); };

  const addToCart = (product, qty, isTempControlled = false) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) { setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item)); }
    else { setCart([...cart, { ...product, qty, isTempControlled }]); }
    showNotification(`${product.name} added to cart`);
  };
  const removeFromCart = (id) => { setCart(cart.filter(item => item.id !== id)); showNotification('Item removed'); };
  const updateCartQty = (id, qty) => { if (qty <= 0) removeFromCart(id); else setCart(cart.map(item => item.id === id ? { ...item, qty } : item)); };
  const toggleWishlist = (product) => {
    if (wishlist.find(w => w.id === product.id)) { setWishlist(wishlist.filter(w => w.id !== product.id)); showNotification('Removed from wishlist'); }
    else { setWishlist([...wishlist, product]); showNotification('Added to wishlist'); }
  };
  const calculateShipping = (country, weight, isTempControlled = false) => {
    const rate = SHIPPING_RATES[country] || { base: 40, perKg: 5 };
    let cost = rate.base + (weight * rate.perKg); if (isTempControlled) cost *= 1.5;
    return Math.round(cost * 100) / 100;
  };
  const placeOrder = (orderData) => {
    const newOrder = { id: 'ORD-' + Date.now(), ...orderData, status: 'pending', date: new Date().toISOString(), tracking: 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase() };
    setOrders([newOrder, ...orders]);
    setProducts(products.map(p => { const orderedItem = orderData.items.find(i => i.id === p.id); if (orderedItem) return { ...p, quantity: p.quantity - orderedItem.qty }; return p; }));
    setCart([]); showNotification('Order placed successfully!'); return newOrder;
  };
  const updateOrderStatus = (orderId, status) => { setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o)); showNotification('Status updated'); };
  const updateProduct = (id, updates) => { setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p)); showNotification('Product updated'); };
  const deleteProduct = (id) => { setProducts(products.filter(p => p.id !== id)); showNotification('Product deleted'); };
  const addProduct = (product) => { const newProduct = { ...product, id: Math.max(...products.map(p => p.id)) + 1 }; setProducts([...products, newProduct]); showNotification('Product added'); };
  const login = (email, password, userType) => {
    const mockUser = { id: 'user-' + Date.now(), email, name: email.split('@')[0], type: userType, company: userType === 'business' ? 'Global Foods Ltd.' : null, addresses: [] };
    setUser(mockUser); if (email === 'admin@tamilarasuenterprises.com') setIsAdmin(true); showNotification('Welcome back!');
  };
  const register = (data) => { const mockUser = { id: 'user-' + Date.now(), ...data, addresses: [] }; setUser(mockUser); showNotification('Account created!'); };
  const logout = () => { setUser(null); setIsAdmin(false); showNotification('Logged out'); };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.origin.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === 'All' || p.category === filters.category;
      const matchesOrigin = filters.origin === 'All' || p.origin === filters.origin;
      const matchesPrice = p.price >= filters.priceMin && p.price <= filters.priceMax;
      const matchesCert = filters.certification === 'All' || p.certification.includes(filters.certification);
      const matchesSeason = filters.seasonal === 'All' || p.season === 'Year-round' || p.season.includes(filters.seasonal);
      return matchesSearch && matchesCategory && matchesOrigin && matchesPrice && matchesCert && matchesSeason;
    });
  }, [products, searchQuery, filters]);

  const cartTotal = cart.reduce((sum, item) => { const price = user?.type === 'business' ? item.price * (1 - (item.b2bDiscount || 0)) : item.price; return sum + (price * item.qty); }, 0);
  const cartWeight = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <AppContext.Provider value={{ user, cart, wishlist, orders, products, filteredProducts, isAdmin, searchQuery, setSearchQuery, filters, setFilters, addToCart, removeFromCart, updateCartQty, toggleWishlist, calculateShipping, placeOrder, updateOrderStatus, updateProduct, deleteProduct, addProduct, login, register, logout, cartTotal, cartWeight, notification, showNotification, COUNTRIES, SHIPPING_RATES }}>
      {children}
    </AppContext.Provider>
  );
};

// ============================================
// COMPONENTS
// ============================================
const Navbar = () => {
  const { user, cart, wishlist, searchQuery, setSearchQuery, logout, isAdmin } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo"><span className="logo-icon">🌿</span><span>TAMILARASU ENTERPRISES</span></Link>
        <div className="nav-search-desktop">
          <form onSubmit={(e) => { e.preventDefault(); navigate('/products'); }}>
            <input type="text" placeholder="Search products, origins..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            <button type="submit">🔍</button>
          </form>
          {searchQuery && (
            <div className="search-suggestions">
              {SAMPLE_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(p => (
                <div key={p.id} onClick={() => { navigate(`/product/${p.id}`); setSearchQuery(''); }}>{p.name} <span>{p.origin}</span></div>
              ))}
            </div>
          )}
        </div>
        <div className="nav-links">
          <Link to="/products">Products</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
          <Link to="/cart" className="nav-icon">🛒{cart.length > 0 && <span className="badge">{cart.length}</span>}</Link>
          <Link to="/wishlist" className="nav-icon">❤️{wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}</Link>
          {user ? (
            <div className="user-menu">
              <span onClick={() => setIsMenuOpen(!isMenuOpen)} className="user-name">👤 {user.name}</span>
              {isMenuOpen && (
                <div className="dropdown">
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}>Logout</button>
                </div>
              )}
            </div>
          ) : <Link to="/login" className="btn-primary">Login</Link>}
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </div>
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          <Link to="/cart" onClick={() => setIsMenuOpen(false)}>Cart ({cart.length})</Link>
          <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist ({wishlist.length})</Link>
          {user && <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>}
          {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <h3>🌿 TAMILARASU ENTERPRISES</h3>
        <p>Connecting the world with premium fresh produce since 2015.</p>
        <div className="social-links"><a href="#">📘</a><a href="#">📸</a><a href="#">🐦</a><a href="#">💼</a></div>
      </div>
      <div>
        <h4>Quick Links</h4>
        <Link to="/products">All Products</Link><Link to="/about">About Us</Link><Link to="/faq">FAQ</Link><Link to="/contact">Contact</Link>
      </div>
      <div>
        <h4>Categories</h4>
        <Link to="/products?cat=Fruits">Fruits</Link><Link to="/products?cat=Vegetables">Vegetables</Link><Link to="/products?cat=Seafood">Seafood</Link><Link to="/products?cat=Meat">Meat & Poultry</Link>
      </div>
      <div>
        <h4>Contact</h4>
        <p>📍 123 Trade Center, Rotterdam, Netherlands</p><p>📞 +31 10 123 4567</p><p>✉️ info@tamilarasuenterprises.com</p><p>💬 WhatsApp: +31 6 1234 5678</p>
      </div>
    </div>
    <div className="footer-bottom"><p>© 2026 TAMILARASU ENTERPRISES. All rights reserved.</p></div>
  </footer>
);

const Notification = ({ message, type }) => (
  <div className={`notification ${type}`}>{message}</div>
);

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist, user } = useApp();
  const navigate = useNavigate();
  const isWishlisted = wishlist.find(w => w.id === product.id);
  const price = user?.type === 'business' ? (product.price * (1 - product.b2bDiscount)).toFixed(2) : product.price.toFixed(2);
  return (
    <div className="product-card">
      <div className="product-image" onClick={() => navigate(`/product/${product.id}`)}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.certification.includes('Organic') && <span className="badge-organic">Organic</span>}
        <button className="wishlist-btn" onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}>{isWishlisted ? '❤️' : '🤍'}</button>
      </div>
      <div className="product-info">
        <span className="product-origin">📍 {product.origin}</span>
        <h3 onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
        <div className="product-meta"><span className="rating">⭐ {product.rating}</span><span className="lead-time">🚚 {product.leadTime} days</span></div>
        <div className="product-footer">
          <div className="price"><span className="price-value">${price}</span><span className="price-unit">/{product.unit}</span>{user?.type === 'business' && <span className="b2b-tag">B2B -{Math.round(product.b2bDiscount*100)}%</span>}</div>
          <button className="btn-add" onClick={() => addToCart(product, product.moq > 1 ? product.moq : 1)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PAGES
// ============================================
const HomePage = () => {
  const { products } = useApp();
  const navigate = useNavigate();
  const featured = products.slice(0, 4);
  const seasonal = products.filter(p => p.season !== 'Year-round').slice(0, 4);
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Fresh Produce, <span className="highlight">Global Quality</span></h1>
          <p>Import and export premium fruits, vegetables, seafood, meat, and dairy — delivered fresh to your door or business.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/products')} className="btn-primary btn-large">Browse Products</button>
            <button onClick={() => navigate('/register')} className="btn-secondary btn-large">Join as Business</button>
          </div>
          <div className="hero-stats"><div><strong>50+</strong> Countries</div><div><strong>20K+</strong> Products</div><div><strong>99.2%</strong> Fresh Rate</div><div><strong>24h</strong> Delivery</div></div>
        </div>
        <div className="hero-image"><img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800" alt="Fresh produce" /></div>
      </section>
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {["Fruits", "Vegetables", "Seafood", "Meat & Poultry", "Dairy", "Frozen Foods"].map(cat => (
            <div key={cat} className="category-card" onClick={() => navigate(`/products?cat=${cat}`)}>
              <div className="category-icon">{cat === "Fruits" && "🍎"}{cat === "Vegetables" && "🥦"}{cat === "Seafood" && "🦐"}{cat === "Meat & Poultry" && "🥩"}{cat === "Dairy" && "🧀"}{cat === "Frozen Foods" && "🧊"}</div>
              <h3>{cat}</h3><p>{products.filter(p => p.category === cat).length} products</p>
            </div>
          ))}
        </div>
      </section>
      <section className="featured-section">
        <h2>Featured Products</h2>
        <div className="products-grid">{featured.map(product => <ProductCard key={product.id} product={product} />)}</div>
      </section>
      <section className="seasonal-section">
        <h2>Seasonal Specials</h2><p>Limited-time offerings from current harvests</p>
        <div className="products-grid">{seasonal.map(product => <ProductCard key={product.id} product={product} />)}</div>
      </section>
      <section className="why-us">
        <h2>Why TAMILARASU ENTERPRISES?</h2>
        <div className="features-grid">
          <div className="feature-card"><div className="feature-icon">🌡️</div><h3>Temperature Controlled</h3><p>End-to-end cold chain logistics ensuring product freshness from farm to destination.</p></div>
          <div className="feature-card"><div className="feature-icon">✅</div><h3>Certified Quality</h3><p>Organic, Fair Trade, Global G.A.P., and Halal certifications available.</p></div>
          <div className="feature-card"><div className="feature-icon">🚚</div><h3>Global Shipping</h3><p>Air and sea freight options to 150+ countries with real-time tracking.</p></div>
          <div className="feature-card"><div className="feature-icon">💰</div><h3>B2B Pricing</h3><p>Volume discounts and custom pricing for restaurants, hotels, and distributors.</p></div>
        </div>
      </section>
      <section className="certifications">
        <h2>Our Certifications</h2>
        <div className="cert-grid"><div className="cert-item">🏆 ISO 22000</div><div className="cert-item">🌱 Organic Certified</div><div className="cert-item">🤝 Fair Trade</div><div className="cert-item">🌍 Global G.A.P.</div><div className="cert-item">☪️ Halal Certified</div><div className="cert-item">♻️ HACCP</div></div>
      </section>
    </div>
  );
};

const ProductsPage = () => {
  const { filteredProducts, filters, setFilters, COUNTRIES } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const certifications = ["All", "Organic", "Fair Trade", "Global G.A.P.", "Halal", "Sustainable", "MSC", "PDO"];
  const seasons = ["All", "Year-round", "Spring", "Summer", "Fall", "Winter"];
  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Products</h1><p>Premium fresh produce from around the world</p>
        <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>{showFilters ? 'Hide' : 'Show'} Filters</button>
      </div>
      <div className="products-layout">
        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filter-group"><label>Category</label><select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>{["All", "Fruits", "Vegetables", "Seafood", "Meat & Poultry", "Dairy", "Frozen Foods"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="filter-group"><label>Origin Country</label><select value={filters.origin} onChange={(e) => setFilters({...filters, origin: e.target.value})}><option value="All">All Countries</option>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="filter-group"><label>Price Range: ${filters.priceMin} - ${filters.priceMax}</label><input type="range" min="0" max="100" value={filters.priceMax} onChange={(e) => setFilters({...filters, priceMax: parseInt(e.target.value)})} /></div>
          <div className="filter-group"><label>Certification</label><select value={filters.certification} onChange={(e) => setFilters({...filters, certification: e.target.value})}>{certifications.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="filter-group"><label>Seasonal Availability</label><select value={filters.seasonal} onChange={(e) => setFilters({...filters, seasonal: e.target.value})}>{seasons.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <button className="btn-secondary" onClick={() => setFilters({ category: 'All', origin: 'All', priceMin: 0, priceMax: 100, certification: 'All', seasonal: 'All' })}>Reset Filters</button>
        </aside>
        <div className="products-content">
          <div className="results-count">Showing {filteredProducts.length} products</div>
          <div className="products-grid">{filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div>
          {filteredProducts.length === 0 && <div className="no-results"><p>No products match your filters.</p><button className="btn-primary" onClick={() => setFilters({ category: 'All', origin: 'All', priceMin: 0, priceMax: 100, certification: 'All', seasonal: 'All' })}>Clear Filters</button></div>}
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { products, addToCart, toggleWishlist, wishlist, user, calculateShipping } = useApp();
  const [qty, setQty] = useState(1);
  const [isTempControlled, setIsTempControlled] = useState(false);
  const [destination, setDestination] = useState('USA');
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  if (!product) return <div className="page-container"><h2>Product not found</h2></div>;
  const price = user?.type === 'business' ? (product.price * (1 - product.b2bDiscount)).toFixed(2) : product.price.toFixed(2);
  const shippingCost = calculateShipping(destination, qty, isTempControlled);
  const total = (parseFloat(price) * qty + shippingCost).toFixed(2);
  return (
    <div className="page-container product-detail">
      <div className="breadcrumb"><Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span></div>
      <div className="product-detail-grid">
        <div className="product-images"><img src={product.image} alt={product.name} /><div className="cert-badges">{product.certification.map(cert => <span key={cert} className="cert-badge">{cert}</span>)}</div></div>
        <div className="product-info-detail">
          <h1>{product.name}</h1>
          <div className="product-rating"><span>⭐ {product.rating}</span><span>({product.reviews} reviews)</span><span className="origin">📍 {product.origin}</span></div>
          <div className="price-detail"><span className="current-price">${price}</span><span className="unit">/{product.unit}</span>{user?.type === 'business' && <span className="original-price">${product.price.toFixed(2)}</span>}</div>
          <p className="description">{product.description}</p>
          <div className="product-meta-grid">
            <div><strong>Stock:</strong> {product.quantity} {product.unit} available</div><div><strong>Shelf Life:</strong> {product.shelfLife}</div>
            <div><strong>Storage:</strong> {product.storageTemp}</div><div><strong>Lead Time:</strong> Ships within {product.leadTime} days</div>
            <div><strong>MOQ:</strong> {product.moq} {product.unit}</div><div><strong>Season:</strong> {product.season}</div>
          </div>
          <div className="shipping-calculator">
            <h3>Shipping Calculator</h3>
            <div className="shipping-inputs">
              <select value={destination} onChange={(e) => setDestination(e.target.value)}>{Object.keys(SHIPPING_RATES).map(c => <option key={c} value={c}>{c}</option>)}</select>
              <label className="temp-toggle"><input type="checkbox" checked={isTempControlled} onChange={(e) => setIsTempControlled(e.target.checked)} /> Temperature Controlled (+50%)</label>
            </div>
            <div className="shipping-cost">Estimated Shipping: <strong>${shippingCost}</strong></div>
          </div>
          <div className="purchase-actions">
            <div className="qty-selector"><button onClick={() => setQty(Math.max(product.moq, qty - 1))}>-</button><input type="number" value={qty} min={product.moq} onChange={(e) => setQty(Math.max(product.moq, parseInt(e.target.value) || product.moq))} /><button onClick={() => setQty(qty + 1)}>+</button></div>
            <button className="btn-primary btn-large" onClick={() => { addToCart(product, qty, isTempControlled); navigate('/cart'); }}>Add to Cart - ${total}</button>
            <button className="btn-wishlist" onClick={() => toggleWishlist(product)}>{wishlist.find(w => w.id === product.id) ? '❤️ Saved' : '🤍 Save'}</button>
          </div>
          {user?.type === 'business' && <div className="b2b-notice"><p>💼 Business pricing applied. Contact us for volumes above 500kg for additional discounts.</p></div>}
        </div>
      </div>
      <div className="product-tabs">
        <div className="tab-buttons"><button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Details</button><button className={activeTab === 'shipping' ? 'active' : ''} onClick={() => setActiveTab('shipping')}>Shipping & Returns</button><button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews</button></div>
        <div className="tab-content">
          {activeTab === 'details' && <div><h3>Product Specifications</h3><table className="specs-table"><tbody><tr><td>Origin</td><td>{product.origin}</td></tr><tr><td>Category</td><td>{product.category}</td></tr><tr><td>Certifications</td><td>{product.certification.join(', ')}</td></tr><tr><td>Minimum Order</td><td>{product.moq} {product.unit}</td></tr><tr><td>Storage Temperature</td><td>{product.storageTemp}</td></tr><tr><td>Shelf Life</td><td>{product.shelfLife}</td></tr><tr><td>Seasonality</td><td>{product.season}</td></tr></tbody></table></div>}
          {activeTab === 'shipping' && <div><h3>Shipping Information</h3><p>We ship to over 150 countries worldwide. For perishable goods, we offer:</p><ul><li><strong>Air Freight:</strong> 2-5 days delivery for urgent orders</li><li><strong>Sea Freight:</strong> 14-30 days for bulk orders</li><li><strong>Temperature Controlled:</strong> Essential for frozen and dairy products</li></ul><h3>Returns Policy</h3><p>Due to the perishable nature of our products, returns are only accepted if:</p><ul><li>Products arrive damaged or spoiled</li><li>Claim is filed within 24 hours of delivery</li><li>Photo evidence is provided</li></ul></div>}
          {activeTab === 'reviews' && <div><h3>Customer Reviews ({product.reviews})</h3><div className="reviews-list">{[1, 2, 3].map(i => <div key={i} className="review-item"><div className="review-header"><span className="reviewer">Customer {i}</span><span className="stars">{"⭐".repeat(5 - i % 2)}</span></div><p>Excellent quality and fast shipping. The {product.name} arrived fresh and well-packaged. Highly recommended for restaurants.</p></div>)}</div></div>}
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cart, updateCartQty, removeFromCart, cartTotal, cartWeight, user, calculateShipping } = useApp();
  const [destination, setDestination] = useState('USA');
  const [isTempControlled, setIsTempControlled] = useState(false);
  const navigate = useNavigate();
  const shippingCost = calculateShipping(destination, cartWeight, isTempControlled);
  const tax = cartTotal * 0.08; const total = cartTotal + shippingCost + tax;
  if (cart.length === 0) return <div className="page-container cart-empty"><h1>Your Cart is Empty</h1><p>Looks like you haven't added any fresh products yet.</p><button className="btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button></div>;
  return (
    <div className="page-container cart-page">
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => {
            const price = user?.type === 'business' ? (item.price * (1 - item.b2bDiscount)) : item.price;
            return (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-details"><h3>{item.name}</h3><p>📍 {item.origin} | {item.category}</p><p className="price">${price.toFixed(2)}/{item.unit}</p>{item.isTempControlled && <span className="temp-badge">❄️ Temp Controlled</span>}</div>
                <div className="cart-item-actions"><div className="qty-controls"><button onClick={() => updateCartQty(item.id, item.qty - 1)}>-</button><span>{item.qty} {item.unit}</span><button onClick={() => updateCartQty(item.id, item.qty + 1)}>+</button></div><p className="item-total">${(price * item.qty).toFixed(2)}</p><button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑️</button></div>
              </div>
            );
          })}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal ({cart.length} items)</span><span>${cartTotal.toFixed(2)}</span></div>
          <div className="shipping-options"><label>Destination</label><select value={destination} onChange={(e) => setDestination(e.target.value)}>{Object.keys(SHIPPING_RATES).map(c => <option key={c} value={c}>{c}</option>)}</select><label className="checkbox-label"><input type="checkbox" checked={isTempControlled} onChange={(e) => setIsTempControlled(e.target.checked)} /> Temperature Controlled Shipping</label></div>
          <div className="summary-row"><span>Shipping ({cartWeight}kg to {destination})</span><span>${shippingCost.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn-primary btn-large btn-checkout" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          <button className="btn-secondary" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { cart, cartTotal, cartWeight, user, calculateShipping, placeOrder } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ firstName: user?.name?.split(' ')[0] || '', lastName: user?.name?.split(' ')[1] || '', email: user?.email || '', phone: '', address: '', city: '', country: 'USA', postalCode: '', paymentMethod: 'card', cardNumber: '', notes: '' });
  const [isTempControlled, setIsTempControlled] = useState(false);
  const navigate = useNavigate();
  const shippingCost = calculateShipping(formData.country, cartWeight, isTempControlled);
  const tax = cartTotal * 0.08; const total = cartTotal + shippingCost + tax;
  if (!user) return <div className="page-container"><h1>Please Login</h1><p>You need to be logged in to complete checkout.</p><button className="btn-primary" onClick={() => navigate('/login')}>Login</button></div>;
  return (
    <div className="page-container checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-steps"><div className={`step ${step >= 1 ? 'active' : ''}`}>1. Shipping</div><div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div><div className={`step ${step >= 3 ? 'active' : ''}`}>3. Review</div></div>
      {step === 1 && (
        <div className="checkout-form">
          <h2>Shipping Information</h2>
          <div className="form-grid"><input placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} /><input placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} /><input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /><input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /><input placeholder="Address" className="full-width" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /><input placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} /><select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}>{Object.keys(SHIPPING_RATES).map(c => <option key={c} value={c}>{c}</option>)}</select><input placeholder="Postal Code" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} /></div>
          <label className="checkbox-label"><input type="checkbox" checked={isTempControlled} onChange={(e) => setIsTempControlled(e.target.checked)} /> Require Temperature-Controlled Shipping</label>
          <button className="btn-primary" onClick={() => setStep(2)}>Continue to Payment</button>
        </div>
      )}
      {step === 2 && (
        <div className="checkout-form">
          <h2>Payment Method</h2>
          <div className="payment-methods">
            <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}><input type="radio" name="payment" checked={formData.paymentMethod === 'card'} onChange={() => setFormData({...formData, paymentMethod: 'card'})} /><span>💳 Credit Card</span></label>
            <label className={`payment-option ${formData.paymentMethod === 'bank' ? 'selected' : ''}`}><input type="radio" name="payment" checked={formData.paymentMethod === 'bank'} onChange={() => setFormData({...formData, paymentMethod: 'bank'})} /><span>🏦 Bank Transfer</span></label>
            <label className={`payment-option ${formData.paymentMethod === 'paypal' ? 'selected' : ''}`}><input type="radio" name="payment" checked={formData.paymentMethod === 'paypal'} onChange={() => setFormData({...formData, paymentMethod: 'paypal'})} /><span>🅿️ PayPal</span></label>
            <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}><input type="radio" name="payment" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({...formData, paymentMethod: 'cod'})} /><span>💵 Cash on Delivery (Local only)</span></label>
          </div>
          {formData.paymentMethod === 'card' && <div className="card-form"><input placeholder="Card Number" value={formData.cardNumber} onChange={(e) => setFormData({...formData, cardNumber: e.target.value})} /><div className="card-row"><input placeholder="MM/YY" /><input placeholder="CVC" /></div></div>}
          <div className="form-actions"><button className="btn-secondary" onClick={() => setStep(1)}>Back</button><button className="btn-primary" onClick={() => setStep(3)}>Review Order</button></div>
        </div>
      )}
      {step === 3 && (
        <div className="checkout-review">
          <h2>Review Your Order</h2>
          <div className="review-section"><h3>Items</h3>{cart.map(item => <div key={item.id} className="review-item"><span>{item.qty}x {item.name}</span><span>${(item.price * item.qty).toFixed(2)}</span></div>)}</div>
          <div className="review-section"><h3>Shipping To</h3><p>{formData.firstName} {formData.lastName}</p><p>{formData.address}</p><p>{formData.city}, {formData.country} {formData.postalCode}</p>{isTempControlled && <p>❄️ Temperature Controlled Shipping</p>}</div>
          <div className="review-section"><h3>Payment</h3><p>{formData.paymentMethod === 'card' ? 'Credit Card' : formData.paymentMethod === 'bank' ? 'Bank Transfer' : formData.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</p></div>
          <div className="review-totals"><div className="summary-row"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div><div className="summary-row"><span>Shipping</span><span>${shippingCost.toFixed(2)}</span></div><div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div><div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div></div>
          <div className="form-actions"><button className="btn-secondary" onClick={() => setStep(2)}>Back</button><button className="btn-primary btn-large" onClick={() => { const order = placeOrder({ items: cart, shipping: { ...formData, cost: shippingCost, isTempControlled }, payment: { method: formData.paymentMethod }, totals: { subtotal: cartTotal, shipping: shippingCost, tax, total } }); navigate(`/order-confirmation/${order.id}`); }}>Place Order</button></div>
        </div>
      )}
    </div>
  );
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { orders } = useApp();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === id);
  if (!order) return <div className="page-container"><h2>Order not found</h2></div>;
  return (
    <div className="page-container confirmation-page">
      <div className="confirmation-box">
        <div className="success-icon">✅</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order. We've sent a confirmation email to {order.shipping.email}.</p>
        <div className="order-details">
          <div className="detail-row"><span>Order ID</span><strong>{order.id}</strong></div>
          <div className="detail-row"><span>Tracking Number</span><strong>{order.tracking}</strong></div>
          <div className="detail-row"><span>Status</span><span className="status-badge pending">{order.status}</span></div>
          <div className="detail-row"><span>Total</span><strong>${order.totals.total.toFixed(2)}</strong></div>
        </div>
        <div className="tracking-link"><p>Track your shipment: <a href="#">{order.tracking}</a></p></div>
        <button className="btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button>
        <button className="btn-secondary" onClick={() => navigate('/orders')}>View My Orders</button>
      </div>
    </div>
  );
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="page-container auth-page">
      <div className="auth-box">
        <h1>Forgot Password</h1>
        {submitted ? (
          <div className="reset-success">
            <div className="reset-icon">✅</div>
            <p>If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p>
            <Link to="/login" className="btn-primary btn-large" style={{display:'block',textAlign:'center',marginTop:'1rem'}}>Back to Login</Link>
          </div>
        ) : (
          <>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="btn-primary btn-large">Send Reset Link</button>
            </form>
            <p className="auth-link"><Link to="/login">← Back to Login</Link></p>
          </>
        )}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('individual');
  const navigate = useNavigate();
  return (
    <div className="page-container auth-page">
      <div className="auth-box">
        <h1>Welcome Back</h1>
        <p>Login to your TAMILARASU ENTERPRISES account</p>
        <form onSubmit={(e) => { e.preventDefault(); login(email, password, userType); navigate('/'); }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="user-type"><label><input type="radio" name="type" checked={userType === 'individual'} onChange={() => setUserType('individual')} /> Individual Customer</label><label><input type="radio" name="type" checked={userType === 'business'} onChange={() => setUserType('business')} /> Business Buyer</label></div>
          <button type="submit" className="btn-primary btn-large">Login</button>
        </form>
        <p className="auth-link forgot-link"><Link to="/forgot-password">Forgot Password?</Link></p>
        <p className="auth-link">Don't have an account? <Link to="/register">Register</Link></p>
        <p className="admin-hint">Admin login: admin@tamilarasuenterprises.com / any password</p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { register } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', type: 'individual', company: '' });
  const navigate = useNavigate();
  return (
    <div className="page-container auth-page">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p>Join TAMILARASU ENTERPRISES for fresh produce delivered worldwide</p>
        <form onSubmit={(e) => { e.preventDefault(); register(formData); navigate('/'); }}>
          <input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <div className="user-type"><label><input type="radio" name="type" checked={formData.type === 'individual'} onChange={() => setFormData({...formData, type: 'individual'})} /> Individual Customer</label><label><input type="radio" name="type" checked={formData.type === 'business'} onChange={() => setFormData({...formData, type: 'business'})} /> Business Buyer</label></div>
          {formData.type === 'business' && <input placeholder="Company Name" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />}
          <button type="submit" className="btn-primary btn-large">Create Account</button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, orders, wishlist, showNotification } = useApp();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    setPwError('');
    setPwForm({ current: '', newPw: '', confirm: '' });
    setShowChangePassword(false);
    showNotification('Password changed successfully!');
  };

  if (!user) return <div className="page-container"><h1>Please Login</h1><button className="btn-primary" onClick={() => navigate('/login')}>Login</button></div>;
  return (
    <div className="page-container dashboard-page">
      <h1>My Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card profile-card">
          <h2>Profile</h2>
          <div className="profile-info"><p><strong>Name:</strong> {user.name}</p><p><strong>Email:</strong> {user.email}</p><p><strong>Type:</strong> {user.type === 'business' ? 'Business Buyer' : 'Individual Customer'}</p>{user.company && <p><strong>Company:</strong> {user.company}</p>}</div>
          <button className="btn-secondary" style={{marginTop:'1rem'}} onClick={() => setShowChangePassword(!showChangePassword)}>
            🔒 {showChangePassword ? 'Cancel' : 'Change Password'}
          </button>
          {showChangePassword && (
            <form className="change-password-form" onSubmit={handleChangePassword}>
              <h3>Change Password</h3>
              {pwError && <p className="pw-error">{pwError}</p>}
              <input type="password" placeholder="Current Password" value={pwForm.current} onChange={(e) => setPwForm({...pwForm, current: e.target.value})} required />
              <input type="password" placeholder="New Password" value={pwForm.newPw} onChange={(e) => setPwForm({...pwForm, newPw: e.target.value})} required />
              <input type="password" placeholder="Confirm New Password" value={pwForm.confirm} onChange={(e) => setPwForm({...pwForm, confirm: e.target.value})} required />
              <button type="submit" className="btn-primary">Update Password</button>
            </form>
          )}
        </div>
        <div className="dashboard-card stats-card">
          <h2>Quick Stats</h2>
          <div className="stats-grid"><div><span>{orders.length}</span><p>Total Orders</p></div><div><span>{wishlist.length}</span><p>Wishlist Items</p></div><div><span>${orders.reduce((sum, o) => sum + o.totals.total, 0).toFixed(0)}</span><p>Total Spent</p></div></div>
        </div>
        <div className="dashboard-card orders-card">
          <h2>Recent Orders</h2>
          {orders.slice(0, 3).map(order => (
            <div key={order.id} className="order-row">
              <div><strong>{order.id}</strong><span className={`status ${order.status}`}>{order.status}</span></div>
              <div>${order.totals.total.toFixed(2)}</div>
            </div>
          ))}
          {orders.length === 0 && <p>No orders yet. <Link to="/products">Start shopping</Link></p>}
          <button className="btn-secondary" onClick={() => navigate('/orders')}>View All Orders</button>
        </div>
        <div className="dashboard-card wishlist-card">
          <h2>Wishlist</h2>
          {wishlist.slice(0, 3).map(item => (
            <div key={item.id} className="wishlist-row">
              <img src={item.image} alt={item.name} />
              <div><p>{item.name}</p><p>${item.price.toFixed(2)}/{item.unit}</p></div>
            </div>
          ))}
          {wishlist.length === 0 && <p>Your wishlist is empty.</p>}
          <button className="btn-secondary" onClick={() => navigate('/wishlist')}>View Wishlist</button>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const { user, orders } = useApp();
  const navigate = useNavigate();
  if (!user) return <div className="page-container"><h1>Please Login</h1><button className="btn-primary" onClick={() => navigate('/login')}>Login</button></div>;
  return (
    <div className="page-container orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? <p>No orders yet. <Link to="/products">Start shopping</Link></p> : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header"><div><strong>{order.id}</strong><span>{new Date(order.date).toLocaleDateString()}</span></div><span className={`status-badge ${order.status}`}>{order.status}</span></div>
              <div className="order-items">{order.items.map(item => <div key={item.id}><span>{item.qty}x {item.name}</span><span>${(item.price * item.qty).toFixed(2)}</span></div>)}</div>
              <div className="order-footer"><div><span>Tracking: {order.tracking}</span></div><div><strong>Total: ${order.totals.total.toFixed(2)}</strong></div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const navigate = useNavigate();
  return (
    <div className="page-container wishlist-page">
      <h1>My Wishlist</h1>
      {wishlist.length === 0 ? <p>Your wishlist is empty. <Link to="/products">Browse products</Link></p> : (
        <div className="wishlist-grid">
          {wishlist.map(item => (
            <div key={item.id} className="wishlist-item">
              <img src={item.image} alt={item.name} onClick={() => navigate(`/product/${item.id}`)} />
              <div className="wishlist-info">
                <h3>{item.name}</h3>
                <p>📍 {item.origin} | ${item.price.toFixed(2)}/{item.unit}</p>
                <div className="wishlist-actions">
                  <button className="btn-primary" onClick={() => addToCart(item, item.moq)}>Add to Cart</button>
                  <button className="btn-remove" onClick={() => toggleWishlist(item)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AboutPage = () => (
  <div className="page-container about-page">
    <h1>About TAMILARASU ENTERPRISES</h1>
    <div className="about-section">
      <div className="about-image"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600" alt="Fresh market" /></div>
      <div className="about-content">
        <h2>Our Story</h2>
        <p>Founded in 2015 in Rotterdam, Netherlands, TAMILARASU ENTERPRISES began with a simple mission: to connect the world's best fresh produce with businesses and consumers who demand quality. What started as a small import-export operation between the Netherlands and Spain has grown into a global network spanning 50+ countries.</p>
        <p>Today, we serve over 2,000 B2B clients including Michelin-starred restaurants, international hotel chains, and major supermarket groups, alongside thousands of individual customers who trust us for their weekly fresh produce delivery.</p>
      </div>
    </div>
    <div className="about-section reverse">
      <div className="about-content">
        <h2>Quality Control</h2>
        <p>Every product in our catalog undergoes rigorous quality checks:</p>
        <ul>
          <li><strong>Source Verification:</strong> Direct partnerships with certified farms and fisheries</li>
          <li><strong>Pre-shipment Inspection:</strong> Independent third-party quality assessment</li>
          <li><strong>Cold Chain Monitoring:</strong> IoT sensors track temperature from origin to destination</li>
          <li><strong>Arrival Check:</strong> Freshness and quality verification upon warehouse receipt</li>
        </ul>
      </div>
      <div className="about-image"><img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600" alt="Quality control" /></div>
    </div>
    <div className="certifications-section">
      <h2>Our Certifications</h2>
      <div className="cert-grid">
        <div className="cert-card"><h3>🏆 ISO 22000</h3><p>Food Safety Management</p></div>
        <div className="cert-card"><h3>🌱 Organic</h3><p>EU & USDA Certified</p></div>
        <div className="cert-card"><h3>🤝 Fair Trade</h3><p>Ethical Sourcing</p></div>
        <div className="cert-card"><h3>🌍 Global G.A.P.</h3><p>Good Agricultural Practice</p></div>
        <div className="cert-card"><h3>☪️ Halal</h3><p>Islamic Compliance</p></div>
        <div className="cert-card"><h3>♻️ HACCP</h3><p>Hazard Analysis Critical Control</p></div>
      </div>
    </div>
    <div className="team-section">
      <h2>Leadership Team</h2>
      <div className="team-grid">
        <div className="team-member"><div className="team-avatar">👨‍💼</div><h3>Jan van der Berg</h3><p>CEO & Founder</p></div>
        <div className="team-member"><div className="team-avatar">👩‍💼</div><h3>Maria Santos</h3><p>COO</p></div>
        <div className="team-member"><div className="team-avatar">👨‍🔬</div><h3>Dr. Li Wei</h3><p>Quality Director</p></div>
        <div className="team-member"><div className="team-avatar">👩‍💻</div><h3>Sarah Johnson</h3><p>Head of Technology</p></div>
      </div>
    </div>
  </div>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };
  return (
    <div className="page-container contact-page">
      <h1>Contact Us</h1>
      <div className="contact-layout">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="contact-item"><span>📍</span><div><h3>Headquarters</h3><p>123 Trade Center, Rotterdam 3011 AA, Netherlands</p></div></div>
          <div className="contact-item"><span>📞</span><div><h3>Phone</h3><p>+31 10 123 4567 (Mon-Fri 9:00-18:00 CET)</p></div></div>
          <div className="contact-item"><span>✉️</span><div><h3>Email</h3><p>info@tamilarasuenterprises.com<br/>support@tamilarasuenterprises.com</p></div></div>
          <div className="contact-item"><span>💬</span><div><h3>WhatsApp</h3><p>+31 6 1234 5678 (24/7 for urgent orders)</p></div></div>
          <div className="contact-item"><span>🌐</span><div><h3>Regional Offices</h3><p>Dubai • Singapore • São Paulo • Mumbai</p></div></div>
        </div>
        <div className="contact-form-wrapper">
          {submitted ? (
            <div className="form-success"><h2>✅ Message Sent!</h2><p>Thank you for reaching out. Our team will respond within 24 hours.</p></div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2>Send a Message</h2>
              <input placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}>
                <option>General Inquiry</option><option>Business Partnership</option><option>Product Sourcing</option><option>Shipping Question</option><option>Complaint</option>
              </select>
              <textarea placeholder="Your message..." rows="5" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required></textarea>
              <button type="submit" className="btn-primary btn-large">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = [
    { q: "How do you ensure freshness during shipping?", a: "We use temperature-controlled containers and air freight for perishable items. Our cold chain maintains optimal temperatures from farm to your door, with real-time monitoring via IoT sensors." },
    { q: "What is your return policy for perishable goods?", a: "Due to the perishable nature of our products, returns are only accepted if products arrive damaged or spoiled. Claims must be filed within 24 hours of delivery with photo evidence. We offer full refunds or replacements for verified claims." },
    { q: "Do you offer volume discounts for businesses?", a: "Yes! Business buyers receive automatic discounts displayed on product pages. For orders above 500kg, contact our B2B team for custom pricing. Restaurants, hotels, and distributors can apply for wholesale accounts." },
    { q: "What payment methods do you accept?", a: "We accept credit cards (Visa, Mastercard, Amex), PayPal, bank transfers for international orders, and cash on delivery for local deliveries in select cities." },
    { q: "How long does shipping take?", a: "Air freight: 2-5 days worldwide. Sea freight: 14-30 days for bulk orders. Express temperature-controlled: 1-3 days to major cities. Each product page shows specific lead times." },
    { q: "Do you handle customs documentation?", a: "Yes, we provide all necessary export/import documentation including phytosanitary certificates, certificates of origin, and customs declarations. Our logistics team handles customs clearance for most destinations." },
    { q: "What certifications do your products have?", a: "Our products carry various certifications including Organic, Fair Trade, Global G.A.P., Halal, MSC (Marine Stewardship Council), and PDO (Protected Designation of Origin). Each product page lists specific certifications." },
    { q: "Can I track my order?", a: "Absolutely. Once your order ships, you'll receive a tracking number via email. You can track your shipment in real-time through our website or the carrier's portal." },
    { q: "What is the minimum order quantity (MOQ)?", a: "MOQ varies by product and is displayed on each product page. Individual customers can order from 1kg/unit for most items. Business buyers have higher MOQs with corresponding volume discounts." },
    { q: "Do you offer samples?", a: "Yes, we offer sample packs for new B2B customers. Contact our sales team to request a sample. Sample costs are credited against your first full order." }
  ];
  return (
    <div className="page-container faq-page">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
            <button className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
              {faq.q}<span>{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && <div className="faq-answer">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { isAdmin, orders, products, updateOrderStatus, updateProduct, deleteProduct, addProduct } = useApp();
  const [activeTab, setActiveTab] = useState('orders');
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Fruits', origin: '', price: 0, unit: 'kg', quantity: 0, certification: [], shelfLife: '', storageTemp: '', leadTime: 1, moq: 1, image: '', description: '', season: 'Year-round', rating: 4.5, reviews: 0, b2bDiscount: 0 });
  const navigate = useNavigate();

  if (!isAdmin) return <div className="page-container"><h1>Access Denied</h1><p>You must be logged in as an admin to view this page.</p><button className="btn-primary" onClick={() => navigate('/login')}>Login</button></div>;

  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Total', 'Items'];
    const rows = orders.map(o => [o.id, o.date, o.shipping.email, o.status, o.totals.total, o.items.map(i => `${i.qty}x ${i.name}`).join('; ')]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
  };

  return (
    <div className="page-container admin-page">
      <h1>Admin Panel</h1>
      <div className="admin-tabs">
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📦 Orders ({orders.length})</button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>🥬 Products ({products.length})</button>
        <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>📊 Inventory Alerts</button>
      </div>

      {activeTab === 'orders' && (
        <div className="admin-section">
          <div className="admin-header"><h2>All Orders</h2><button className="btn-secondary" onClick={exportCSV}>📥 Export CSV</button></div>
          <div className="orders-table">
            <div className="table-header"><span>Order ID</span><span>Date</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span><span>Actions</span></div>
            {orders.map(order => (
              <div key={order.id} className="table-row">
                <span>{order.id}</span><span>{new Date(order.date).toLocaleDateString()}</span><span>{order.shipping.email}</span>
                <span>{order.items.length} items</span><span>${order.totals.total.toFixed(2)}</span>
                <span className={`status ${order.status}`}>{order.status}</span>
                <span>
                  <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                    <option>pending</option><option>processing</option><option>shipped</option><option>delivered</option><option>cancelled</option>
                  </select>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="admin-section">
          <div className="admin-header"><h2>Product Management</h2><button className="btn-primary" onClick={() => setEditingProduct({ ...newProduct })}>+ Add Product</button></div>
          {editingProduct && (
            <div className="product-form">
              <h3>{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
              <div className="form-grid">
                <input placeholder="Name" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                <select value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}>{["Fruits", "Vegetables", "Seafood", "Meat & Poultry", "Dairy", "Frozen Foods"].map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input placeholder="Origin" value={editingProduct.origin} onChange={(e) => setEditingProduct({...editingProduct, origin: e.target.value})} />
                <input type="number" placeholder="Price" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                <input type="number" placeholder="Stock" value={editingProduct.quantity} onChange={(e) => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value)})} />
                <input type="number" placeholder="MOQ" value={editingProduct.moq} onChange={(e) => setEditingProduct({...editingProduct, moq: parseInt(e.target.value)})} />
                <input placeholder="Image URL" value={editingProduct.image} onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} className="full-width" />
                <textarea placeholder="Description" value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="full-width" rows="3"></textarea>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button className="btn-primary" onClick={() => { if (editingProduct.id && products.find(p => p.id === editingProduct.id)) { updateProduct(editingProduct.id, editingProduct); } else { addProduct(editingProduct); } setEditingProduct(null); }}>Save</button>
              </div>
            </div>
          )}
          <div className="products-table">
            <div className="table-header"><span>ID</span><span>Name</span><span>Category</span><span>Origin</span><span>Price</span><span>Stock</span><span>Actions</span></div>
            {products.map(product => (
              <div key={product.id} className="table-row">
                <span>{product.id}</span><span>{product.name}</span><span>{product.category}</span><span>{product.origin}</span><span>${product.price.toFixed(2)}</span><span className={product.quantity < 100 ? 'low-stock' : ''}>{product.quantity}</span>
                <span><button onClick={() => setEditingProduct(product)}>Edit</button><button className="btn-danger" onClick={() => deleteProduct(product.id)}>Delete</button></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="admin-section">
          <h2>Low Stock Alerts</h2>
          <div className="inventory-alerts">
            {products.filter(p => p.quantity < 100).map(product => (
              <div key={product.id} className="alert-card">
                <h3>⚠️ {product.name}</h3>
                <p>Only {product.quantity} {product.unit} remaining</p>
                <p>Category: {product.category} | Origin: {product.origin}</p>
                <button className="btn-primary" onClick={() => setEditingProduct(product)}>Restock</button>
              </div>
            ))}
            {products.filter(p => p.quantity < 100).length === 0 && <p>No low stock alerts. All products are well-stocked.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
function App() {
  const { notification } = useApp();
  return (
    <div className="App">
      <Navbar />
      {notification && <Notification message={notification.message} type={notification.type} />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  );
}
