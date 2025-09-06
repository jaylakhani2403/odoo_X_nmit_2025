import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <div className="footer__brand">
              <i className="fas fa-leaf"></i>
              <span>EcoFinds</span>
            </div>
            <p className="footer__description">
              Sustainable second-hand marketplace promoting circular economy and environmental responsibility.
            </p>
          </div>

          <div className="footer__section">
            <h4>Quick Links</h4>
            <div className="footer__links">
              <Link to="/" className="footer__link">Home</Link>
              <Link to="/about" className="footer__link">About</Link>
              <Link to="/contact" className="footer__link">Contact</Link>
            </div>
          </div>

          <div className="footer__section">
            <h4>Categories</h4>
            <div className="footer__links">
              <Link to="/products?category=Electronics" className="footer__link">Electronics</Link>
              <Link to="/products?category=Clothing" className="footer__link">Clothing</Link>
              <Link to="/products?category=Books" className="footer__link">Books</Link>
              <Link to="/products?category=Furniture" className="footer__link">Furniture</Link>
            </div>
          </div>

          <div className="footer__section">
            <h4>Support</h4>
            <div className="footer__links">
              <a href="#" className="footer__link">Help Center</a>
              <a href="#" className="footer__link">Privacy Policy</a>
              <a href="#" className="footer__link">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; 2025 EcoFinds. All rights reserved.</p>
          <div className="footer__social">
            <a href="#" className="footer__social-link"><i className="fab fa-facebook"></i></a>
            <a href="#" className="footer__social-link"><i className="fab fa-twitter"></i></a>
            <a href="#" className="footer__social-link"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
