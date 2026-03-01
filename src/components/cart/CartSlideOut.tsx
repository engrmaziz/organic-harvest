"use client";

import { useCartStore } from "@/lib/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Utility to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(price).replace("PKR", "Rs.");
};

export function CartSlideOut() {
    const { items, isOpen, setIsOpen, incrementQuantity, decrementQuantity, removeItem, getCartTotal } = useCartStore();

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-md">
                <SheetHeader className="px-1 text-left">
                    <SheetTitle className="flex items-center gap-2 font-heading text-2xl">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                        Your Cart ({items.length})
                    </SheetTitle>
                </SheetHeader>

                <Separator className="my-4" />

                <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <ShoppingBag className="h-16 w-16 text-muted" />
                            <p className="text-lg text-muted-foreground">Your cart is empty.</p>
                            <Button
                                variant="outline"
                                className="mt-4 rounded-full"
                                onClick={() => setIsOpen(false)}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-start group">
                                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                        {item.image_url ? (
                                            <ImageWithSkeleton
                                                src={item.image_url}
                                                alt={item.name}
                                                containerClassName="absolute inset-0 h-full w-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-muted-foreground/50 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 gap-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h4 className="font-heading font-bold text-lg text-foreground line-clamp-1">{item.name}</h4>
                                                <span className="text-xs font-medium text-muted-foreground">{item.weight || "1 Unit"}</span>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                title="Remove item"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-medium text-primary">
                                                {formatPrice(item.price)}
                                            </span>
                                            <div className="flex items-center border border-border rounded-lg bg-background">
                                                <button
                                                    onClick={() => decrementQuantity(item.id)}
                                                    className="p-1 hover:bg-muted transition-colors rounded-l-lg"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => incrementQuantity(item.id)}
                                                    className="p-1 hover:bg-muted transition-colors rounded-r-lg"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="pt-6 pb-2 border-t border-border mt-auto">
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-semibold text-lg">Subtotal</span>
                            <span className="font-bold text-xl text-primary">{formatPrice(getCartTotal())}</span>
                        </div>
                        <div className="space-y-3">
                            <Button asChild className="w-full h-12 rounded-xl text-lg font-bold shadow-lg bg-[#2E472D] hover:bg-[#1F331F] text-white">
                                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                                    Proceed to Checkout
                                </Link>
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                Shipping and taxes calculated at checkout.
                            </p>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
