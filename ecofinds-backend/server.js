require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration to match your project style
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:5174', 
    'http://127.0.0.1:5500',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'EcoFinds Backend is running!',
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    features: ['User Roles', 'Admin Panel', 'Role-based Access Control'],
    timestamp: new Date().toISOString()
  });
});

// API info endpoint with role information
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'EcoFinds API - Sustainable Second-Hand Marketplace with Role-based Access',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'User Role Management (Admin, Seller, Buyer)',
      'Role-based Access Control',
      'Product Approval System',
      'Admin Dashboard',
      'User Statistics',
      'Admin Action Logging'
    ],
    user_roles: {
      admin: 'Can manage users, approve/reject products, view all data',
      seller: 'Can create, edit, delete their own products',
      buyer: 'Can browse products, manage cart, place orders'
    },
    endpoints: {
      auth: {
        register: 'POST /api/auth/register (body: {email, password, username, role?})',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (Protected)',
        updateProfile: 'PUT /api/auth/profile (Protected)',
        dashboard: 'GET /api/auth/dashboard (Protected - Role-specific data)'
      },
      products: {
        getAll: 'GET /api/products (Public)',
        getById: 'GET /api/products/:id (Public)',
        create: 'POST /api/products (Seller/Admin only)',
        update: 'PUT /api/products/:id (Owner/Admin only)',
        delete: 'DELETE /api/products/:id (Owner/Admin only)',
        getUserProducts: 'GET /api/products/user/listings (Seller/Admin only)'
      },
      cart: {
        getCart: 'GET /api/cart (Buyer/Admin only)',
        addToCart: 'POST /api/cart (Buyer/Admin only)',
        removeFromCart: 'DELETE /api/cart/:product_id (Buyer/Admin only)',
        clearCart: 'DELETE /api/cart (Buyer/Admin only)'
      },
      orders: {
        getOrders: 'GET /api/orders (Buyer/Admin only)',
        checkout: 'POST /api/orders/checkout (Buyer/Admin only)',
        getOrderById: 'GET /api/orders/:id (Buyer/Admin only)'
      },
      admin: {
        users: 'GET /api/admin/users (Admin only)',
        deactivateUser: 'PUT /api/admin/users/:id/deactivate (Admin only)',
        activateUser: 'PUT /api/admin/users/:id/activate (Admin only)',
        products: 'GET /api/admin/products (Admin only)',
        approveProduct: 'PUT /api/admin/products/:id/approve (Admin only)',
        rejectProduct: 'PUT /api/admin/products/:id/reject (Admin only)',
        orders: 'GET /api/admin/orders (Admin only)',
        stats: 'GET /api/admin/stats (Admin only)',
        logs: 'GET /api/admin/logs (Admin only)'
      }
    }
  });
});

// 404 handler for API routes - FIXED: Use correct pattern
app.use('/api*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'API route not found',
    message: `The API endpoint ${req.method} ${req.originalUrl} does not exist.`,
    availableEndpoints: '/api'
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist.`,
    suggestion: 'Try /api for available endpoints'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled Error:', err);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({ 
    success: false,
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong!',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🔄 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 EcoFinds Backend Server v2.0 Started!
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Not configured'}
🔐 JWT Secret: ${process.env.ACCESS_TOKEN_SECRET_KEY ? '✅ Configured' : '❌ Missing'}
⚡ Server ready at: http://localhost:${PORT}
📋 API Documentation: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health

👥 User Roles Enabled:
   🔹 Admin: Full platform management
   🔹 Seller: Product creation and management  
   🔹 Buyer: Shopping and order management

🛡️  Role-based Access Control Active
📊 Admin Dashboard Available at /api/admin/*

${process.env.NODE_ENV === 'development' ? 
  '🔧 Development Mode: Detailed logging enabled' : 
  '🏭 Production Mode: Optimized for performance'}
  `);
});

module.exports = app;