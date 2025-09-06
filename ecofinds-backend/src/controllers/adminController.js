// src/controllers/adminController.js - Admin-specific operations
const userDAO = require('../dao/userDAO');
const productDAO = require('../dao/productDAO');
const orderDAO = require('../dao/orderDAO');
const { query } = require('../config/database');

class AdminController {
  // Get all users with filtering
  async getAllUsers(req, res) {
    try {
      const { role, is_active, page = 1, limit = 20 } = req.query;
      
      const filters = {};
      if (role) filters.role = role;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      const users = await userDAO.getAllUsers(filters);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        users,
        count: users.length,
        filters
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch users'
      });
    }
  }

  // Deactivate user account
  async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      if (parseInt(id) === adminId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate self',
          message: 'You cannot deactivate your own account'
        });
      }

      const updatedUser = await userDAO.deactivateUser(id, adminId);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with this ID does not exist or is an admin'
        });
      }

      res.json({
        success: true,
        message: 'User account deactivated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not deactivate user'
      });
    }
  }

  // Activate user account
  async activateUser(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const updatedUser = await userDAO.activateUser(id, adminId);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User with this ID does not exist or is an admin'
        });
      }

      res.json({
        success: true,
        message: 'User account activated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not activate user'
      });
    }
  }

  // Get all products (including unapproved ones)
  async getAllProducts(req, res) {
    try {
      const { is_approved, status, category } = req.query;
      
      let sql = `
        SELECT p.*, u.username as owner_name, u.email as owner_email
        FROM products p
        JOIN users u ON p.owner_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (is_approved !== undefined) {
        paramCount++;
        sql += ` AND p.is_approved = $${paramCount}`;
        params.push(is_approved === 'true');
      }

      if (status) {
        paramCount++;
        sql += ` AND p.status = $${paramCount}`;
        params.push(status);
      }

      if (category) {
        paramCount++;
        sql += ` AND p.category = $${paramCount}`;
        params.push(category);
      }

      sql += ' ORDER BY p.created_at DESC';

      const result = await query(sql, params);

      res.json({
        success: true,
        message: 'Products retrieved successfully',
        products: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch products'
      });
    }
  }

  // Approve product
  async approveProduct(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const sql = `
        UPDATE products 
        SET is_approved = true, approved_by = $2, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await query(sql, [id, adminId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        });
      }

      // Log admin action
      await query(
        'INSERT INTO admin_actions (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
        [adminId, 'approve_product', 'product', id, `Product "${result.rows[0].title}" approved`]
      );

      res.json({
        success: true,
        message: 'Product approved successfully',
        product: result.rows[0]
      });

    } catch (error) {
      console.error('Approve product error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not approve product'
      });
    }
  }

  // Reject product
  async rejectProduct(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const sql = `
        UPDATE products 
        SET is_approved = false, status = 'removed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        });
      }

      // Log admin action
      await query(
        'INSERT INTO admin_actions (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
        [adminId, 'reject_product', 'product', id, `Product "${result.rows[0].title}" rejected. Reason: ${reason || 'No reason provided'}`]
      );

      res.json({
        success: true,
        message: 'Product rejected successfully',
        product: result.rows[0]
      });

    } catch (error) {
      console.error('Reject product error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not reject product'
      });
    }
  }

  // Get all orders
  async getAllOrders(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      let sql = `
        SELECT o.*, u.username as buyer_name, u.email as buyer_email
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        sql += ` WHERE o.status = $${paramCount}`;
        params.push(status);
      }

      sql += ' ORDER BY o.created_at DESC';

      const result = await query(sql, params);

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        orders: result.rows.map(order => ({
          ...order,
          total_amount: parseFloat(order.total_amount)
        })),
        count: result.rows.length
      });

    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch orders'
      });
    }
  }

  // Get admin action logs
  async getAdminLogs(req, res) {
    try {
      const { limit = 50 } = req.query;
      
      const sql = `
        SELECT aa.*, u.username as admin_name
        FROM admin_actions aa
        JOIN users u ON aa.admin_id = u.id
        ORDER BY aa.created_at DESC
        LIMIT $1
      `;
      
      const result = await query(sql, [limit]);

      res.json({
        success: true,
        message: 'Admin logs retrieved successfully',
        logs: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Get admin logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch admin logs'
      });
    }
  }

  // Get platform statistics
  async getPlatformStats(req, res) {
    try {
      const dashboard = await userDAO.getAdminDashboard(req.user.id);
      
      res.json({
        success: true,
        message: 'Platform statistics retrieved successfully',
        stats: dashboard
      });

    } catch (error) {
      console.error('Get platform stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Could not fetch platform statistics'
      });
    }
  }
}

module.exports = new AdminController();