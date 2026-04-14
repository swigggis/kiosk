export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  ready?: boolean;
}

export interface Order {
  id: number;
  number: number;
  items: OrderItem[];
  status: 'preparing' | 'ready';
  timestamp: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
