import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    weight: string;
    image_url: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    incrementQuantity: (id: string) => void;
    decrementQuantity: (id: string) => void;
    clearCart: () => void;
    setIsOpen: (isOpen: boolean) => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (newItem) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === newItem.id);

                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === newItem.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                            isOpen: true, // Open cart when item is added
                        };
                    }

                    return {
                        items: [...state.items, { ...newItem, quantity: 1 }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                set((state) => ({
                    items: quantity > 0
                        ? state.items.map((item) =>
                            item.id === id ? { ...item, quantity } : item
                        )
                        : state.items.filter((item) => item.id !== id),
                }));
            },

            incrementQuantity: (id) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                }));
            },

            decrementQuantity: (id) => {
                set((state) => ({
                    items: state.items.map((item) => {
                        if (item.id === id) {
                            return { ...item, quantity: item.quantity - 1 };
                        }
                        return item;
                    }).filter((item) => item.quantity > 0),
                }));
            },

            clearCart: () => set({ items: [] }),

            setIsOpen: (isOpen) => set({ isOpen }),

            getCartTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getCartCount: () => {
                const { items } = get();
                return items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'organic-harvest-cart', // name of the item in the storage (must be unique)
            partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen state
        }
    )
);
