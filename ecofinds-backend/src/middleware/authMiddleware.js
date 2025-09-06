// src/middleware/authMiddleware.js - Updated with role support
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required',
        message: 'Authorization header with Bearer token is required'
      });
    }

    // Use ACCESS_TOKEN_SECRET_KEY (matching your project style)
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    req.user = decoded;
    console.log('Authenticated user:', req.user);
    // Verify user still exists in database and get role
    const userResult = await query(
      'SELECT id, email, username, full_name, role, is_active, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found',
        message: 'User associated with this token no longer exists'
      });
    }

    const user = userResult.rows[0];

    // Check if user account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Add user info to request object (including role)
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_verified: user.is_verified
    };
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired',
        message: 'The provided token has expired. Please log in again.'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Authentication verification failed'
    });
  }
};

// Optional middleware for routes that don't require authentication but benefit from user context
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
      const userResult = await query(
        'SELECT id, email, username, full_name, role, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        const user = userResult.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: user.role
        };
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return errors, just continue without user context
    next();
  }
};

module.exports = { 
  authenticateToken, 
  optionalAuth 
};