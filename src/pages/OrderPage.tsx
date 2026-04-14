import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDrumstickBite, 
  faIceCream, 
  faShoppingCart,
  faPlus,
  faMinus,
  faTrash,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../services/api';
import { MenuItem, OrderItem } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const OrderPage: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMenu();
    checkOrderStatus();
  }, []);

  const loadMenu = async () => {
    const items = await api.getMenu();
    setMenu(items);
  };

  const checkOrderStatus = async () => {
    const status = await api.getOrderStatus();
    setAcceptingOrders(status.acceptingOrders);
  };

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.menuItemId === item.id);
    if (existing) {
      setCart(cart.map(i => 
        i.menuItemId === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (menuItemId: number, delta: number) => {
    setCart(cart.map(item => 
      item.menuItemId === menuItemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };



  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const order = await api.createOrder(cart);
      setOrderNumber(order.orderNumber);
      setOrderPlaced(true);
      setCart([]);
    } catch (error) {
      alert('Bestellung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const startNewOrder = () => {
    setOrderPlaced(false);
    setOrderNumber(null);
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('nugget')) return faDrumstickBite;
    return faIceCream;
  };

  if (!acceptingOrders) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center" padding="lg">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 text-6xl mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bestellungen pausiert
          </h1>
          <p className="text-gray-600">
            Wir nehmen momentan keine Bestellungen mehr an.
          </p>
        </Card>
      </div>
    );
  }

  if (orderPlaced && orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center" padding="lg">
          <div className="mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCheck} className="text-emerald-600 text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bestellung aufgegeben!
            </h1>
            <p className="text-gray-600 mb-6">
              Deine Bestellnummer lautet:
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="text-6xl font-bold text-blue-600">
                #{orderNumber}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Bitte merke dir diese Nummer. Du wirst aufgerufen, wenn deine Bestellung abholbereit ist.
            </p>
          </div>
          <Button onClick={startNewOrder} variant="primary" size="lg" fullWidth>
            Neue Bestellung
          </Button>
        </Card>
      </div>
    );
  }

  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">BBS2 Celle Schulkiosk</h1>
          <p className="text-sm text-gray-600">Stelle deine Bestellung zusammen</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Menu Items */}
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={getCategoryIcon(category)} className="text-gray-700 text-xl" />
              <h2 className="text-xl font-bold text-gray-900">{category}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {items.map(item => (
                <Card key={item.id} hover className="flex items-center justify-between" padding="md">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-blue-600">
                        {item.price.toFixed(2)}€
                      </span>
                      {!item.available && (
                        <Badge variant="danger" size="sm">Ausverkauft</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                    variant="primary"
                    size="md"
                    icon={faPlus}
                  >
                    Hinzufügen
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Shopping Cart Fixed Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Warenkorb
                </h3>
                <button 
                  onClick={() => setCart([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" />
                  Leeren
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {item.price.toFixed(2)}€
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, -1)}
                          className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-xs" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, 1)}
                          className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div>
                <div className="text-sm text-gray-600">Gesamtsumme</div>
                <div className="text-2xl font-bold text-gray-900">
                  {getTotalPrice().toFixed(2)}€
                </div>
              </div>
              <Button
                onClick={placeOrder}
                disabled={loading}
                variant="success"
                size="lg"
                icon={faCheck}
              >
                {loading ? 'Wird bestellt...' : 'Bestellen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
