import React, { useState } from 'react';
import styles from './MenuItemCard.module.css';
import { useCartStore } from '../../cart/store';
import { Button } from '../../../components/Button/Button';
import { MenuItem } from '../mockMenuData';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
import { ImagePlaceholder } from '../../../components';

interface MenuItemCardProps extends Omit<MenuItem, 'category'> {
  onAddToCart?: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  optimizedImage,
  isSpicy,
  isVegetarian,
  onAddToCart
}) => {
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1
  });

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({ itemId: id, name, price });
    setTimeout(() => setIsAdding(false), 1000);
    onAddToCart?.();
  };

  return (
    <div className={styles.card} ref={ref}>
      {isVisible ? (
        optimizedImage ? (
          <picture>
            <source srcSet={optimizedImage.srcSet} type="image/webp" />
            <img
              src={optimizedImage.src}
              alt={name}
              className={styles.image}
              sizes={optimizedImage.sizes}
            />
          </picture>
        ) : (
          <img src={image} alt={name} className={styles.image} />
        )
      ) : (
        <ImagePlaceholder className={styles.image} />
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{name}</h3>
          {isSpicy && <span className={styles.spicyTag}>Spicy</span>}
          {isVegetarian && <span className={styles.vegTag}>Vegetarian</span>}
        </div>
        <p className={styles.description}>{description}</p>
        <p className={styles.price}>${price.toFixed(2)}</p>
        <Button
          variant="primary"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? 'Added!' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default MenuItemCard;