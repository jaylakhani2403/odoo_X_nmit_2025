import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isSeller, isBuyer } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'navbar__role-badge--admin';
      case 'seller': return 'navbar__role-badge--seller';
      case 'buyer': return 'navbar__role-badge--buyer';
      default: return 'navbar__role-badge--default';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <i className="fas fa-leaf"></i>
          <span>EcoFinds</span>
        </Link>

        <nav className="navbar__nav">
          <Link to="/" className="navbar__link">Home</Link>
          
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar__link">Login</Link>
              <Link to="/register" className="navbar__link">Register</Link>
            </>
          ) : (
            <>
              {isBuyer() && (
                <>
                  <Link to="/cart" className="navbar__link">
                    <i className="fas fa-shopping-cart"></i> Cart
                  </Link>
                  <Link to="/orders" className="navbar__link">Orders</Link>
                </>
              )}
              
              {isSeller() && (
                <>
                  <Link to="/my-products" className="navbar__link">My Products</Link>
                  <Link to="/add-product" className="navbar__link">
                    <i className="fas fa-plus"></i> Add Product
                  </Link>
                </>
              )}
              
              {isAdmin() && (
                <Link to="/admin" className="navbar__link navbar__link--admin">
                  <i className="fas fa-cog"></i> Admin
                </Link>
              )}
              
              <Link to="/dashboard" className="navbar__link">Dashboard</Link>
              <Link to="/profile" className="navbar__link">Profile</Link>
            </>
          )}
        </nav>

        <div className="navbar__actions">
          <button 
            onClick={toggleTheme} 
            className="navbar__theme-toggle"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
          </button>

          {isAuthenticated && (
            <div className="navbar__user">
              <span className={`navbar__role-badge ${getRoleBadgeColor(user?.role)}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              <span className="navbar__username">{user?.username}</span>
              <button onClick={handleLogout} className="navbar__logout">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
