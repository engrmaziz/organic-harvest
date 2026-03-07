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
    couponCode: string | null;
    discountAmount: number;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    incrementQuantity: (id: string) => void;
    decrementQuantity: (id: string) => void;
    clearCart: () => void;
    setIsOpen: (isOpen: boolean) => void;
    setCoupon: (code: string | null, discountAmount: number) => void;
    clearCoupon: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
    getSubtotal: () => number;
    getShipping: () => number;
    getGrandTotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            couponCode: null,
            discountAmount: 0,

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

            clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),

            setIsOpen: (isOpen) => set({ isOpen }),

            setCoupon: (code, amount) => set({ couponCode: code, discountAmount: amount }),

            clearCoupon: () => set({ couponCode: null, discountAmount: 0 }),

            getCartTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getCartCount: () => {
                const { items } = get();
                return items.reduce((count, item) => count + item.quantity, 0);
            },

            getSubtotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getShipping: () => {
                const subtotal = get().getSubtotal();
                return subtotal >= 3000 ? 0 : 250;
            },

            getGrandTotal: () => {
                const { discountAmount } = get();
                const subtotal = get().getSubtotal();
                const shipping = get().getShipping();
                const discounted = Math.max(0, subtotal - discountAmount);
                return discounted + shipping;
            },
        }),
        {
            name: 'organic-harvest-cart',
            partialize: (state) => ({ items: state.items, couponCode: state.couponCode, discountAmount: state.discountAmount }),
        }
    )
);
