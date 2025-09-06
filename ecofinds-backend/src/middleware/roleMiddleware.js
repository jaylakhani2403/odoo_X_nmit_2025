// src/middleware/roleMiddleware.js - Role-based access control
const { query } = require('../config/database');

// Check if user has required role
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }

      const userRole = req.user.role;
      
      // Convert single role to array for consistency
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!rolesArray.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: `This action requires ${rolesArray.join(' or ')} role. You are: ${userRole}`
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Role verification failed'
      });
    }
  };
};

// Specific role middlewares for common use cases
const requireAdmin = requireRole('admin');
const requireSeller = requireRole(['seller', 'admin']); // Admins can also act as sellers
const requireBuyer = requireRole(['buyer', 'admin']); // Admins can also act as buyers
const requireSellerOrAdmin = requireRole(['seller', 'admin']);
const requireBuyerOrAdmin = (req, res, next) => {
  const { role } = req.user;
  console.log('User role:', role); // Debug log
  if (role === 'buyer' || role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Buyer or Admin role required.' });
};

// Check if user owns resource (for sellers managing their products)
const requireOwnership = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const resourceId = req.params.id;

    // Admins can access any resource
    if (userRole === 'admin') {
      return next();
    }

    // Check if user owns the resource (for products)
    if (req.baseUrl.includes('products')) {
      const result = await query(
        'SELECT owner_id FROM products WHERE id = $1',
        [resourceId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found',
          message: 'Product not found'
        });
      }

      if (result.rows[0].owner_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'You can only manage your own products'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Ownership middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Ownership verification failed'
    });
  }
};

// Log admin actions
const logAdminAction = (action) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        const { id: adminId } = req.user;
        const targetId = req.params.id || null;
        const details = JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          body: req.body
        });

        await query(
          'INSERT INTO admin_actions (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
          [adminId, action, 'unknown', targetId, details]
        );
      }
      next();
    } catch (error) {
      console.error('Admin logging error:', error);
      // Don't fail the request if logging fails
      next();
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireSeller,
  requireBuyer,
  requireSellerOrAdmin,
  requireBuyerOrAdmin,
  requireOwnership,
  logAdminAction
};