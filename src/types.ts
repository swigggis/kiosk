export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

export interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  ready?: boolean;
}

export interface Order {
  id: number;
  orderNumber: number;
  items: OrderItem[];
  totalPrice: number;
  status: 'preparing' | 'ready';
  createdAt: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderStatusResponse {
  acceptingOrders: boolean;
}
