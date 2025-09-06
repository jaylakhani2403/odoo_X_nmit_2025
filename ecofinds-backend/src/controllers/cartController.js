// src/controllers/cartController.js
const cartDAO = require('../dao/cartDAO');
const productDAO = require('../dao/productDAO');

class CartController {
  // Get user's cart
  async getCart(req, res) {
    try {
      const buyer_id = req.user.id;
      const cartItems = await cartDAO.findBybuyer_id(buyer_id);
      const total = await cartDAO.getCartTotal(buyer_id);

      res.json({
        message: 'Cart retrieved successfully',
        cart: {
          items: cartItems,
          total: parseFloat(total),
          count: cartItems.length
        }
      });

    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch cart'
      });
    }
  }

  // Add item to cart
  async addToCart(req, res) {
    try {
      const buyer_id = req.user.id;
      const { product_id, quantity = 1 } = req.body;
      console.log('Add to cart request body:', product_id,quantity,buyer_id); // Debug log
      // Validate input
      if (!product_id) {
        return res.status(400).json({
          error: 'Missing product ID',
          message: 'Product ID is required'
        });
      }

      // Check if product exists
      const product = await productDAO.findById(product_id);
      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
          message: 'Product with this ID does not exist'
        });
      }

      // Check if user is trying to add their own product
      if (product.owner_id === buyer_id) {
        return res.status(400).json({
          error: 'Cannot add own product',
          message: 'You cannot add your own product to cart'
        });
      }

      // Check if product is available
      if (product.status !== 'available') {
        return res.status(400).json({
          error: 'Product not available',
          message: 'This product is not available for purchase'
        });
      }

      // Validate quantity
      if (quantity < 1 || quantity > 10) {
        return res.status(400).json({
          error: 'Invalid quantity',
          message: 'Quantity must be between 1 and 10'
        });
      }

      // Add to cart
      const cartItem = await cartDAO.addItem(buyer_id, product_id, quantity);

      // Get updated cart
      const updatedCartItems = await cartDAO.findBybuyer_id(buyer_id);
      const total = await cartDAO.getCartTotal(buyer_id);

      res.status(201).json({
        message: 'Item added to cart successfully',
        cart: {
          items: updatedCartItems,
          total: parseFloat(total),
          count: updatedCartItems.length
        }
      });

    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not add item to cart'
      });
    }
  }

  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const buyer_id = req.user.id;
      const { product_id } = req.params;

      // Check if item exists in cart
      const itemExists = await cartDAO.itemExists(buyer_id, product_id);
      if (!itemExists) {
        return res.status(404).json({
          error: 'Item not in cart',
          message: 'This item is not in your cart'
        });
      }

      // Remove from cart
      await cartDAO.removeItem(buyer_id, product_id);

      // Get updated cart
      const updatedCartItems = await cartDAO.findBybuyer_id(buyer_id);
      const total = await cartDAO.getCartTotal(buyer_id);

      res.json({
        message: 'Item removed from cart successfully',
        cart: {
          items: updatedCartItems,
          total: parseFloat(total),
          count: updatedCartItems.length
        }
      });

    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not remove item from cart'
      });
    }
  }

  // Update item quantity in cart
  async updateCartItem(req, res) {
    try {
      const buyer_id = req.user.id;
      const { product_id } = req.params;
      const { quantity } = req.body;

      // Validate quantity
      if (!quantity || quantity < 0 || quantity > 10) {
        return res.status(400).json({
          error: 'Invalid quantity',
          message: 'Quantity must be between 0 and 10'
        });
      }

      // Check if item exists in cart
      const itemExists = await cartDAO.itemExists(buyer_id, product_id);
      if (!itemExists) {
        return res.status(404).json({
          error: 'Item not in cart',
          message: 'This item is not in your cart'
        });
      }

      // Update quantity (if 0, item will be removed)
      await cartDAO.updateQuantity(buyer_id, product_id, quantity);

      // Get updated cart
      const updatedCartItems = await cartDAO.findBybuyer_id(buyer_id);
      const total = await cartDAO.getCartTotal(buyer_id);

      res.json({
        message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated successfully',
        cart: {
          items: updatedCartItems,
          total: parseFloat(total),
          count: updatedCartItems.length
        }
      });

    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not update cart item'
      });
    }
  }

  // Clear entire cart
  async clearCart(req, res) {
    try {
      const buyer_id = req.user.id;
      await cartDAO.clearCart(buyer_id);

      res.json({
        message: 'Cart cleared successfully',
        cart: {
          items: [],
          total: 0,
          count: 0
        }
      });

    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not clear cart'
      });
    }
  }

  // Get cart summary
  async getCartSummary(req, res) {
    try {
      const buyer_id = req.user.id;
      const itemCount = await cartDAO.getItemCount(buyer_id);
      const total = await cartDAO.getCartTotal(buyer_id);

      res.json({
        message: 'Cart summary retrieved successfully',
        summary: {
          itemCount: parseInt(itemCount),
          total: parseFloat(total)
        }
      });

    } catch (error) {
      console.error('Get cart summary error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch cart summary'
      });
    }
  }
}

module.exports = new CartController();