import api from './api';

class OrderService {
  async getOrders() {
    const response = await api.get('/orders');
    return response;
  }

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response;
  }

  async checkout() {
    const response = await api.post('/orders/checkout');
    console.log('Checkout response:', response);
    return response;
  }

  async cancelOrder(id) {
    const response = await api.put(`/orders/${id}/cancel`);
    return response;
  }
}

export const orderService = new OrderService();
