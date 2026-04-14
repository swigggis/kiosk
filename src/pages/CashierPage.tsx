import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCashRegister,
  faTrash,
  faCheck,
  faLock,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useWebSocket } from '../hooks/useWebSocket';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const PASSWORD = 'SchKosk142026#';

export const CashierPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { socket, connected } = useWebSocket();

  useEffect(() => {
    if (!socket || !authenticated) return;

    const loadOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data.filter((o: Order) => o.status === 'ready'));
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    };

    loadOrders();

    socket.on('orderUpdate', loadOrders);
    socket.on('newOrder', loadOrders);

    return () => {
      socket.off('orderUpdate', loadOrders);
      socket.off('newOrder', loadOrders);
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

  const handleComplete = async (orderId: number) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete order:', error);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kassen-Zugang</h1>
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

  const sortedOrders = [...orders].sort((a, b) => a.orderNumber - b.orderNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCashRegister} className="text-blue-600 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kasse</h1>
                <p className="text-sm text-gray-600">
                  {connected ? (
                    <Badge variant="success" size="sm">Verbunden</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Getrennt</Badge>
                  )}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="secondary" icon={faSignOutAlt}>
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {sortedOrders.length === 0 ? (
          <Card className="text-center" padding="lg">
            <div className="text-gray-400 mb-2">
              <FontAwesomeIcon icon={faCashRegister} className="text-6xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Keine abholbereiten Bestellungen
            </h2>
            <p className="text-gray-600">
              Bestellungen erscheinen hier, sobald sie fertig sind.
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Bestellnummer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Artikel
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Preis
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            #{order.orderNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-900">
                            <span className="font-medium">{item.quantity}x</span> {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {order.totalPrice.toFixed(2)}€
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleComplete(order.id)}
                        variant="danger"
                        size="md"
                        icon={faTrash}
                      >
                        Bezahlt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
