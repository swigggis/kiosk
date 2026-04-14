import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils,
  faCheck,
  faTrash,
  faBan,
  faPlay,
  faLock,
  faSignOutAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { useWebSocket } from '../hooks/useWebSocket';
import { Order, MenuItem } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const PASSWORD = 'SchKosk142026#';

export const KitchenPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const { socket, connected } = useWebSocket();

  useEffect(() => {
    if (!socket || !authenticated) return;

    const loadOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data.filter((o: Order) => o.status === 'preparing'));
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    };

    const loadMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenu(data);
      } catch (error) {
        console.error('Failed to load menu:', error);
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
    loadMenu();
    loadStatus();

    socket.on('orderUpdate', loadOrders);
    socket.on('newOrder', loadOrders);
    socket.on('menuUpdate', loadMenu);
    socket.on('statusUpdate', (data) => setAcceptingOrders(data.acceptingOrders));

    return () => {
      socket.off('orderUpdate', loadOrders);
      socket.off('newOrder', loadOrders);
      socket.off('menuUpdate', loadMenu);
      socket.off('statusUpdate');
    };
  }, [socket, authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
      setPassword('');
    } else {
      alert('Falsches Passwort!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  const toggleItemReady = async (orderId: number, itemIndex: number) => {
    try {
      await fetch(`/api/orders/${orderId}/items/${itemIndex}/toggle`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Bestellung wirklich löschen?')) return;
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const toggleItemAvailability = async (itemId: number) => {
    try {
      await fetch(`/api/menu/${itemId}/toggle`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  const toggleAcceptingOrders = async () => {
    try {
      await fetch('/api/status/toggle', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to toggle accepting orders:', error);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full" padding="lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faLock} className="text-blue-600 text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Küchen-Zugang</h1>
            <p className="text-gray-600">Bitte Passwort eingeben</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <Button type="submit" variant="primary" size="lg" fullWidth icon={faCheck}>
              Anmelden
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Küche</h1>
                <p className="text-sm text-gray-600">
                  {connected ? (
                    <Badge variant="success" size="sm">Verbunden</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Getrennt</Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleAcceptingOrders}
                variant={acceptingOrders ? 'danger' : 'success'}
                icon={acceptingOrders ? faBan : faPlay}
              >
                {acceptingOrders ? 'Bestellungen stoppen' : 'Bestellungen aktivieren'}
              </Button>
              <Button onClick={handleLogout} variant="secondary" icon={faSignOutAlt}>
                Abmelden
              </Button>
            </div>
          </div>

          {/* Menu Availability */}
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Verfügbarkeit</h2>
            <div className="flex flex-wrap gap-2">
              {menu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItemAvailability(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    item.available
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {item.name} {!item.available && '(Ausverkauft)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {sortedOrders.length === 0 ? (
          <Card className="text-center" padding="lg">
            <div className="text-gray-400 mb-2">
              <FontAwesomeIcon icon={faUtensils} className="text-6xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Keine offenen Bestellungen
            </h2>
            <p className="text-gray-600">
              Neue Bestellungen erscheinen hier automatisch.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedOrders.map((order) => {
              const allReady = order.items.every(item => item.ready);
              const timeAgo = new Date(order.createdAt).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <Card key={order.id} className="relative" padding="md">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Bestellung #{order.orderNumber}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FontAwesomeIcon icon={faClock} className="text-xs" />
                          {timeAgo}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteOrder(order.id)}
                      variant="danger"
                      size="sm"
                      icon={faTrash}
                    >
                    </Button>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleItemReady(order.id, idx)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                          item.ready
                            ? 'bg-emerald-50 border-2 border-emerald-500'
                            : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              item.ready ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}>
                              {item.ready && (
                                <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {item.quantity}x {item.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Status Badge */}
                  {allReady && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Badge variant="success" size="lg" className="w-full justify-center py-2">
                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                        Abholbereit
                      </Badge>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
