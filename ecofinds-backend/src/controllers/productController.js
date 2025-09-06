// src/controllers/productController.js
const productDAO = require('../dao/productDAO');

class ProductController {
  // Get all products with filtering
  async getAllProducts(req, res) {
    try {
      const { search, category } = req.query;
      const filters = {};

      if (search) filters.search = search;
      if (category) filters.category = category;

      const products = await productDAO.findAll(filters);

      res.json({
        message: 'Products retrieved successfully',
        products,
        count: products.length
      });

    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch products'
      });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productDAO.findById(id);

      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        });
      }

      res.json({
        message: 'Product retrieved successfully',
        product
      });

    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch product'
      });
    }
  }

  // Create new product
  async createProduct(req, res) {
    try {
      const { title, description, category, price, image_url } = req.body;
      const owner_id = req.user.id;

      // Validate input
      if (!title || !description || !category || !price) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Title, description, category, and price are required'
        });
      }

      // Validate price
      if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({
          error: 'Invalid price',
          message: 'Price must be a positive number'
        });
      }

      // Valid categories
      const validCategories = ['Electronics', 'Clothing', 'Books', 'Furniture', 'Toys', 'Sports', 'Miscellaneous'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: 'Invalid category',
          message: `Category must be one of: ${validCategories.join(', ')}`
        });
      }

      const productData = {
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        image_url: image_url?.trim() || null,
        owner_id
      };

      const newProduct = await productDAO.create(productData);

      res.status(201).json({
        message: 'Product created successfully',
        product: newProduct
      });

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not create product'
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { title, description, category, price, image_url } = req.body;
      const userId = req.user.id;

      // Check if product exists and user owns it
      const existingProduct = await productDAO.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        });
      }

      if (existingProduct.owner_id !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only update your own products'
        });
      }

      // Validate input
      if (!title || !description || !category || !price) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Title, description, category, and price are required'
        });
      }

      // Validate price
      if (isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({
          error: 'Invalid price',
          message: 'Price must be a positive number'
        });
      }

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        image_url: image_url?.trim() || existingProduct.image_url
      };

      const updatedProduct = await productDAO.update(id, updateData);

      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not update product'
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if product exists and user owns it
      const existingProduct = await productDAO.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        });
      }

      if (existingProduct.owner_id !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only delete your own products'
        });
      }

      await productDAO.delete(id);

      res.json({
        message: 'Product deleted successfully'
      });

    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not delete product'
      });
    }
  }

  // Get user's products
  async getUserProducts(req, res) {
    try {
      const userId = req.user.id;
      // console.log('Fetching products for user ID:', userId);
      const products = await productDAO.findByOwnerId(userId);
      // console.log(products)

      res.json({
        message: 'User products retrieved successfully',
        products,
        count: products.length
      });

    } catch (error) {
      console.error('Get user products error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch user products'
      });
    }
  }

  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const products = await productDAO.findByCategory(category);

      res.json({
        message: `Products in ${category} category retrieved successfully`,
        products,
        count: products.length,
        category
      });

    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch products by category'
      });
    }
  }
}

module.exports = new ProductController();