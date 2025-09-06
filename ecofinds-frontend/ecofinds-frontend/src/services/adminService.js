import api from './api';

class AdminService {
  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response;
  }

  async getAllProducts() {
    const response = await api.get('/admin/products');
    return response;
  }

  async approveProduct(productId) {
    const response = await api.put(`/admin/products/${productId}/approve`);
    return response;
  }

  async rejectProduct(productId) {
    const response = await api.put(`/admin/products/${productId}/reject`);
    return response;
  }

  async getPlatformStats() {
    const response = await api.get('/admin/stats');
    return response;
  }
}

export const adminService = new AdminService();
