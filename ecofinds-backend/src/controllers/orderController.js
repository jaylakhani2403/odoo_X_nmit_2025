// src/controllers/orderController.js
const orderDAO = require('../dao/orderDAO');
const cartDAO = require('../dao/cartDAO');

class OrderController {
  // Checkout cart and create order
  async checkout(req, res) {
    try {
      const userId = req.user.id;

      // Get user's cart items
      const cartItems = await cartDAO.findBybuyer_id(userId);
      

      if (cartItems.length === 0) {
        return res.status(400).json({
          error: 'Empty cart',
          message: 'Cannot checkout with an empty cart'
        });
      }

       // Debug log
      // Validate all cart items are still available
      for (const item of cartItems) {
        if (item.status !== 'available') {
          return res.status(400).json({
            error: 'Product not available',
            message: `Product "${item.title}" is no longer available`
          });
        }
      }

      // Create order with cart items
      const order = await orderDAO.createOrder(userId, cartItems);

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.id,
          total_amount: parseFloat(order.total_amount),
          status: order.status,
          created_at: order.created_at,
          items: order.items
        }
      });

    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not process checkout'
      });
    }
  }

  // Get user's orders
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await orderDAO.findBybuyer_id(userId);

      // Format orders for response
      const formattedOrders = orders.map(order => ({
        id: order.id,
        total_amount: parseFloat(order.total_amount),
        status: order.status,
        created_at: order.created_at,
        item_count: parseInt(order.item_count),
        items: order.items || []
      }));

      res.json({
        message: 'Orders retrieved successfully',
        orders: formattedOrders,
        count: formattedOrders.length
      });

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch orders'
      });
    }
  }

  // Get specific order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await orderDAO.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
          message: 'Order with this ID does not exist'
        });
      }

      // Check if user owns this order
      if (order.user_id !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only view your own orders'
        });
      }

      res.json({
        message: 'Order retrieved successfully',
        order: {
          id: order.id,
          total_amount: parseFloat(order.total_amount),
          status: order.status,
          created_at: order.created_at,
          user: {
            username: order.username,
            email: order.email
          },
          items: order.items || []
        }
      });

    } catch (error) {
      console.error('Get order by ID error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch order'
      });
    }
  }

  // Get order statistics for user
  async getOrderStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await orderDAO.getUserOrderStats(userId);

      res.json({
        message: 'Order statistics retrieved successfully',
        stats: {
          total_orders: parseInt(stats.total_orders),
          total_spent: parseFloat(stats.total_spent),
          average_order_value: parseFloat(stats.average_order_value)
        }
      });

    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch order statistics'
      });
    }
  }

  // Cancel order (if allowed)
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if order exists and user owns it
      const order = await orderDAO.findById(id);
      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
          message: 'Order with this ID does not exist'
        });
      }

      if (order.user_id !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only cancel your own orders'
        });
      }

      // Check if order can be cancelled
      if (order.status !== 'pending') {
        return res.status(400).json({
          error: 'Cannot cancel order',
          message: 'Only pending orders can be cancelled'
        });
      }

      // Update order status
      const updatedOrder = await orderDAO.updateStatus(id, 'cancelled');

      res.json({
        message: 'Order cancelled successfully',
        order: {
          id: updatedOrder.id,
          status: updatedOrder.status,
          total_amount: parseFloat(updatedOrder.total_amount)
        }
      });

    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not cancel order'
      });
    }
  }
}

module.exports = new OrderController();