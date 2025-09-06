import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Orders.css';
import { resolvePath } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      console.log('Orders data:', response.orders); // Debug log
      if (response && response.orders) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>Your Orders</h1>
          <p>{orders.length} orders found</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <i className="fas fa-shopping-bag"></i>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here!</p>
            <a href="/" className="btn btn--primary">Browse Products</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <strong>Order #{order.id}</strong>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`status-badge status-badge--${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-content">
                  <div className="order-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">{formatPrice(order.total_amount)}</span>
                  </div>
                  
                  {order.items && order.items.length > 0 && (
                    <div className="order-items">
                      <h4>Items ({order.items.length})</h4>
                      <div className="items-list">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="order-item">
                            <span className="item-name">{item.product_title}</span>
                            <span className="item-p">Rs {item.price}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="more-items">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
