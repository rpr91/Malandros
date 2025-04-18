import { getImagePath } from '../../utils/imageUtils';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  optimizedImage?: {
    src: string;
    srcSet: string;
    sizes: string;
  };
  category: 'tacos' | 'burritos' | 'quesadillas' | 'drinks' | 'sides';
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

export const mockMenuItems: MenuItem[] = [
  {
    id: 'taco-carne-asada',
    name: 'Carne Asada Taco',
    description: 'Grilled steak with onions, cilantro and salsa',
    price: 3.99,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('taco-carne-asada'),
      srcSet: `${getImagePath('taco-carne-asada', 'webp')} 1x, ${getImagePath('taco-carne-asada', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'tacos',
    isSpicy: true
  },
  {
    id: 'taco-al-pastor',
    name: 'Al Pastor Taco',
    description: 'Marinated pork with pineapple, onions and cilantro',
    price: 3.49,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('taco-al-pastor'),
      srcSet: `${getImagePath('taco-al-pastor', 'webp')} 1x, ${getImagePath('taco-al-pastor', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'tacos',
    isSpicy: true
  },
  {
    id: 'taco-pescado',
    name: 'Fish Taco',
    description: 'Grilled fish with cabbage slaw and chipotle mayo',
    price: 4.49,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('taco-pescado'),
      srcSet: `${getImagePath('taco-pescado', 'webp')} 1x, ${getImagePath('taco-pescado', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'tacos'
  },
  {
    id: 'taco-vegetariano',
    name: 'Vegetarian Taco',
    description: 'Grilled vegetables with beans and cheese',
    price: 3.49,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('taco-vegetariano'),
      srcSet: `${getImagePath('taco-vegetariano', 'webp')} 1x, ${getImagePath('taco-vegetariano', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'tacos',
    isVegetarian: true
  },
  {
    id: 'burrito-carne',
    name: 'Carne Asada Burrito',
    description: 'Large flour tortilla with steak, rice, beans and salsa',
    price: 9.99,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('burrito-carne'),
      srcSet: `${getImagePath('burrito-carne', 'webp')} 1x, ${getImagePath('burrito-carne', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'burritos',
    isSpicy: true
  },
  {
    id: 'burrito-pollo',
    name: 'Chicken Burrito',
    description: 'Large flour tortilla with chicken, rice, beans and salsa',
    price: 8.99,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('burrito-pollo'),
      srcSet: `${getImagePath('burrito-pollo', 'webp')} 1x, ${getImagePath('burrito-pollo', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'burritos'
  },
  {
    id: 'burrito-frijoles',
    name: 'Bean & Cheese Burrito',
    description: 'Large flour tortilla with beans, cheese and salsa',
    price: 7.49,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('burrito-frijoles'),
      srcSet: `${getImagePath('burrito-frijoles', 'webp')} 1x, ${getImagePath('burrito-frijoles', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'burritos',
    isVegetarian: true
  },
  {
    id: 'quesadilla-carne',
    name: 'Steak Quesadilla',
    description: 'Flour tortilla with cheese and grilled steak',
    price: 8.49,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('quesadilla-carne'),
      srcSet: `${getImagePath('quesadilla-carne', 'webp')} 1x, ${getImagePath('quesadilla-carne', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'quesadillas',
    isSpicy: true
  },
  {
    id: 'quesadilla-pollo',
    name: 'Chicken Quesadilla',
    description: 'Flour tortilla with cheese and grilled chicken',
    price: 7.99,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('quesadilla-pollo'),
      srcSet: `${getImagePath('quesadilla-pollo', 'webp')} 1x, ${getImagePath('quesadilla-pollo', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'quesadillas'
  },
  {
    id: 'quesadilla-queso',
    name: 'Cheese Quesadilla',
    description: 'Flour tortilla with melted cheese',
    price: 6.49,
    image: 'https://placeholder.com/150',
    optimizedImage: {
      src: getImagePath('quesadilla-queso'),
      srcSet: `${getImagePath('quesadilla-queso', 'webp')} 1x, ${getImagePath('quesadilla-queso', 'webp')}?size=2x 2x`,
      sizes: '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw'
    },
    category: 'quesadillas',
    isVegetarian: true
  }
];