import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface MenuData {
  items: MenuItem[];
}

const menuPath = path.join(__dirname, '../data/menu.json');

const readMenu = (): MenuData => {
  try {
    const data = fs.readFileSync(menuPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { items: [] };
  }
};

const writeMenu = (menu: MenuData) => {
  fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2));
};

export const getAllMenuItems = (req: Request, res: Response) => {
  try {
    const menuData = readMenu();
    res.json({
      success: true,
      data: menuData.items,
      message: 'Menu items retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getCategories = (req: Request, res: Response) => {
  try {
    const menuData = readMenu();
    const categories = [...new Set(menuData.items.map((item: MenuItem) => item.category))];
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getItemsByCategory = (req: Request, res: Response) => {
  try {
    const { categoryName } = req.params;
    const menuData = readMenu();
    const items = menuData.items.filter((item: MenuItem) =>
      item.category.toLowerCase() === categoryName.toLowerCase()
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No items found for category: ${categoryName}`
      });
    }

    res.json({
      success: true,
      data: items,
      message: `Menu items for category ${categoryName} retrieved successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createMenuItem = (req: Request, res: Response) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, category, image'
      });
    }

    const menuData = readMenu();
    const newMenuItem: MenuItem = {
      id: menuData.items.length > 0 ? Math.max(...menuData.items.map(item => item.id)) + 1 : 1,
      name,
      description,
      price,
      category,
      image
    };

    console.log('Menu Path:', menuPath);
    console.log('New Menu Item:', newMenuItem);

    menuData.items.push(newMenuItem);
    writeMenu(menuData);

    res.status(201).json({
      success: true,
      data: newMenuItem,
      message: 'Menu item created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateMenuItem = (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { name, description, price, category, image } = req.body;

    const menuData = readMenu();
    const itemIndex = menuData.items.findIndex(item => item.id === parseInt(itemId, 10));

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Menu item not found with id: ${itemId}`
      });
    }

    menuData.items[itemIndex] = {
      ...menuData.items[itemIndex],
      name: name || menuData.items[itemIndex].name,
      description: description || menuData.items[itemIndex].description,
      price: price || menuData.items[itemIndex].price,
      category: category || menuData.items[itemIndex].category,
      image: image || menuData.items[itemIndex].image
    };

    writeMenu(menuData);

    res.status(200).json({
      success: true,
      data: menuData.items[itemIndex],
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteMenuItem = (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const menuData = readMenu();
    const initialLength = menuData.items.length;
    menuData.items = menuData.items.filter(item => item.id !== parseInt(itemId, 10));

    if (menuData.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `Menu item not found with id: ${itemId}`
      });
    }

    writeMenu(menuData);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};