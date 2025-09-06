// src/controllers/authController.js - Updated with role support
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDAO = require('../dao/userDAO');

class AuthController {
  // User registration with role selection
  async register(req, res) {
    try {
      const { email, password, username, full_name, role = 'buyer' } = req.body;

      // Validate input
      if (!email || !password || !username) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email, password, and username are required'
        });
      }

      // Validate role
      const validRoles = ['buyer', 'seller'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role',
          message: 'Role must be either "buyer" or "seller"'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        });
      }

      // Check if email already exists
      const existingUser = await userDAO.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists',
          message: 'A user with this email already exists'
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Invalid password',
          message: 'Password must be at least 6 characters long'
        });
      }

      // Hash password using your project's BCRYPT_SALT
      const saltRounds = parseInt(process.env.BCRYPT_SALT) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with role
      const userData = {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        username: username.trim(),
        full_name: full_name?.trim() || username.trim(),
        role: role
      };

      const newUser = await userDAO.create(userData);

      // Generate JWT token with role information
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          username: newUser.username,
          role: newUser.role
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_TIME || '7d' }
      );

      res.status(201).json({
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          full_name: newUser.full_name,
          role: newUser.role,
          is_verified: newUser.is_verified,
          created_at: newUser.created_at
        },
        token,
        expires_in: process.env.ACCESS_TOKEN_EXPIRES_TIME || '7d'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not register user'
      });
    }
  }

  // User login with role information
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }

      // Find user with password and role
      const user = await userDAO.findByEmailWithPassword(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token with role
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username,
          role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_TIME || '7d' }
      );

      res.json({
        success: true,
        message: `Welcome back, ${user.role}!`,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          is_verified: user.is_verified
        },
        token,
        expires_in: process.env.ACCESS_TOKEN_EXPIRES_TIME || '7d'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not process login'
      });
    }
  }

  // Get user profile with role information
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userDAO.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found'
        });
      }

      // Include role-specific information
      const profileData = {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        role: user.role,
        is_verified: user.is_verified,
        is_active: user.is_active,
        created_at: user.created_at
      };

      // Add role-specific stats
      if (user.role === 'seller') {
        const sellerStats = await userDAO.getSellerStats(userId);
        profileData.seller_stats = sellerStats;
      } else if (user.role === 'buyer') {
        const buyerStats = await userDAO.getBuyerStats(userId);
        profileData.buyer_stats = buyerStats;
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        user: profileData
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch user profile'
      });
    }
  }

  // Update user profile (role cannot be changed after registration)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, full_name, phone, address } = req.body;

      // Validate input
      if (!username) {
        return res.status(400).json({
          success: false,
          error: 'Missing username',
          message: 'Username is required'
        });
      }

      const updateData = {
        username: username.trim(),
        full_name: full_name?.trim() || username.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null
      };

      const updatedUser = await userDAO.update(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Could not update user profile'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...updatedUser,
          role: req.user.role // Include role from token
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not update profile'
      });
    }
  }

  // Get user dashboard data (role-specific)
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let dashboardData = {
        user: {
          id: userId,
          role: userRole,
          username: req.user.username
        }
      };

      switch (userRole) {
        case 'admin':
          dashboardData = await userDAO.getAdminDashboard(userId);
          break;
        case 'seller':
          dashboardData = await userDAO.getSellerDashboard(userId);
          break;
        case 'buyer':
          dashboardData = await userDAO.getBuyerDashboard(userId);
          break;
      }

      res.json({
        success: true,
        message: `${userRole} dashboard data retrieved successfully`,
        dashboard: dashboardData
      });

    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch dashboard data'
      });
    }
  }
}

module.exports = new AuthController();