import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin, isSeller, isBuyer } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await authService.getDashboard();
      if (response && response.dashboard) {
        console.log('Dashboard data:', response); // Debug log
        setDashboardData(response.dashboard);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const getRoleWelcome = () => {
    if (isAdmin()) return 'Admin Dashboard';
    if (isSeller()) return 'Seller Dashboard';
    if (isBuyer()) return 'Buyer Dashboard';
    return 'Dashboard';
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.username}!</h1>
          <p className="dashboard-subtitle">{getRoleWelcome()}</p>
        </div>

        <div className="dashboard-grid">
          {isAdmin() && (
            <>
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Platform Overview</h3>
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="card-content">
                  <div className="stat">
                    <span className="stat-number">{dashboardData?.users?.total || 0}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{dashboardData?.products?.total || 0}</span>
                    <span className="stat-label">Products Listed</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{dashboardData?.orders?.total || 0}</span>
                    <span className="stat-label">Orders Placed</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isSeller() && (
            <>
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Your Products</h3>
                  <i className="fas fa-box"></i>
                </div>
                <div className="card-content">
                  <div className="stat">
                    <span className="stat-number">{dashboardData?.stats?.total_products || 0}</span>
                    <span className="stat-label">Total Products</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{dashboardData?.stats?.active_products || 0}</span>
                    <span className="stat-label">Active Listings</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">₹{dashboardData?.stats?.total_earnings || 0}</span>
                    <span className="stat-label">Total Earnings</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isBuyer() && (
            <>
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Your Orders</h3>
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <div className="card-content">
                  <div className="stat">
                    <span className="stat-number">{dashboardData?.stats?.total_orders || 0}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">₹{dashboardData?.stats?.total_spent || 0}</span>
                    <span className="stat-label">Total Spent</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{dashboardData?.stats?.items_in_cart/dashboardData?.stats?.total_orders || 0}</span>
                    <span className="stat-label">Items in Cart</span>
                    
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
              <i className="fas fa-lightning-bolt"></i>
            </div>
            <div className="card-content">
              <div className="quick-actions">
                {isBuyer() && (
                  <a href="/cart" className="btn btn--primary">View Cart</a>
                )}
                {isSeller() && (
                  <>
                    <a href="/add-product" className="btn btn--primary">Add Product</a>
                    <a href="/my-products" className="btn btn--outline">My Products</a>
                  </>
                )}
                {isAdmin() && (
                  <a href="/admin" className="btn btn--primary">Admin Panel</a>
                )}
                <a href="/profile" className="btn btn--outline">Edit Profile</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
