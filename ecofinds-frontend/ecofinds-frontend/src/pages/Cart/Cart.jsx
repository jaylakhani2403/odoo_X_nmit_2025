import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response && response.cart) {
        setCartItems(response.cart.items || []);
      }
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateCartItem(productId, newQuantity);
      setCartItems(prev =>
        prev.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      toast.error('Could not update quantity.');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeFromCart(productId);
      setCartItems(cartItems.filter(item => item.product_id !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      setProcessingCheckout(true);
      const response = await orderService.checkout();
      if (response.success) {
        toast.success('Order placed successfully! 🎉');
        setCartItems([]);  // Cart cleared, triggers rerender and shows empty cart UI!
        // await cartService.clearCart(); // Uncomment ONLY if backend doesn't auto-clear the cart on successful orders
        setTimeout(() => {
          navigate('/orders');
        }, 1200); // See empty cart and toast before redirect
      } else {
        toast.error(response.message || 'Checkout failed');
      }
    } catch (error) {
      toast.error(error.message || 'Checkout failed');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const formatPrice = (price) => (
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)
  );

  const getTotalPrice = () => (
    cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  );

  if (loading) {
    return <LoadingSpinner text="Loading cart..." />;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartItems.length} items in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-cart"></i>
            <h3>Your cart is empty</h3>
            <p>Add some eco-friendly products to get started!</p>
            <button onClick={() => navigate('/')} className="btn btn--primary">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.product_id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={item.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-seller">by {item.seller_name}</p>
                    <div className="item-meta">
                      <span className="item-category">{item.category}</span>
                      <span className="item-quantity">
                        Qty:
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span style={{minWidth: '2rem', textAlign: 'center', display: 'inline-block'}}>{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >+</button>
                      </span>
                      <span className="item-quantity">Item Cost: Rs {item.price}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <div className="item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="btn btn--outline btn--small remove-btn"
                    >
                      <i className="fas fa-trash"></i>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Items ({cartItems.length})</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={processingCheckout}
                  className="btn btn--primary btn--full checkout-btn"
                >
                  {processingCheckout ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card"></i>
                      Proceed to Checkout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
