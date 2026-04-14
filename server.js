import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// State
let orders = [];
let orderCounter = 1;
let acceptingOrders = true;

// Menu
const menu = [
  { id: 1, name: 'Chicken Nuggets 5 Stück', price: 3.00, category: 'Chicken Nuggets', available: true },
  { id: 2, name: 'Chicken Nuggets 9 Stück', price: 5.00, category: 'Chicken Nuggets', available: true },
  { id: 3, name: 'Chicken Nuggets 12 Stück', price: 6.00, category: 'Chicken Nuggets', available: true },
  { id: 4, name: 'Crepe Plain', price: 2.00, category: 'Crepes', available: true },
  { id: 5, name: 'Crepe Puderzucker', price: 2.00, category: 'Crepes', available: true },
  { id: 6, name: 'Crepe Nutella', price: 2.50, category: 'Crepes', available: true },
  { id: 7, name: 'Waffel Plain', price: 2.00, category: 'Waffeln', available: true },
  { id: 8, name: 'Waffel Puderzucker', price: 2.00, category: 'Waffeln', available: true },
  { id: 9, name: 'Waffel Nutella', price: 2.50, category: 'Waffeln', available: true },
];

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to broadcast updates
function broadcastOrderUpdate() {
  io.emit('orderUpdate', orders);
}

function broadcastNewOrder(order) {
  io.emit('newOrder', order);
}

function broadcastMenuUpdate() {
  io.emit('menuUpdate', menu);
}

function broadcastStatusUpdate() {
  io.emit('statusUpdate', { acceptingOrders });
}

// API Routes

// Get menu
app.get('/api/menu', (req, res) => {
  res.json(menu);
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Get order status
app.get('/api/status', (req, res) => {
  res.json({ acceptingOrders });
});

// Create new order
app.post('/api/orders', (req, res) => {
  if (!acceptingOrders) {
    return res.status(403).json({ error: 'Bestellungen sind derzeit nicht möglich' });
  }

  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Warenkorb ist leer' });
  }

  const orderNumber = orderCounter++;
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    id: Date.now(),
    orderNumber,
    items: items.map(item => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      ready: false
    })),
    totalPrice,
    status: 'preparing',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  broadcastNewOrder(order);

  res.json(order);
});

// Toggle item ready status
app.post('/api/orders/:orderId/items/:itemIndex/toggle', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const itemIndex = parseInt(req.params.itemIndex);

  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }

  if (itemIndex < 0 || itemIndex >= order.items.length) {
    return res.status(400).json({ error: 'Ungültiger Item-Index' });
  }

  order.items[itemIndex].ready = !order.items[itemIndex].ready;

  // Check if all items are ready
  const allReady = order.items.every(item => item.ready);
  if (allReady) {
    order.status = 'ready';
  } else {
    order.status = 'preparing';
  }

  broadcastOrderUpdate();
  res.json(order);
});

// Delete order
app.delete('/api/orders/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const index = orders.findIndex(o => o.id === orderId);

  if (index === -1) {
    return res.status(404).json({ error: 'Bestellung nicht gefunden' });
  }

  orders.splice(index, 1);
  broadcastOrderUpdate();
  res.json({ success: true });
});

// Toggle menu item availability
app.post('/api/menu/:itemId/toggle', (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const item = menu.find(m => m.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'Menü-Item nicht gefunden' });
  }

  item.available = !item.available;
  broadcastMenuUpdate();
  res.json(item);
});

// Toggle accepting orders
app.post('/api/status/toggle', (req, res) => {
  acceptingOrders = !acceptingOrders;
  broadcastStatusUpdate();
  res.json({ acceptingOrders });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
