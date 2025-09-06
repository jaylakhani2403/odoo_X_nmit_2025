// src/dao/userDAO.js - Updated with role support and stats
const { query } = require('../config/database');

class UserDAO {
  // Create a new user with role
  async create(userData) {
    const { email, password, username, full_name, role = 'buyer' } = userData;
    const sql = `
      INSERT INTO users (email, password, username, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, full_name, role, is_verified, is_active, created_at
    `;
    const result = await query(sql, [email, password, username, full_name, role]);
    return result.rows[0];
  }

  // Find user by email
  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Find user by ID
  async findById(id) {
    const sql = `
      SELECT id, email, username, full_name, phone, address, role, 
             is_verified, is_active, created_at, updated_at 
      FROM users WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Update user profile
  async update(id, userData) {
    const { username, full_name, phone, address } = userData;
    const sql = `
      UPDATE users 
      SET username = $2, full_name = $3, phone = $4, address = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, username, full_name, phone, address, role, updated_at
    `;
    const result = await query(sql, [id, username, full_name, phone, address]);
    return result.rows[0];
  }

  // Get user with password (for login)
  async findByEmailWithPassword(email) {
    const sql = `
      SELECT id, email, password, username, full_name, role, is_active, is_verified 
      FROM users WHERE email = $1
    `;
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Get seller statistics
  async getSellerStats(sellerId) {
    const sql = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status = 'available') as active_products,
        COUNT(*) FILTER (WHERE status = 'sold') as sold_products,
        COALESCE(SUM(price) FILTER (WHERE status = 'sold'), 0) as total_earnings,
        COALESCE(AVG(price), 0) as average_price
      FROM products
      WHERE owner_id = $1
    `;
    const result = await query(sql, [sellerId]);
    const stats = result.rows[0];
    
    // Convert string numbers to actual numbers
    return {
      total_products: parseInt(stats.total_products),
      active_products: parseInt(stats.active_products),
      sold_products: parseInt(stats.sold_products),
      total_earnings: parseFloat(stats.total_earnings),
      average_price: parseFloat(stats.average_price)
    };
  }

  // Get buyer statistics
  async getBuyerStats(buyerId) {
    const sql = `
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(AVG(o.total_amount), 0) as average_order_value,
        COUNT(ci.id) as items_in_cart
      FROM users u
      LEFT JOIN orders o ON u.id = o.buyer_id
      LEFT JOIN cart_items ci ON u.id = ci.buyer_id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    const result = await query(sql, [buyerId]);
    const stats = result.rows[0] || { total_orders: 0, total_spent: 0, average_order_value: 0, items_in_cart: 0 };
    
    return {
      total_orders: parseInt(stats.total_orders),
      total_spent: parseFloat(stats.total_spent),
      average_order_value: parseFloat(stats.average_order_value),
      items_in_cart: parseInt(stats.items_in_cart)
    };
  }

  // Get admin dashboard data
  async getAdminDashboard(adminId) {
    const usersSql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'buyer') as total_buyers,
        COUNT(*) FILTER (WHERE role = 'seller') as total_sellers,
        COUNT(*) FILTER (WHERE is_active = true) as active_users
      FROM users WHERE role != 'admin'
    `;
    
    const productsSql = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status = 'available') as active_products,
        COUNT(*) FILTER (WHERE is_approved = false) as pending_approval
      FROM products
    `;
    
    const ordersSql = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
      FROM orders
    `;
    
    const [usersResult, productsResult, ordersResult] = await Promise.all([
      query(usersSql),
      query(productsSql),
      query(ordersSql)
    ]);
    
    return {
      users: {
        total: parseInt(usersResult.rows[0].total_users),
        buyers: parseInt(usersResult.rows[0].total_buyers),
        sellers: parseInt(usersResult.rows[0].total_sellers),
        active: parseInt(usersResult.rows[0].active_users)
      },
      products: {
        total: parseInt(productsResult.rows[0].total_products),
        active: parseInt(productsResult.rows[0].active_products),
        pending_approval: parseInt(productsResult.rows[0].pending_approval)
      },
      orders: {
        total: parseInt(ordersResult.rows[0].total_orders),
        completed: parseInt(ordersResult.rows[0].completed_orders),
        total_revenue: parseFloat(ordersResult.rows[0].total_revenue)
      }
    };
  }

  // Get seller dashboard data
  async getSellerDashboard(sellerId) {
    const stats = await this.getSellerStats(sellerId);
    
    const recentOrdersSql = `
      SELECT o.id, o.total_amount, o.status, o.created_at, u.username as buyer_name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.buyer_id = u.id
      WHERE oi.seller_id = $1
      ORDER BY o.created_at DESC
      LIMIT 5
    `;
    
    const recentOrdersResult = await query(recentOrdersSql, [sellerId]);
    
    return {
      stats,
      recent_orders: recentOrdersResult.rows.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount)
      }))
    };
  }

  // Get buyer dashboard data
  async getBuyerDashboard(buyerId) {
    const stats = await this.getBuyerStats(buyerId);
    
    const recentOrdersSql = `
      SELECT id, total_amount, status, created_at
      FROM orders
      WHERE buyer_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const recentOrdersResult = await query(recentOrdersSql, [buyerId]);
    
    return {
      stats,
      recent_orders: recentOrdersResult.rows.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount)
      }))
    };
  }

  // Admin functions
  async getAllUsers(filters = {}) {
    let sql = `
      SELECT id, email, username, full_name, role, is_active, is_verified, created_at
      FROM users
      WHERE role != 'admin'
    `;
    const params = [];
    let paramCount = 0;

    if (filters.role) {
      paramCount++;
      sql += ` AND role = $${paramCount}`;
      params.push(filters.role);
    }

    if (filters.is_active !== undefined) {
      paramCount++;
      sql += ` AND is_active = $${paramCount}`;
      params.push(filters.is_active);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  async deactivateUser(userId, adminId) {
    const sql = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND role != 'admin'
      RETURNING id, email, username, is_active
    `;
    const result = await query(sql, [userId]);
    
    if (result.rows.length > 0) {
      // Log admin action
      await query(
        'INSERT INTO admin_actions (admin_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
        [adminId, 'deactivate_user', 'user', userId]
      );
    }
    
    return result.rows[0];
  }

  async activateUser(userId, adminId) {
    const sql = `
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND role != 'admin'
      RETURNING id, email, username, is_active
    `;
    const result = await query(sql, [userId]);
    
    if (result.rows.length > 0) {
      // Log admin action
      await query(
        'INSERT INTO admin_actions (admin_id, action, target_type, target_id) VALUES ($1, $2, $3, $4)',
        [adminId, 'activate_user', 'user', userId]
      );
    }
    
    return result.rows[0];
  }
}

module.exports = new UserDAO();