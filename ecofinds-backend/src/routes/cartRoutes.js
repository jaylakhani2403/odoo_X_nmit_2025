// src/routes/cartRoutes.js - Updated with buyer role requirement
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireBuyerOrAdmin } = require('../middleware/roleMiddleware');

// All cart routes require authentication and buyer/admin role
router.use(authenticateToken);
router.use(requireBuyerOrAdmin);

router.get('/', cartController.getCart);
router.get('/summary', cartController.getCartSummary);
router.post('/', cartController.addToCart);
router.put('/:product_id', cartController.updateCartItem);
router.delete('/:product_id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;