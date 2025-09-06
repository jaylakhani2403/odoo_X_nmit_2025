import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-toastify';
import './AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, productsResponse] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getAllUsers(),
        adminService.getAllProducts()
      ]);
      if (statsResponse.success) setStats(statsResponse.stats);
      if (usersResponse.success) setUsers(usersResponse.users);
      if (productsResponse.success) setProducts(productsResponse.products);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await adminService.approveProduct(productId);
      toast.success('Product approved');
      loadAdminData();
    } catch (error) {
      toast.error('Failed to approve product');
    }
  };

  const handleRejectProduct = async (productId) => {
    try {
      await adminService.rejectProduct(productId);
      toast.success('Product rejected');
      loadAdminData();
    } catch (error) {
      toast.error('Failed to reject product');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin panel..." />;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p>Manage your EcoFinds marketplace</p>
        </div>

        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            Products ({products.length})
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <div className="stat-number">{stats?.users?.total || 0}</div>
                  <div className="stat-breakdown">
                    <span>Buyers: {stats?.users?.buyers || 0}</span>
                    <span>Sellers: {stats?.users?.sellers || 0}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <h3>Products</h3>
                  <div className="stat-number">{stats?.products?.total || 0}</div>
                  <div className="stat-breakdown">
                    <span>Active: {stats?.products?.active || 0}</span>
                    <span>Pending: {stats?.products?.pending_approval || 0}</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <h3>Orders</h3>
                  <div className="stat-number">{stats?.orders?.total || 0}</div>
                  <div className="stat-breakdown">
                    <span>Completed: {stats?.orders?.completed || 0}</span>
                    <span>Revenue: ₹{stats?.orders?.total_revenue || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-badge--${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-tab">
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Seller</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      {/* <th>Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <img
                              src={product.image_url || 'https://via.placeholder.com/40x40'}
                              alt={product.title}
                              className="product-thumb"
                            />
                            <span>{product.title}</span>
                          </div>
                        </td>
                        <td>{product.owner_name}</td>
                        <td>{product.category}</td>
                        <td>₹{product.price}</td>
                        <td>
                          <span className={`status-badge ${product.is_approved ? 'approved' : 'pending'}`}>
                            {product.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        {/* <td>
                          {!product.is_approved && (
                            <div className="action-buttons">
                              <button
                                onClick={() => handleApproveProduct(product.id)}
                                className="btn btn--small btn--success"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectProduct(product.id)}
                                className="btn btn--small btn--error"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
