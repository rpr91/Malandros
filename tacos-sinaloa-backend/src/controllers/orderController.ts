import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface OrderItem {
  itemId: number;
  quantity: number;
  price: number; // Store price at time of order
}

interface Order {
  id: number;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

interface OrdersData {
  orders: Order[];
}

const ordersPath = path.join(__dirname, '../data/orders.json');

const readOrders = (): OrdersData => {
  try {
    const data = fs.readFileSync(ordersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { orders: [] };
  }
};

const writeOrders = (orders: OrdersData) => {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
};

export const createOrder = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    const { items } = req.body; // Expecting an array of { itemId, quantity }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body: items array is required and cannot be empty'
      });
    }

    // In a real application, you would fetch item details (especially price) from the menu data
    // here based on itemId to calculate the total and store the price at the time of order.
    // For MVP, we'll simulate this by assuming the client sends price or looking up from mock menu.
    // Let's assume for MVP the client sends price for simplicity or we can look up from menu.json

    // For MVP, let's read the menu data to get item prices
    const menuPath = path.join(__dirname, '../data/menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8')).items;

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const menuItem = menuData.find((menuItem: any) => menuItem.id === item.itemId);
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item not found with id: ${item.itemId}`
        });
      }
      orderItems.push({
        itemId: item.itemId,
        quantity: item.quantity,
        price: menuItem.price // Use price from menu data
      });
      total += menuItem.price * item.quantity;
    }


    const ordersData = readOrders();
    const newOrder: Order = {
      id: ordersData.orders.length > 0 ? Math.max(...ordersData.orders.map(order => order.id)) + 1 : 1,
      userId,
      items: orderItems,
      total,
      status: 'pending', // Initial status
      createdAt: new Date().toISOString(),
    };

    ordersData.orders.push(newOrder);
    writeOrders(ordersData);

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOrderHistory = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    const ordersData = readOrders();
    const userOrders = ordersData.orders.filter(order => order.userId === userId);

    res.json({
      success: true,
      data: userOrders,
      message: 'Order history retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOrderById = (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest'; // Simulate user ID
    const { orderId } = req.params;
    const ordersData = readOrders();
    const order = ordersData.orders.find(order => order.id === parseInt(orderId, 10) && order.userId === userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${orderId}`
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Admin functions (will be used by adminOrderController)
export const getAllOrders = (req: Request, res: Response) => {
  try {
    const ordersData = readOrders();
    res.json({
      success: true,
      data: ordersData.orders,
      message: 'All orders retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve all orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateOrderStatus = (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body: status is required and must be one of pending, completed, or cancelled'
      });
    }

    const ordersData = readOrders();
    const orderIndex = ordersData.orders.findIndex(order => order.id === parseInt(orderId, 10));

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${orderId}`
      });
    }

    ordersData.orders[orderIndex].status = status;
    writeOrders(ordersData);

    res.status(200).json({
      success: true,
      data: ordersData.orders[orderIndex],
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};