import { create } from 'zustand';
import { OrderItem } from '../types';

interface CartState {
  items: OrderItem[];
  isOpen: boolean;
  addItem: (item: OrderItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.productId === item.productId && i.color === item.color && i.size === item.size);
    if (existing) {
      return { 
        items: state.items.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i),
        isOpen: true
      };
    }
    return { items: [...state.items, item], isOpen: true };
  }),
  removeItem: (productId, color, size) => set((state) => ({
    items: state.items.filter(i => !(i.productId === productId && i.color === color && i.size === size))
  })),
  updateQuantity: (productId, color, size, quantity) => set((state) => ({
    items: state.items.map(i => (i.productId === productId && i.color === color && i.size === size) ? { ...i, quantity } : i)
  })),
  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  getTotal: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
}));
