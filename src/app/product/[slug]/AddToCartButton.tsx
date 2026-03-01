"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { ShoppingBag } from "lucide-react";

export function AddToCartButton({ product }: { product: any }) {
    const { addItem } = useCartStore();

    return (
        <Button
            onClick={() => {
                addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    weight: product.weight,
                    image_url: product.image_url,
                });
            }}
            size="lg"
            className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-2xl shadow-xl bg-foreground hover:bg-primary text-background group transition-all duration-300 flex items-center gap-3"
        >
            <ShoppingBag className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            Add to Shopping Cart
        </Button>
    );
}
