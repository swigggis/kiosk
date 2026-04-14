import { useEffect, useRef, useState } from 'react';
import { Order } from './types';

interface WebSocketMessage {
  type: string;
  orders?: Order[];
  order?: Order;
  orderId?: number;
  unavailableItems?: string[];
  orderingEnabled?: boolean;
}

export function useWebSocket(onMessage: (data: WebSocketMessage) => void) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname === 'localhost' 
      ? 'ws://localhost:3000'
      : `${protocol}//${window.location.host}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  return connected;
}
