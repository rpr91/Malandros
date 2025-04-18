import type { NextApiRequest, NextApiResponse } from 'next';

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  name: string;
}

interface CartApiRequest extends NextApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query: {
    itemId?: string;
  };
  body: {
    menuItemId?: string;
    quantity?: number;
  };
}

let mockCart: CartItem[] = [];

export default async function handler(req: CartApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // GET /cart
        res.status(200).json(mockCart);
        break;

      case 'POST':
        // POST /cart/items
        if (!req.body.menuItemId) {
          res.status(400).json({ error: 'menuItemId is required' });
          return;
        }
        
        // In a real implementation, we'd fetch menu item details
        const newItem: CartItem = {
          id: `item-${Date.now()}`,
          menuItemId: req.body.menuItemId,
          quantity: 1,
          price: 9.99, // Mock price
          name: 'Mock Item'
        };
        mockCart.push(newItem);
        res.status(201).json(newItem);
        break;

      case 'PUT':
        // PUT /cart/items/{itemId}
        if (!req.query.itemId || !req.body.quantity) {
          res.status(400).json({ error: 'itemId and quantity are required' });
          return;
        }
        
        const itemToUpdate = mockCart.find(item => item.id === req.query.itemId);
        if (!itemToUpdate) {
          res.status(404).json({ error: 'Item not found' });
          return;
        }
        
        itemToUpdate.quantity = req.body.quantity;
        res.status(200).json(itemToUpdate);
        break;

      case 'DELETE':
        if (req.query.itemId) {
          // DELETE /cart/items/{itemId}
          mockCart = mockCart.filter(item => item.id !== req.query.itemId);
          res.status(204).json(null);
        } else {
          // DELETE /cart
          mockCart = [];
          res.status(204).json(null);
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (err) {
    console.error('Cart API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}