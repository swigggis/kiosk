import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// State
let orders = [];
let orderCounter = 1;
let unavailableItems = [];
let orderingEnabled = true;

// Menu
const menu = [
  { id: 'nuggets-5', name: 'Chicken Nuggets 5 Stück', price: 3.00, category: 'nuggets' },
  { id: 'nuggets-9', name: 'Chicken Nuggets 9 Stück', price: 5.00, category: 'nuggets' },
  { id: 'nuggets-12', name: 'Chicken Nuggets 12 Stück', price: 6.00, category: 'nuggets' },
  { id: 'crepe-plain', name: 'Crepe Plain', price: 2.00, category: 'crepes' },
  { id: 'crepe-sugar', name: 'Crepe Puderzucker', price: 2.00, category: 'crepes' },
  { id: 'crepe-nutella', name: 'Crepe Nutella', price: 2.50, category: 'crepes' },
  { id: 'waffle-plain', name: 'Waffel Plain', price: 2.00, category: 'waffles' },
  { id: 'waffle-sugar', name: 'Waffel Puderzucker', price: 2.00, category: 'waffles' },
  { id: 'waffle-nutella', name: 'Waffel Nutella', price: 2.50, category: 'waffles' },
];

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    orders,
    unavailableItems,
    orderingEnabled
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// API Routes
app.get('/api/menu', (req, res) => {
  res.json({ menu, unavailableItems, orderingEnabled });
});

app.post('/api/orders', (req, res) => {
  if (!orderingEnabled) {
    return res.status(403).json({ error: 'Bestellungen sind derzeit nicht möglich' });
  }

  const { items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Warenkorb ist leer' });
  }

  const orderNumber = orderCounter++;
  const order = {
    id: Date.now(),
    number: orderNumber,
    items: items.map(item => ({
      ...item,
      ready: false
    })),
    status: 'preparing', // preparing, ready
    timestamp: new Date().toISOString()
  };

  orders.push(order);

  broadcast({
    type: 'new_order',
    order
  });

  res.json({ orderNumber, orderId: order.id });
});

app.post('/api/orders/:orderId/items/:itemIndex/ready', (req, res) => {
  const { orderId, itemIndex } = req.params;
  const order = orders.find(o => o.id === parseInt(orderId));
  
  if (!order) {
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }

  const index = parseInt(itemIndex);
  if (index >= 0 && index < order.items.length) {
    order.items[index].ready = true;
    
    // Check if all items are ready
    const allReady = order.items.every(item => item.ready);
    if (allReady) {
      order.status = 'ready';
    }

    broadcast({
      type: 'order_updated',
      order
    });

    res.json({ success: true, order });
  } else {
    res.status(400).json({ error: 'Ungültiger Item-Index' });
  }
});

app.delete('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const index = orders.findIndex(o => o.id === parseInt(orderId));
  
  if (index !== -1) {
    orders.splice(index, 1);
    
    broadcast({
      type: 'order_deleted',
      orderId: parseInt(orderId)
    });

    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }
});

app.post('/api/items/:itemId/unavailable', (req, res) => {
  const { itemId } = req.params;
  const { unavailable } = req.body;

  if (unavailable && !unavailableItems.includes(itemId)) {
    unavailableItems.push(itemId);
  } else if (!unavailable) {
    unavailableItems = unavailableItems.filter(id => id !== itemId);
  }

  broadcast({
    type: 'unavailable_items_updated',
    unavailableItems
  });

  res.json({ success: true, unavailableItems });
});

app.post('/api/ordering-status', (req, res) => {
  const { enabled } = req.body;
  orderingEnabled = enabled;

  broadcast({
    type: 'ordering_status_updated',
    orderingEnabled
  });

  res.json({ success: true, orderingEnabled });
});

// Serve React app for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
