"use client";

import { useCartStore } from "@/lib/store/cart";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { validateCoupon, burnCoupon } from "@/app/actions/discount-actions";
import { sendOrderConfirmationEmail } from "@/app/actions/send-order-email";
import { saveDraftOrder } from "@/app/actions/checkout-actions";
import { getSmartUpsell, UpsellProduct } from "@/app/actions/upsell-actions";

// Utility to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(price).replace("PKR", "Rs.");
};

export default function CheckoutPage() {
    const router = useRouter();
    const { items, addItem, setCoupon, clearCoupon, couponCode, discountAmount, getSubtotal, getShipping, getGrandTotal } = useCartStore();

    // Mounted state to handle hydration properly
    const [mounted, setMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_city: "",
        customer_address: "",
        order_notes: "",
        payment_method: "COD",
    });

    const [draftOrderId, setDraftOrderId] = useState<string | null>(null);
    const [couponInput, setCouponInput] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [discountError, setDiscountError] = useState("");
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [upsellItem, setUpsellItem] = useState<UpsellProduct | null>(null);
    const [isUpsellAdding, setIsUpsellAdding] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponInput) return;
        setApplyingCoupon(true);
        setDiscountError("");
        const result = await validateCoupon(couponInput);
        if (!result.success || !result.data) {
            setDiscountError(result.error ?? "Invalid coupon code.");
            setCouponApplied(false);
        } else {
            const { discount_type, discount_value, code } = result.data;
            const subtotal = getSubtotal();
            const amount =
                discount_type === "percentage"
                    ? (subtotal * discount_value) / 100
                    : discount_value;
            setCoupon(code, amount);
            setCouponApplied(true);
        }
        setApplyingCoupon(false);
    };

    const handleRemoveCoupon = () => {
        clearCoupon();
        setCouponInput("");
        setCouponApplied(false);
        setDiscountError("");
    };

    const subtotal = mounted ? getSubtotal() : 0;
    const shippingFee = mounted ? getShipping() : 250;
    const finalTotal = mounted ? getGrandTotal() : 0;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const fetchUpsell = async () => {
            const ids = items.map((item) => item.id);
            const result = await getSmartUpsell(ids);
            setUpsellItem(result);
        };
        fetchUpsell();
    }, [items, mounted]);

    const handleAddUpsell = () => {
        if (!upsellItem) return;
        setIsUpsellAdding(true);
        addItem({
            id: upsellItem.id,
            name: upsellItem.name,
            price: upsellItem.discountedPrice,
            weight: upsellItem.weight,
            image_url: upsellItem.image_url,
        });
        setUpsellItem(null);
        setIsUpsellAdding(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailBlur = async () => {
        const email = formData.customer_email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || items.length === 0) return;
        const mappedItems = items.map(item => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        }));
        try {
            const result = await saveDraftOrder(email, mappedItems, subtotal, draftOrderId);
            if (result.id) {
                setDraftOrderId(result.id);
            }
        } catch (error) {
            console.error("🔥 CLIENT DRAFT ERROR:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        setIsSubmitting(true);

        try {
            const orderPayload = {
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                customer_city: formData.customer_city,
                customer_address: formData.customer_address,
                order_notes: formData.order_notes,
                payment_method: formData.payment_method,
                total_amount: finalTotal,
                subtotal,
                shipping_fee: shippingFee,
                discount_applied: discountAmount,
                grand_total: finalTotal,
                coupon_used: couponCode ?? null,
                discount_code: couponCode ?? null, // kept for backward compatibility with admin-orders view
                status: "Pending",
                items: items.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
            };

            const { data, error } = draftOrderId
                ? await supabase.from("orders").update(orderPayload).eq("id", draftOrderId).eq("status", "Draft").select()
                : await supabase.from("orders").insert([orderPayload]).select();

            // If the draft was claimed by the cron job before checkout completed, fall back to insert
            const { data: finalData, error: finalError } = (draftOrderId && (!data || data.length === 0) && !error)
                ? await supabase.from("orders").insert([orderPayload]).select()
                : { data, error };

            if (finalError) throw finalError;
            const orderId = finalData && finalData[0] ? finalData[0].id : "unknown";

            // Burn coupon after successful order to prevent reuse beyond max_uses
            if (couponCode) {
                const burnResult = await burnCoupon(couponCode);
                if (!burnResult.success) {
                    console.error("⚠️ Could not burn coupon after order:", burnResult.error);
                }
            }

            // Send confirmation email via secure Server Action; don't block redirect on failure
            try {
                const emailResult = await sendOrderConfirmationEmail(formData.customer_email, orderId, finalTotal);
                if (!emailResult.success) {
                    console.error("📧 Could not send confirmation email:", emailResult.error);
                }
            } catch (emailErr) {
                console.error("📧 Could not send confirmation email:", emailErr);
            }

            router.push(`/checkout/success?id=${orderId}&total=${finalTotal}&method=${encodeURIComponent(formData.payment_method)}&phone=${encodeURIComponent(formData.customer_phone)}`);

        } catch (error: any) {
            console.error("🔥 CHECKOUT ERROR:", error);
            const errorMessage = error instanceof Error ? error.message : (error?.message || error?.details || "An unexpected error occurred. Please try again.");
            alert("Checkout Failed: " + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center max-w-md">
                <ShoppingBag className="h-20 w-20 text-muted mb-6" />
                <h1 className="font-heading text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8">You need to add some healthy organic products to your cart before you can checkout.</p>
                <Button onClick={() => router.push("/")} size="lg" className="rounded-full w-full">
                    Browse Products
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="mb-8">
                <h1 className="font-heading text-4xl font-bold">Checkout</h1>
                <p className="text-muted-foreground mt-2">Complete your order details below.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Checkout Form */}
                <div className="lg:col-span-7 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Contact & Delivery Information</CardTitle>
                                <CardDescription>We'll use this to deliver your products and send order updates.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">Full Name</Label>
                                        <Input id="customer_name" name="customer_name" required value={formData.customer_name} onChange={handleChange} placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_email">Email Address</Label>
                                        <Input id="customer_email" type="email" name="customer_email" required value={formData.customer_email} onChange={handleChange} onBlur={handleEmailBlur} placeholder="e.g. john@example.com" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_phone">Phone Number</Label>
                                        <Input id="customer_phone" name="customer_phone" required value={formData.customer_phone} onChange={handleChange} placeholder="e.g. 03xx-xxxxxxx" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_city">City</Label>
                                    <Input id="customer_city" name="customer_city" required value={formData.customer_city} onChange={handleChange} placeholder="e.g. Lahore, Karachi" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_address">Complete Delivery Address</Label>
                                    <Textarea id="customer_address" name="customer_address" required value={formData.customer_address} onChange={handleChange} placeholder="House #, Street #, Sector/Block, Area" className="min-h-[100px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="order_notes">Order Notes (Optional)</Label>
                                    <Textarea id="order_notes" name="order_notes" value={formData.order_notes} onChange={handleChange} placeholder="Delivery instructions or special requests..." className="min-h-[80px]" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Discount Code</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Enter coupon code"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        disabled={couponApplied}
                                    />
                                    {couponApplied ? (
                                        <Button type="button" variant="outline" onClick={handleRemoveCoupon}>
                                            Remove
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleApplyCoupon}
                                            disabled={!couponInput || applyingCoupon}
                                        >
                                            {applyingCoupon ? "Checking..." : "Apply"}
                                        </Button>
                                    )}
                                </div>
                                {discountError && <p className="text-sm text-red-500 mt-2">{discountError}</p>}
                                {couponApplied && couponCode && (
                                    <p className="text-sm text-green-600 mt-2 font-medium">
                                        Coupon &quot;{couponCode}&quot; applied successfully!
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Payment Method</CardTitle>
                                <CardDescription>Select your preferred payment method.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-4 border rounded-xl bg-secondary/10 border-primary">
                                        <input type="radio" id="cod" name="payment_method" value="COD" checked={formData.payment_method === "COD"} onChange={handleChange} className="h-4 w-4 text-primary" />
                                        <Label htmlFor="cod" className="font-semibold text-base cursor-pointer flex-1">Cash on Delivery (COD)</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-muted/50 cursor-pointer">
                                        <input type="radio" id="bank" name="payment_method" value="Bank Transfer" checked={formData.payment_method === "Bank Transfer"} onChange={handleChange} className="h-4 w-4" />
                                        <Label htmlFor="bank" className="font-semibold text-base cursor-pointer flex-1 flex flex-col gap-1">
                                            <span>Manual Bank Transfer / JazzCash</span>
                                            <span className="text-sm font-normal text-muted-foreground">Account details will be shown after order placement.</span>
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                            {isSubmitting ? "Processing Order..." : `Place Order • ${formatPrice(finalTotal)}`}
                        </Button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-5 sticky top-24">
                    <Card className="border-border bg-muted/30 shadow-sm">
                        <CardHeader className="bg-muted/50 pb-4 border-b">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                                            {item.image_url ? (
                                                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-secondary/20" />
                                            )}
                                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border border-background">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">{item.weight}</p>
                                        </div>
                                        <div className="font-semibold text-sm self-center">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-6" />

                            {upsellItem && (
                                <div className="mb-4 rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-yellow-700 dark:text-yellow-400 mb-3">
                                        ⚡ Special Offer
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {upsellItem.image_url && (
                                            <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 border">
                                                <Image src={upsellItem.image_url} alt={upsellItem.name} fill className="object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm line-clamp-1">{upsellItem.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Add to this order for 15% off!</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm font-bold text-primary">{formatPrice(upsellItem.discountedPrice)}</span>
                                                <span className="text-xs text-muted-foreground line-through">{formatPrice(upsellItem.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddUpsell}
                                        disabled={isUpsellAdding}
                                        className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                                    >
                                        {isUpsellAdding ? "Adding..." : "Add to Order"}
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex justify-between text-muted-foreground text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                                </div>
                                {couponApplied && discountAmount > 0 && couponCode && (
                                    <div className="flex justify-between text-green-600 text-sm font-medium">
                                        <span>Discount ({couponCode})</span>
                                        <span>-{formatPrice(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-muted-foreground text-sm">
                                    <span>Shipping</span>
                                    <span className="font-medium text-foreground">
                                        {shippingFee === 0 ? (
                                            <span className="text-green-600 font-semibold">Free</span>
                                        ) : (
                                            formatPrice(shippingFee)
                                        )}
                                    </span>
                                </div>
                                {shippingFee > 0 && (
                                    <p className="text-xs text-muted-foreground">Free shipping on orders above Rs. 3,000</p>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-bold text-lg">Grand Total</span>
                                    <span className="font-bold text-2xl text-primary">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
