import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface OrderItem {
  itemId: number;
  quantity: number;
  price: number;
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

const ordersPath = path.join(__dirname, '../../../../src/data/orders.json'); // Adjusted path

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

export const getOrderById = (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const ordersData = readOrders();
    const order = ordersData.orders.find(order => order.id === parseInt(orderId, 10));

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