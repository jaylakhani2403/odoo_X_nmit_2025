import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Products.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isBuyer } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      if (response && response.product) {
        setProduct(response.product);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    if (!isBuyer()) {
      toast.error('Only buyers can add items to cart');
      return;
    }

    try {
      await cartService.addToCart(product.id, 1);
      toast.success('Item added to cart!');
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner text="Loading product..." />;
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/')} className="btn btn--primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="container">
        <div className="product-details">
          <div className="product-image">
            <img
              src={product.image_url || 'https://via.placeholder.com/500x400?text=No+Image'}
              alt={product.title}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x400?text=No+Image';
              }}
            />
          </div>
          
          <div className="product-info">
            <div className="product-category">{product.category}</div>
            <h1 className="product-title">{product.title}</h1>
            <div className="product-price">{formatPrice(product.price)}</div>
            
            <div className="product-meta">
              <div className="meta-item">
                <i className="fas fa-user"></i>
                <span>Seller: {product.owner_name || product.seller_name}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>Listed: {new Date(product.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
            
            <div className="product-actions">
              {isAuthenticated && isBuyer() && (
                <button
                  onClick={handleAddToCart}
                  className="btn btn--primary btn--large"
                >
                  <i className="fas fa-cart-plus"></i>
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="btn btn--outline btn--large"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
