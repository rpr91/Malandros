import { fetchAllMenuItems, fetchMenuItemsByCategory, MenuItem } from './api';
import { QueryFunction } from '@tanstack/react-query';

export const menuQueryKeys = {
  all: ['menu'] as const,
  category: (category: string) => [...menuQueryKeys.all, category] as const,
};

export const fetchMenuItems: QueryFunction<MenuItem[]> = async ({ queryKey }) => {
  const [_key, category] = queryKey;
  
  if (category === 'all') {
    return fetchAllMenuItems();
  }
  
  return fetchMenuItemsByCategory(category as string);
};

export type { MenuItem };