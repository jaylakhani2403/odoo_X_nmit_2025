import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getUserProducts();
      console.log('Fetched products:', response.products);
      if (JSON.stringify(products) !== JSON.stringify(response.products)) {
  setProducts(response.products || []);
}
    //   if (Array.isArray(response.products)) {
    //     setProducts(response.products || []);
    //   }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your products..." />;
  }

  return (
    <div className="my-products-page">
      <div className="container">
        <div className="page-header">
          <h1>My Products</h1>
          <Link to="/add-product" className="btn btn--primary">
            <i className="fas fa-plus"></i>
            Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-box"></i>
            <h3>No products listed yet</h3>
            <p>Start selling by adding your first product!</p>
            <Link to="/add-product" className="btn btn--primary">
              Add Product
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-card__image">
                  <img 
                    src={product.image_url || 'data:image/png;base64,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'} 
                    alt={product.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  <div className="product-card__status">
                    {product.is_approved ? 'Approved' : 'Pending'}
                  </div>
                </div>
                
                <div className="product-card__content">
                  <h3 className="product-card__title">{product.title}</h3>
                  <p className="product-card__description">
                    {product.description?.substring(0, 100)}...
                  </p>
                  
                  <div className="product-card__footer">
                    <span className="product-card__price">
                      {formatPrice(product.price)}
                    </span>
                    
                    <div className="product-card__actions">
                      <Link 
                        to={`/edit-product/${product.id}`}
                        className="btn btn--outline btn--small"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn--error btn--small"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
