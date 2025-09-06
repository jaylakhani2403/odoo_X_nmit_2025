import api from './api';

class AuthService {
  constructor() {
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response;
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response;
  }

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response;
  }

  async updateProfile(userData) {
    console.log(userData);
    const response = await api.put('/auth/profile', userData);
    return response;
  }

  async getDashboard() {
    const response = await api.get('/auth/dashboard');
    console.log(response);
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('ecofinds_token');
    localStorage.removeItem('ecofinds_user');
  }
}

export const authService = new AuthService();
