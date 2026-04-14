import { MenuItem, Order, OrderItem, OrderStatusResponse } from '../types';

const API_BASE = '/api';

export const api = {
  async getMenu(): Promise<MenuItem[]> {
    const response = await fetch(`${API_BASE}/menu`);
    if (!response.ok) throw new Error('Failed to fetch menu');
    return response.json();
  },

  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async createOrder(items: OrderItem[]): Promise<Order> {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  async deleteOrder(orderId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
  },

  async toggleItemReady(orderId: number, itemIndex: number): Promise<void> {
    const response = await fetch(`${API_BASE}/orders/${orderId}/items/${itemIndex}/toggle`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to toggle item');
  },

  async toggleMenuItemAvailability(itemId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/menu/${itemId}/toggle`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to toggle menu item');
  },

  async getOrderStatus(): Promise<OrderStatusResponse> {
    const response = await fetch(`${API_BASE}/status`);
    if (!response.ok) throw new Error('Failed to fetch order status');
    return response.json();
  },

  async toggleAcceptingOrders(): Promise<void> {
    const response = await fetch(`${API_BASE}/status/toggle`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to toggle accepting orders');
  },
};
