// src/dao/orderDAO.js
const { query, getClient } = require('../config/database');

class OrderDAO {
  // Create a new order with items (transaction)
  async createOrder(buyer_id, cartItems) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
      }, 0);
      
      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (buyer_id, total_amount) VALUES ($1, $2) RETURNING *',
        [buyer_id, totalAmount]
      );
      
      const order = orderResult.rows[0];
      
      // Create order items
      const orderItems = [];
      for (const item of cartItems) {
        const itemResult = await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
          [order.id, item.product_id, item.quantity, item.price]
        );
        orderItems.push(itemResult.rows[0]);
      }
      
      // Clear the user's cart
      await client.query('DELETE FROM cart_items WHERE buyer_id = $1', [buyer_id]);
      
      await client.query('COMMIT');
      
      return {
        ...order,
        items: orderItems
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user's orders
  async findBybuyer_id(buyer_id) {
    const sql = `
      SELECT o.*, 
             COUNT(oi.id) as item_count,
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product_title', p.title,
                 'product_image', p.image_url
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.buyer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const result = await query(sql, [buyer_id]);
    return result.rows;
  }

  // Get order by ID
  async findById(orderId) {
    const sql = `
      SELECT o.*, u.username, u.email,
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product_title', p.title,
                 'product_description', p.description,
                 'product_image', p.image_url,
                 'product_category', p.category
               )
             ) as items
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, u.username, u.email
    `;
    const result = await query(sql, [orderId]);
    return result.rows[0];
  }

  // Get order statistics for a user
  async getUserOrderStats(buyer_id) {
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spent,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders
      WHERE buyer_id = $1
    `;
    const result = await query(sql, [buyer_id]);
    return result.rows[0];
  }

  // Update order status
  async updateStatus(orderId, status) {
    const sql = `
      UPDATE orders
      SET status = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [orderId, status]);
    return result.rows[0];
  }

  // Check if user owns order
  async isOrderOwner(orderId, buyer_id) {
    const sql = 'SELECT COUNT(*) as count FROM orders WHERE id = $1 AND buyer_id = $2';
    const result = await query(sql, [orderId, buyer_id]);
    return result.rows[0].count > 0;
  }

  // Get recent orders (admin function)
  async getRecentOrders(limit = 10) {
    const sql = `
      SELECT o.*, u.username, u.email
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      ORDER BY o.created_at DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }
}

module.exports = new OrderDAO();