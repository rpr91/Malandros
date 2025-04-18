import type { NextApiRequest, NextApiResponse } from 'next';

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  name: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

interface OrdersApiRequest extends NextApiRequest {
  method: 'GET' | 'POST';
  query: {
    orderId?: string;
  };
  body: {
    items?: OrderItem[];
  };
}

let mockOrders: Order[] = [];

export default async function handler(req: OrdersApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // GET /orders/history
        if (!req.query.orderId) {
          res.status(200).json(mockOrders);
          return;
        }

        // GET /orders/{orderId}
        const order = mockOrders.find(o => o.id === req.query.orderId);
        if (!order) {
          res.status(404).json({ error: 'Order not found' });
          return;
        }
        res.status(200).json(order);
        break;

      case 'POST':
        // POST /orders
        if (!req.body.items || !Array.isArray(req.body.items)) {
          res.status(400).json({ error: 'Items array is required' });
          return;
        }

        const newOrder: Order = {
          id: `order-${Date.now()}`,
          items: req.body.items,
          total: req.body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        mockOrders.push(newOrder);
        res.status(201).json(newOrder);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (err) {
    console.error('Orders API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}