import { OrderPage } from './pages/OrderPage';
import { KitchenPage } from './pages/KitchenPage';
import { DisplayPage } from './pages/DisplayPage';

function App() {
  const path = window.location.pathname;

  if (path === '/kitchen' || path === '/kitchen/') {
    return <KitchenPage />;
  }

  if (path === '/display' || path === '/display/') {
    return <DisplayPage />;
  }

  // Default to order page (including /order route)
  return <OrderPage />;
}

export default App;
