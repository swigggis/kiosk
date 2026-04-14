import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OrderPage } from './pages/OrderPage';
import { KitchenPage } from './pages/KitchenPage';
import { DisplayPage } from './pages/DisplayPage';
import { CashierPage } from './pages/CashierPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/order" element={<OrderPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/cashier" element={<CashierPage />} />
        <Route path="/" element={<Navigate to="/order" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
