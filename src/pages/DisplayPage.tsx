import { useState } from 'react';
import { Order } from '../types';
import { useWebSocket } from '../useWebSocket';

const PASSWORD = 'SchKosk142026#';

export function DisplayPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderingEnabled, setOrderingEnabled] = useState(true);

  useWebSocket((data) => {
    if (data.type === 'init') {
      setOrders(data.orders || []);
      setOrderingEnabled(data.orderingEnabled ?? true);
    } else if (data.type === 'new_order' && data.order) {
      setOrders(prev => [...prev, data.order!]);
    } else if (data.type === 'order_updated' && data.order) {
      setOrders(prev => prev.map(o => o.id === data.order!.id ? data.order! : o));
    } else if (data.type === 'order_deleted' && data.orderId) {
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
    } else if (data.type === 'ordering_status_updated') {
      setOrderingEnabled(data.orderingEnabled ?? true);
    }
  });

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Falsches Passwort!');
      setPassword('');
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">🔒 Anzeige-Bereich</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg focus:border-purple-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  if (!orderingEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-9xl mb-8">⛔</div>
          <h1 className="text-6xl font-bold text-white mb-6">Bestellungen geschlossen</h1>
          <p className="text-3xl text-white">
            Wir nehmen derzeit keine Bestellungen mehr an
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-bold text-white text-center mb-12">
          🍴 Schulkiosk BBS2 Celle
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wird vorbereitet */}
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-5xl">⏳</span>
              <h2 className="text-4xl font-bold text-gray-800">Wird vorbereitet</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {preparingOrders.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 text-2xl py-12">
                  Keine Bestellungen
                </div>
              ) : (
                preparingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg flex items-center justify-center aspect-square transform hover:scale-105 transition-transform"
                  >
                    <span className="text-5xl font-bold text-white">
                      {order.number}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Abholbereit */}
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-5xl">✅</span>
              <h2 className="text-4xl font-bold text-gray-800">Abholbereit</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {readyOrders.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 text-2xl py-12">
                  Keine Bestellungen
                </div>
              ) : (
                readyOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg flex items-center justify-center aspect-square animate-pulse transform hover:scale-105 transition-transform"
                  >
                    <span className="text-5xl font-bold text-white">
                      {order.number}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white text-2xl font-semibold">
            Bitte achten Sie auf Ihre Nummer! · Bezahlung bei Abholung
          </p>
        </div>
      </div>
    </div>
  );
}
