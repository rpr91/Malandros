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

const menuPath = path.join(__dirname, '../../../../src/data/menu.json'); // Adjusted path

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