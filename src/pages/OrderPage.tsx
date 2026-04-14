import { useEffect, useState } from 'react';
import { MenuItem, CartItem } from '../types';
import { api } from '../api';

export function OrderPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [unavailableItems, setUnavailableItems] = useState<string[]>([]);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const data = await api.getMenu();
      setMenu(data.menu);
      setUnavailableItems(data.unavailableItems);
      setOrderingEnabled(data.orderingEnabled);
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  }

  function addToCart(item: MenuItem) {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  }

  function removeFromCart(itemId: string) {
    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
    } else {
      setCart(cart.filter(i => i.id !== itemId));
    }
  }

  function getTotalPrice() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async function placeOrder() {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const items = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        quantity: item.quantity
      }));

      const result = await api.createOrder(items);
      setOrderNumber(result.orderNumber);
      setCart([]);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Fehler beim Aufgeben der Bestellung');
    } finally {
      setLoading(false);
    }
  }

  function resetOrder() {
    setOrderNumber(null);
  }

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categoryNames: Record<string, string> = {
    nuggets: '🍗 Chicken Nuggets',
    crepes: '🥞 Crêpes',
    waffles: '🧇 Waffeln'
  };

  if (!orderingEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Bestellungen geschlossen</h1>
          <p className="text-gray-600 text-lg">
            Wir nehmen derzeit keine Bestellungen mehr an.
          </p>
        </div>
      </div>
    );
  }

  if (orderNumber !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Bestellung aufgegeben!</h1>
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-8 mb-6">
            <p className="text-white text-lg mb-2">Deine Nummer:</p>
            <p className="text-white text-7xl font-bold">{orderNumber}</p>
          </div>
          <p className="text-gray-600 mb-6">
            Bitte merke dir diese Nummer. Du wirst aufgerufen, wenn deine Bestellung fertig ist.
          </p>
          <p className="text-gray-600 mb-6 font-semibold">
            Bezahlung erfolgt bei Abholung!
          </p>
          <button
            onClick={resetOrder}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
          >
            Neue Bestellung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">🍴 Schulkiosk</h1>
          <p className="text-white text-lg">BBS2 Celle</p>
        </div>

        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-3 px-2">
              {categoryNames[category] || category}
            </h2>
            <div className="space-y-3">
              {items.map(item => {
                const isUnavailable = unavailableItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-4 shadow-md ${
                      isUnavailable ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {item.name}
                          {isUnavailable && (
                            <span className="ml-2 text-red-600 text-sm">(Ausverkauft)</span>
                          )}
                        </h3>
                        <p className="text-orange-600 font-bold text-xl">
                          {item.price.toFixed(2)} €
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={isUnavailable}
                        className={`px-6 py-3 rounded-lg font-semibold text-lg ${
                          isUnavailable
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transition-all'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-4 border-orange-500">
          <div className="max-w-2xl mx-auto p-4">
            <div className="mb-3">
              <h3 className="font-bold text-gray-800 mb-2 text-lg">Warenkorb</h3>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-800">
                      {item.quantity}x {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                      >
                        −
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xl font-bold text-gray-800">Gesamt:</span>
              <span className="text-2xl font-bold text-orange-600">
                {getTotalPrice().toFixed(2)} €
              </span>
            </div>
            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Wird bestellt...' : 'Bestellung aufgeben'}
            </button>
            <p className="text-sm text-gray-600 text-center mt-2">
              Bezahlung bei Abholung
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
