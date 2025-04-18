import React from 'react';
import MenuItemCard from './MenuItemCard';
import styles from './MenuList.module.css';

interface MenuListProps {
  menuItems: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isSpicy?: boolean;
    isVegetarian?: boolean;
  }>;
}

const MenuList: React.FC<MenuListProps> = ({ menuItems }) => {
  return (
    <div className={styles.grid}>
      {menuItems.map((item) => (
        <MenuItemCard
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description}
          price={item.price}
          image={item.image}
          isSpicy={item.isSpicy}
          isVegetarian={item.isVegetarian}
        />
      ))}
    </div>
  );
};

export default MenuList;