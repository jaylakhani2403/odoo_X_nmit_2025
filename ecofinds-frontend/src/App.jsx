import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProductDetails from './pages/Products/ProductDetails.jsx';
import Cart from './pages/Cart/Cart.jsx';
import Orders from './pages/Orders/Orders';
import MyProducts from './pages/Products/MyProduct.jsx';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminPanel from './pages/AdminPanel/AdminPanel.jsx';
import Profile from './pages/Profile/Profile';

// Contexts
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Styles
import './App.css';

function App() {
  const { loading } = useAuth();
  const { theme } = useTheme();

  React.useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`app ${theme}`}>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              
              {/* Protected Routes - Buyer */}
              <Route path="/cart" element={
                <ProtectedRoute roles={['buyer', 'admin']}>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute roles={['buyer', 'admin']}>
                  <Orders />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes - Seller */}
              <Route path="/my-products" element={
                <ProtectedRoute roles={['seller', 'admin']}>
                  <MyProducts />
                </ProtectedRoute>
              } />
              <Route path="/add-product" element={
                <ProtectedRoute roles={['seller', 'admin']}>
                  <AddProduct />
                </ProtectedRoute>
              } />
              <Route path="/edit-product/:id" element={
                <ProtectedRoute roles={['seller', 'admin']}>
                  <EditProduct />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes - Admin */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes - All */}
              <Route path="/dashboard" element={
                <ProtectedRoute roles={['buyer', 'seller', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute roles={['buyer', 'seller', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}

export default App;
