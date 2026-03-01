"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState, Suspense } from "react";
import { CheckCircle2, Package, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle } from "lucide-react";

// Utility to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(price).replace("PKR", "Rs.");
};

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("id");
    const { clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    // Dynamic data passed from the checkout page
    const totalAmount = searchParams.get("total") ? parseFloat(searchParams.get("total")!) : 0;
    const paymentMethod = searchParams.get("method") || "COD";
    const customerPhone = searchParams.get("phone") || "your phone number";

    // WhatsApp Message Builder
    const handleWhatsAppClick = () => {
        const shortOrderId = orderId ? orderId.split("-")[0].toUpperCase() : "UNKNOWN";
        const message = `Hi Organic Harvest! I just placed order #${shortOrderId} for ${formatPrice(totalAmount)}. Please confirm my delivery.`;
        const waLink = `https://wa.me/923000000000?text=${encodeURIComponent(message)}`;
        window.open(waLink, "_blank");
    };

    useEffect(() => {
        setMounted(true);
        // Clear the cart securely when the user lands on the success tracker
        clearCart();
    }, [clearCart]);

    if (!mounted) return null;

    if (!orderId) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center text-center max-w-2xl min-h-[70vh]">
                <Package className="h-24 w-24 text-muted mb-6" />
                <h1 className="font-heading text-4xl font-bold mb-4">No Order Found</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    We couldn't find the order details you are looking for.
                </p>
                <Button onClick={() => router.push("/")} size="lg" className="rounded-xl px-10 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                    Return to Store
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20 min-h-[80vh] flex items-center justify-center">
            <div className="max-w-3xl w-full">
                <div className="flex flex-col items-center text-center space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                        <CheckCircle2 className="h-28 w-28 text-green-500 relative z-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground capitalize tracking-tight">
                            Thank You for Your Purchase!
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We've received your order and our team is preparing it for dispatch. We will contact you on WhatsApp shortly at <span className="font-semibold text-foreground">{customerPhone}</span> for confirmation.
                        </p>
                    </div>
                </div>

                <Card className="border-border shadow-2xl bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
                    <CardContent className="p-0">
                        <div className="bg-muted/30 p-8 md:p-10 border-b">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                                        Order Reference
                                    </p>
                                    <p className="font-mono text-2xl font-bold text-foreground">
                                        #{orderId.split("-")[0].toUpperCase()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                                    <Truck className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Order Placed</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4 font-heading">Payment Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-2xl">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                        <p className="font-semibold">{paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Amount Paid</p>
                                        <p className="font-bold text-primary text-xl">{formatPrice(totalAmount)}</p>
                                    </div>
                                </div>
                            </div>

                            {paymentMethod === "Bank Transfer" && (
                                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                                    <h4 className="font-bold text-amber-900 mb-2">Manual Transfer Instructions</h4>
                                    <p className="text-amber-800 text-sm">
                                        Please transfer {formatPrice(totalAmount)} to our bank account. Our representative will share the account details with you over WhatsApp shortly.
                                    </p>
                                </div>
                            )}

                            <Separator />

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Button onClick={() => router.push("/")} size="lg" className="rounded-xl h-14 px-8 text-lg font-bold shadow-md bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center gap-2 transition-all duration-300">
                                    Continue Shopping
                                </Button>
                                <Button onClick={handleWhatsAppClick} size="lg" className="rounded-xl h-14 px-8 text-lg font-bold shadow-lg bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center gap-2 group transition-all duration-300">
                                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Message Us
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Wrap entirely in Suspense so Next.js doesn't bail out of static rendering for the entire layout
export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading your order details...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
