const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

// ─── GET /api/products ────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { category, search } = req.query;

    let whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: { products } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/products ───────────────────────────────────────────────────────
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, description, category, hsnCode, price, unit, stock, imageUrl } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        hsnCode,
        price: parseFloat(price),
        unit,
        stock: parseInt(stock, 10),
        imageUrl
      }
    });

    return res.status(201).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const { name, description, category, hsnCode, price, unit, stock, imageUrl } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        category,
        hsnCode,
        price: price ? parseFloat(price) : undefined,
        unit,
        stock: stock !== undefined ? parseInt(stock, 10) : undefined,
        imageUrl
      }
    });

    return res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    return res.json({ success: true, data: { message: 'Product deleted successfully' } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
