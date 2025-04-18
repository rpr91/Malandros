import React from 'react';
import styles from './CategoryTabs.module.css';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className={styles.tabs}>
      {categories.map((category) => (
        <button
          key={category}
          className={`${styles.tab} ${
            category === activeCategory ? styles.active : ''
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;