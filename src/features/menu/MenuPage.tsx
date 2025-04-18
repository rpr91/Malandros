import React, { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './MenuPage.module.css';
import { fetchMenuItems, MenuItem, menuQueryKeys } from './menuService';
import { ImagePlaceholder } from '../../components';

// Lazy load components
const MenuList = lazy(() => import('./components/MenuList'));
const CategoryTabs = lazy(() => import('./components/CategoryTabs'));
const SearchBar = lazy(() => import('./components/SearchBar'));

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data: menuItems = [],
    isLoading,
    isError,
  } = useQuery<MenuItem[]>({
    queryKey: menuQueryKeys.all,
    queryFn: fetchMenuItems,
  });

  const filteredItems = React.useMemo(() => {
    let results = menuItems;

    if (activeCategory !== 'all') {
      results = results.filter((item) => item.category === activeCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    return results;
  }, [menuItems, activeCategory, searchTerm]);

  const categories = ['all', ...new Set(menuItems.map((item) => item.category))];

  if (isLoading || isError) {
    return (
      <div className={styles.loading}>
        {isLoading ? 'Loading menu...' : 'Failed to load menu. Please try again.'}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Our Menu</h1>
      <Suspense fallback={<ImagePlaceholder height="50px" />}>
        <SearchBar
          placeholder="Search menu items..."
          onSearch={setSearchTerm}
        />
      </Suspense>
      <Suspense fallback={<ImagePlaceholder height="50px" />}>
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </Suspense>
      <Suspense fallback={<div className={styles.loadingGrid}>
        {Array(6).fill(0).map((_, i) => (
          <ImagePlaceholder key={i} height="200px" />
        ))}
      </div>}>
        <MenuList menuItems={filteredItems} />
      </Suspense>
    </div>
  );
};

export default MenuPage;