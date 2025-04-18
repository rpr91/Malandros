import type { NextApiRequest, NextApiResponse } from 'next';
import { mockMenuItems } from '../../../features/menu/mockMenuData';

interface MenuApiRequest extends NextApiRequest {
  query: {
    category?: string;
  };
}

export default async function handler(req: MenuApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // Handle /api/v1/menu endpoint
    if (!req.query.category) {
      res.status(200).json(mockMenuItems);
      return;
    }

    // Handle /api/v1/menu/categories endpoint
    if (req.query.category === 'categories') {
      const categories = Array.from(new Set(mockMenuItems.map(item => item.category)));
      res.status(200).json(categories);
      return;
    }

    // Handle /api/v1/menu/categories/{categoryName} endpoint
    const category = req.query.category;
    const filteredItems = mockMenuItems.filter(item => item.category === category);
    
    if (filteredItems.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.status(200).json(filteredItems);
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}