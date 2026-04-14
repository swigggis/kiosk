import { useEffect, useState } from 'react';
import { Order, MenuItem } from '../types';
import { api } from '../api';
import { useWebSocket } from '../useWebSocket';

const PASSWORD = 'SchKosk142026#';

export function KitchenPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const [orderingEnabled, setOrderingEnabled] = useState(true);

  useWebSocket((data) => {
    if (data.type === 'init') {
      setOrders(data.orders || []);
      setUnavailableItems(data.unavailableItems || []);
      setOrderingEnabled(data.orderingEnabled ?? true);
    } else if (data.type === 'new_order' && data.order) {
      setOrders(prev => [...prev, data.order!]);
    } else if (data.type === 'order_updated' && data.order) {
      setOrders(prev => prev.map(o => o.id === data.order!.id ? data.order! : o));
    } else if (data.type === 'order_deleted' && data.orderId) {
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
    } else if (data.type === 'unavailable_items_updated') {
      setUnavailableItems(data.unavailableItems || []);
    } else if (data.type === 'ordering_status_updated') {
      setOrderingEnabled(data.orderingEnabled ?? true);
    }
  });

  useEffect(() => {
    if (authenticated) {
      loadMenu();
    }
  }, [authenticated]);

  async function loadMenu() {
    try {
      const data = await api.getMenu();
      setMenu(data.menu);
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  }

  async function markItemReady(orderId: number, itemIndex: number) {
    try {
      await api.markItemReady(orderId, itemIndex);
    } catch (error) {
      console.error('Failed to mark item ready:', error);
    }
  }

  async function deleteOrder(orderId: number) {
    if (!confirm('Bestellung wirklich löschen?')) return;
    try {
      await api.deleteOrder(orderId);
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  }

  async function toggleItemAvailability(itemId: string) {
    const isUnavailable = unavailableItems.includes(itemId);
    try {
      await api.setItemUnavailable(itemId, !isUnavailable);
    } catch (error) {
      console.error('Failed to toggle item availability:', error);
    }
  }

  async function toggleOrderingStatus() {
    try {
      await api.setOrderingStatus(!orderingEnabled);
    } catch (error) {
      console.error('Failed to toggle ordering status:', error);
    }
  }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">🔒 Koch-Bereich</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">👨‍🍳 Küche</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-600">
                {preparingOrders.length} Bestellung{preparingOrders.length !== 1 ? 'en' : ''} in Vorbereitung
              </span>
              <button
                onClick={toggleOrderingStatus}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  orderingEnabled
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {orderingEnabled ? '🛑 Bestell-Stopp' : '✅ Bestellungen aktivieren'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Bestellungen</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {preparingOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Keine aktiven Bestellungen</p>
              ) : (
                preparingOrders.map(order => (
                  <div key={order.id} className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-500 text-white text-2xl font-bold px-4 py-2 rounded-lg">
                          #{order.number}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {new Date(order.timestamp).toLocaleTimeString('de-DE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600"
                      >
                        🗑️ Löschen
                      </button>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-2 rounded ${
                            item.ready ? 'bg-green-100' : 'bg-white'
                          }`}
                        >
                          <span className="text-gray-800">
                            {item.quantity}x {item.name}
                          </span>
                          <button
                            onClick={() => markItemReady(order.id, index)}
                            disabled={item.ready}
                            className={`px-4 py-1 rounded-lg font-semibold ${
                              item.ready
                                ? 'bg-green-500 text-white cursor-default'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {item.ready ? '✅ Fertig' : 'Als fertig markieren'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Verfügbarkeit</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {menu.map(item => {
                const isUnavailable = unavailableItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      isUnavailable ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-800 font-medium">{item.name}</span>
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        isUnavailable
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {isUnavailable ? '✅ Verfügbar machen' : '⛔ Ausverkauft'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
