// src/dao/cartDAO.js
const { query } = require('../config/database');

class CartDAO {
  // Add item to cart
  async addItem(buyer_id, productId, quantity = 1) {
    const sql = `
      INSERT INTO cart_items (buyer_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (buyer_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + $3
      RETURNING *
    `;
    const result = await query(sql, [buyer_id, productId, quantity]);
    return result.rows[0];
  }

  // Get user's cart items
  async findBybuyer_id(buyer_id) {
    const sql = `
    SELECT ci.*, p.title, p.description, p.price, p.image_url, p.category, p.status,
           u.username as owner_name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN users u ON p.owner_id = u.id
    WHERE ci.buyer_id = $1
    ORDER BY ci.created_at DESC
  `;
    const result = await query(sql, [buyer_id]);
    return result.rows;
  }

  // Remove item from cart
  async removeItem(buyer_id, productId) {
    const sql = 'DELETE FROM cart_items WHERE buyer_id = $1 AND product_id = $2 RETURNING *';
    const result = await query(sql, [buyer_id, productId]);
    return result.rows[0];
  }

  // Clear user's cart
  async clearCart(buyer_id) {
    const sql = 'DELETE FROM cart_items WHERE buyer_id = $1 RETURNING *';
    const result = await query(sql, [buyer_id]);
    return result.rows;
  }

  // Update item quantity
  async updateQuantity(buyer_id, productId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(buyer_id, productId);
    }
    
    const sql = `
      UPDATE cart_items
      SET quantity = $3
      WHERE buyer_id = $1 AND product_id = $2
      RETURNING *
    `;
    const result = await query(sql, [buyer_id, productId, quantity]);
    return result.rows[0];
  }

  // Check if item exists in cart
  async itemExists(buyer_id, productId) {
    const sql = 'SELECT COUNT(*) as count FROM cart_items WHERE buyer_id = $1 AND product_id = $2';
    const result = await query(sql, [buyer_id, productId]);
    return result.rows[0].count > 0;
  }

  // Get cart item count for user
  async getItemCount(buyer_id) {
    const sql = 'SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE buyer_id = $1';
    const result = await query(sql, [buyer_id]);
    return parseInt(result.rows[0].count);
  }

  // Get cart total value
  async getCartTotal(buyer_id) {
    const sql = `
      SELECT COALESCE(SUM(ci.quantity * p.price), 0) as total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.buyer_id = $1
    `;
    const result = await query(sql, [buyer_id]);
    return parseFloat(result.rows[0].total);
  }
}

module.exports = new CartDAO();