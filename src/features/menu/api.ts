import { mockMenuItems } from './mockMenuData';

const simulateDelay = () => new Promise(resolve => {
  setTimeout(resolve, 100 + Math.random() * 200);
});

export const fetchAllMenuItems = async () => {
  await simulateDelay();
  return mockMenuItems;
};

export const fetchMenuItemsByCategory = async (category: string) => {
  await simulateDelay();
  return mockMenuItems.filter(item => item.category === category);
};

export type MenuItem = typeof mockMenuItems[0];