import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './Home.css';

const categoriesArr = ['Electronics', 'Clothing', 'Books', 'Furniture', 'Toys', 'Sports', 'Miscellaneous'];

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title: A-Z' },
  { value: 'title-desc', label: 'Title: Z-A' }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const { isAuthenticated, isBuyer } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      if (response && Array.isArray(response.products)) {
        setProducts(response.products);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price); break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title)); break;
      // Add more as needed
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  // Group products by category
  const getGroupedProducts = () => {
    const groups = {};
    filteredProducts.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(product);
    });
    return groups;
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    if (!isBuyer()) {
      toast.error('Only buyers can add items to cart');
      return;
    }
    try {
      await cartService.addToCart(productId, 1);
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
    return <LoadingSpinner text="Loading products..." />;
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__content">
          <h1>Welcome to EcoFinds</h1>
          <p>Discover amazing second-hand treasures while helping the environment</p>
          <div className="hero__stats">
            <div className="stat">
              <span className="stat__number">{products.length}</span>
              <span className="stat__label">Products Available</span>
            </div>
            <div className="stat">
              <span className="stat__number">♻️</span>
              <span className="stat__label">Eco-Friendly</span>
            </div>
            <div className="stat">
              <span className="stat__number">🌱</span>
              <span className="stat__label">Sustainable</span>
            </div>
          </div>
        </div>
      </section>
  
      <section className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categoriesArr.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="sort-filter">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="category-select"
            >
              {sortOptions.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <div className="groupby-toggle">
            <label>
              <input
                type="checkbox"
                checked={groupByCategory}
                onChange={(e) => setGroupByCategory(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Group by Category
            </label>
          </div>
        </div>
      </section>
  
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Available Products</h2>
            <p>Showing {filteredProducts.length} product{filteredProducts.length!==1 && "s"}</p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            !groupByCategory ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-card__image">
                      <img 
                        src={product.image_url || product.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                        alt={product.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className="product-card__category">
                        {product.category}
                      </div>
                    </div>
                    <div className="product-card__content">
                      <h3 className="product-card__title">{product.title}</h3>
                      <p className="product-card__description">
                        {product.description?.substring(0, 100)}...
                      </p>
                      <div className="product-card__meta">
                        <span className="product-card__seller">
                          <i className="fas fa-user"></i>
                          {product.owner_name || product.seller_name}
                        </span>
                      </div>
                      <div className="product-card__footer">
                        <span className="product-card__price">
                          {formatPrice(product.price)}
                        </span>
                        <div className="product-card__actions">
                          <Link 
                            to={`/products/${product.id}`}
                            className="btn btn--outline btn--small"
                          >
                            View Details
                          </Link>
                          {isAuthenticated && isBuyer() && (
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              className="btn btn--primary btn--small"
                            >
                              <i className="fas fa-cart-plus"></i>
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grouped by category view
              Object.entries(getGroupedProducts()).map(([cat, prods]) => (
                <div key={cat} style={{ margin: '32px 0' }}>
                  <h3 style={{ margin: '16px 0 16px 8px', color: '#10B981' }}>{cat}</h3>
                  <div className="products-grid">
                    {prods.map(product => (
                      <div key={product.id} className="product-card">
                        <div className="product-card__image">
                          <img 
                            src={product.image_url || product.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                            alt={product.title}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                          <div className="product-card__category">
                            {product.category}
                          </div>
                        </div>
                        <div className="product-card__content">
                          <h3 className="product-card__title">{product.title}</h3>
                          <p className="product-card__description">
                            {product.description?.substring(0, 100)}...
                          </p>
                          <div className="product-card__meta">
                            <span className="product-card__seller">
                              <i className="fas fa-user"></i>
                              {product.owner_name || product.seller_name}
                            </span>
                          </div>
                          <div className="product-card__footer">
                            <span className="product-card__price">
                              {formatPrice(product.price)}
                            </span>
                            <div className="product-card__actions">
                              <Link 
                                to={`/products/${product.id}`}
                                className="btn btn--outline btn--small"
                              >
                                View Details
                              </Link>
                              {isAuthenticated && isBuyer() && (
                                <button
                                  onClick={() => handleAddToCart(product.id)}
                                  className="btn btn--primary btn--small"
                                >
                                  <i className="fas fa-cart-plus"></i>
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
