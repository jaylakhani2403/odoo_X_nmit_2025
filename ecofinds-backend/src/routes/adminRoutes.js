// src/routes/adminRoutes.js - Admin-only routes
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin, logAdminAction } = require('../middleware/roleMiddleware');

// All admin routes require authentication AND admin role
router.use(authenticateToken);
router.use(requireAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/deactivate', logAdminAction('deactivate_user'), adminController.deactivateUser);
router.put('/users/:id/activate', logAdminAction('activate_user'), adminController.activateUser);

// Product management
router.get('/products', adminController.getAllProducts);
router.put('/products/:id/approve', logAdminAction('approve_product'), adminController.approveProduct);
router.put('/products/:id/reject', logAdminAction('reject_product'), adminController.rejectProduct);

// Order management
router.get('/orders', adminController.getAllOrders);

// Platform statistics and logs
router.get('/stats', adminController.getPlatformStats);
router.get('/logs', adminController.getAdminLogs);

module.exports = router;