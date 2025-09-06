// src/routes/productRoutes.js - Updated with role-based access
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireSellerOrAdmin, requireOwnership } = require('../middleware/roleMiddleware');

// Public routes (anyone can view products)
router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// Protected routes (require authentication)

// Only sellers and admins can create products
router.post('/', authenticateToken, requireSellerOrAdmin, productController.createProduct);

// Only product owners (sellers) and admins can update/delete
router.put('/:id', authenticateToken, requireSellerOrAdmin, requireOwnership, productController.updateProduct);
router.delete('/:id', authenticateToken, requireSellerOrAdmin, requireOwnership, productController.deleteProduct);

// Only sellers and admins can view user's listings
router.get('/user/listings', authenticateToken, requireSellerOrAdmin, productController.getUserProducts);

module.exports = router;