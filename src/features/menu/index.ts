// Feature exports for menu functionality
import MenuPage from './MenuPage';
import { MenuItem } from './mockMenuData';

// Data and API exports
export * from './mockMenuData';
export * from './api';

// Explicitly export types to avoid conflicts
export { MenuItem };

// Component exports
export * from './components/MenuItemCard';
export * from './components/MenuList';
export * from './components/CategoryTabs';
export * from './components/SearchBar';

// Route configuration
export const menuRoute = {
  path: '/menu',
  component: MenuPage,
  name: 'Menu',
  exact: true
};