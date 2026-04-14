const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

export const api = {
  async getMenu() {
    const response = await fetch(`${API_URL}/api/menu`);
    return response.json();
  },

  async createOrder(items: any[]) {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });
    return response.json();
  },

  async markItemReady(orderId: number, itemIndex: number) {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/items/${itemIndex}/ready`, {
      method: 'POST',
    });
    return response.json();
  },

  async deleteOrder(orderId: number) {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async setItemUnavailable(itemId: string, unavailable: boolean) {
    const response = await fetch(`${API_URL}/api/items/${itemId}/unavailable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ unavailable }),
    });
    return response.json();
  },

  async setOrderingStatus(enabled: boolean) {
    const response = await fetch(`${API_URL}/api/ordering-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled }),
    });
    return response.json();
  },

  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return window.location.hostname === 'localhost' 
      ? 'ws://localhost:3000'
      : `${protocol}//${window.location.host}`;
  }
};
