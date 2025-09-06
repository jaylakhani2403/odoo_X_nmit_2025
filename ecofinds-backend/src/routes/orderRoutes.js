// src/routes/orderRoutes.js - Updated with buyer role requirement
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireBuyerOrAdmin } = require('../middleware/roleMiddleware');

// All order routes require authentication and buyer/admin role
router.use(authenticateToken);
router.use(requireBuyerOrAdmin);

router.get('/', orderController.getUserOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.post('/checkout', orderController.checkout);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;