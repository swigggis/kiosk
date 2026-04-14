import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useWebSocket } from '../hooks/useWebSocket';
import { Order } from '../types';
import { Badge } from '../components/ui/Badge';

export const DisplayPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const { socket, connected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const loadOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    };

    const loadStatus = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        setAcceptingOrders(data.acceptingOrders);
      } catch (error) {
        console.error('Failed to load status:', error);
      }
    };

    loadOrders();
    loadStatus();

    socket.on('orderUpdate', loadOrders);
    socket.on('newOrder', loadOrders);
    socket.on('statusUpdate', (data: { acceptingOrders: boolean }) => {
      setAcceptingOrders(data.acceptingOrders);
    });

    return () => {
      socket.off('orderUpdate', loadOrders);
      socket.off('newOrder', loadOrders);
      socket.off('statusUpdate');
    };
  }, [socket]);

  const preparingOrders = orders
    .filter(o => o.status === 'preparing')
    .sort((a, b) => a.orderNumber - b.orderNumber);

  const readyOrders = orders
    .filter(o => o.status === 'ready')
    .sort((a, b) => a.orderNumber - b.orderNumber);

  if (!acceptingOrders) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <FontAwesomeIcon 
            icon={faExclamationTriangle} 
            className="text-amber-500 text-8xl mb-6" 
          />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bestellungen pausiert
          </h1>
          <p className="text-2xl text-gray-600">
            Wir nehmen momentan keine Bestellungen mehr an.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              BBS2 Celle Schulkiosk
            </h1>
            <div className="text-right">
              {connected ? (
                <Badge variant="success" size="lg">Verbunden</Badge>
              ) : (
                <Badge variant="danger" size="lg">Getrennt</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Preparing Column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faClock} className="text-amber-600 text-2xl" />
              <h2 className="text-2xl font-bold text-gray-900">
                Wird vorbereitet
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {preparingOrders.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-lg">Keine Bestellungen</p>
                </div>
              ) : (
                preparingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl p-6 shadow-md border-2 border-amber-200"
                  >
                    <div className="text-center">
                      <div className="text-6xl font-bold text-amber-600 mb-2">
                        #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {order.items.filter(i => i.ready).length} / {order.items.length} fertig
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon icon={faCheck} className="text-emerald-600 text-2xl" />
              <h2 className="text-2xl font-bold text-gray-900">
                Abholbereit
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {readyOrders.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-lg">Keine Bestellungen</p>
                </div>
              ) : (
                readyOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl p-6 shadow-md border-2 border-emerald-200 animate-pulse"
                  >
                    <div className="text-center">
                      <div className="text-6xl font-bold text-emerald-600 mb-2">
                        #{order.orderNumber}
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-600 text-sm" />
                        <span className="text-sm text-emerald-800 font-medium">Bereit</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
