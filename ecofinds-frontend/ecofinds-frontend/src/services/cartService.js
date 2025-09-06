import api from './api';

class CartService {
  async getCart() {
    const response = await api.get('/cart');
    return response;
  }

  async addToCart(productId, quantity = 1) {
    const response = await api.post('/cart/', {
      product_id: productId,
      quantity
    });
    console.log('Add to cart response:', response.data);
    return response;
  }

  async updateCartItem(productId, quantity) {
    const response = await api.put(`/cart/${productId}`, {
      quantity
    });
    return response;
  }

  async removeFromCart(productId) {
    const response = await api.delete(`/cart/${productId}`);
    return response;
  }

  async clearCart() {
    const response = await api.delete('/cart');
    return response;
  }
}

export const cartService = new CartService();