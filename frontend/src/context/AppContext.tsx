import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { productService } from '../services/product.service';

export type Product = {
  id: number | string;
  name: string;
  price: number;
  oldPrice?: number | null;
  category: string;
  image: string;
  rating: number;
  reviews?: number;
  totalReviews?: number;
  stock?: number;
  tags?: string;
  type: 'SALE' | 'RENT' | 'BOTH';
  rentPriceDay?: number;
};

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  type: 'SALE' | 'RENT';
};

type AppContextType = {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  categories: any[];
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  // Sidebar
  isSideNavOpen: boolean;
  setIsSideNavOpen: Dispatch<SetStateAction<boolean>>;
  // Filters & Sort
  activeCategory: string;
  setActiveCategory: Dispatch<SetStateAction<string>>;
  activeFilter: string;
  setActiveFilter: Dispatch<SetStateAction<string>>;
  currentSort: string;
  setCurrentSort: Dispatch<SetStateAction<string>>;
  // Wishlist & Compare
  wishlist: (string | number)[];
  setWishlist: Dispatch<SetStateAction<(string | number)[]>>;
  compareList: (string | number)[];
  setCompareList: Dispatch<SetStateAction<(string | number)[]>>;
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Theme & Language
  const [theme, setTheme] = useState(() => localStorage.getItem('ms_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('ms_lang') || 'en');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ms_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('ms_lang', language);
  }, [language]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('ms_cart') || '[]'); } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  // Filters & Sort
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('default');

  // Wishlist & Compare
  const [wishlist, setWishlist] = useState<(string | number)[]>(() => {
    try { return JSON.parse(localStorage.getItem('ms_wishlist') || '[]'); } catch { return []; }
  });
  const [compareList, setCompareList] = useState<(string | number)[]>(() => {
    try { return JSON.parse(localStorage.getItem('ms_compare') || '[]'); } catch { return []; }
  });

  // Fetch Live Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getAll(),
          productService.getCategories()
        ]);

        const mappedProducts = (productsData?.data || []).map((p: any) => ({
          ...p,
          price: p.salePrice ?? 0,
          oldPrice: p.comparePrice ?? null,
          image: p.images?.[0]?.url || 'https://placehold.co/400x300/E5E7EB/9CA3AF?text=No+Image',
          category: p.category?.name || 'Uncategorized',
          reviews: p.totalReviews ?? 0,
          tags: p.tags || '',
          stock: p.stock ?? 0,
        }));

        setProducts(mappedProducts);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Failed to fetch store data:', err);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('ms_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === item.type);
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string | number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('ms_cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        categories,
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        loading,
        isSideNavOpen,
        setIsSideNavOpen,
        activeCategory,
        setActiveCategory,
        activeFilter,
        setActiveFilter,
        currentSort,
        setCurrentSort,
        wishlist,
        setWishlist,
        compareList,
        setCompareList,
        theme,
        setTheme,
        language,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
