import api from './api';

class ProductService {
  async getAllProducts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    console.log('Fetching products from endpoint:', endpoint);
    
    const response = await api.get(endpoint);
    console.log('Fetched products:', response.data);
    return response;
  }

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    // console.log('Fetched product by ID:', response.product);
    return response;
  }

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response;
  }

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response;
  }

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response;
  }

  async getUserProducts() {
    const response = await api.get('/products/user/listings');
    console.log(response);
    return response;
  }
}

export const productService = new ProductService();