// src/dao/productDAO.js
const { query } = require('../config/database');

class ProductDAO {
  // Create a new product
  async create(productData) {
    const { title, description, category, price, image_url, owner_id } = productData;
    const sql = `
      INSERT INTO products (title, description, category, price, image_url, owner_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(sql, [title, description, category, price, image_url, owner_id]);
    return result.rows[0];
  }

  // Get all products with optional filtering
  async findAll(filters = {}) {
    let sql = `
      SELECT p.*, u.username as owner_name
      FROM products p
      JOIN users u ON p.owner_id = u.id
      WHERE p.status = 'available'
    `;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (filters.search) {
      paramCount++;
      sql += ` AND (LOWER(p.title) LIKE LOWER($${paramCount}) OR LOWER(p.description) LIKE LOWER($${paramCount}))`;
      params.push(`%${filters.search}%`);
    }

    // Add category filter
    if (filters.category) {
      paramCount++;
      sql += ` AND p.category = $${paramCount}`;
      params.push(filters.category);
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  // Find product by ID
  async findById(id) {
    const sql = `
      SELECT p.*, u.username as owner_name, u.email as owner_email
      FROM products p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find products by owner
  async findByOwnerId(ownerId) {
    const sql = `
      SELECT p.*, u.username as owner_name
      FROM products p
      JOIN users u ON p.owner_id = u.id
      WHERE p.owner_id = $1
      ORDER BY p.created_at DESC
    `;
    const result = await query(sql, [ownerId]);
    return result.rows;
  }

  // Update product
  async update(id, productData) {
    const { title, description, category, price, image_url } = productData;
    const sql = `
      UPDATE products
      SET title = $2, description = $3, category = $4, price = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, title, description, category, price, image_url]);
    return result.rows[0];
  }

  // Delete product
  async delete(id) {
    const sql = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Check if user owns product
  async isOwner(productId, userId) {
    const sql = 'SELECT COUNT(*) as count FROM products WHERE id = $1 AND owner_id = $2';
    const result = await query(sql, [productId, userId]);
    return result.rows[0].count > 0;
  }

  // Update product status
  async updateStatus(id, status) {
    const sql = `
      UPDATE products
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, status]);
    return result.rows[0];
  }

  // Get products by category
  async findByCategory(category) {
    const sql = `
      SELECT p.*, u.username as owner_name
      FROM products p
      JOIN users u ON p.owner_id = u.id
      WHERE p.category = $1 AND p.status = 'available'
      ORDER BY p.created_at DESC
    `;
    const result = await query(sql, [category]);
    return result.rows;
  }
}

module.exports = new ProductDAO();