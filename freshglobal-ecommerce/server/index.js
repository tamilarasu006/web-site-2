require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { loginLimiter, registerLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── BODY PARSERS ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ success: true, message: 'Server is running' }));

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── DATABASE + START ────────────────────────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdmin() {
  const bcrypt = require('bcryptjs');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tamilarasuenterprises.com';
  
  try {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const hashed = await bcrypt.hash('Admin@123456', 12);
      await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password: hashed,
          role: 'admin',
        }
      });
      console.log(`[Seed] Admin user created: ${adminEmail}`);
    }
  } catch (error) {
    console.error('[Seed] Error checking/creating admin user:', error.message);
  }
}

async function startServer() {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log('[DB] PostgreSQL connected via Prisma');
    
    await seedAdmin();
    
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

startServer();

// Make prisma available globally if needed, or pass it into routes
app.set('prisma', prisma);
