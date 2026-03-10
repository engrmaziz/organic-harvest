"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState, useRef, Suspense } from "react";
import { CheckCircle2, Package, Truck, ArrowRight, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Brand color used in the print invoice
const BRAND_COLOR = "#2E472D";

// Utility to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(price).replace("PKR", "Rs.");
};

interface OrderItem {
    product_id: string;
    name: string;
    quantity: number;
    price: number;
}

interface OrderDetails {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_city: string;
    customer_address: string;
    payment_method: string;
    subtotal: number;
    shipping_fee: number;
    discount_applied: number;
    grand_total: number;
    coupon_used: string | null;
    items: OrderItem[];
    created_at: string;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("id");
    const { clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Dynamic data passed from the checkout page
    const totalAmount = searchParams.get("total") ? parseFloat(searchParams.get("total")!) : 0;
    const paymentMethod = searchParams.get("method") || "COD";
    const customerPhone = searchParams.get("phone") || "your phone number";

    // Share Order
    const handleShare = async () => {
        try {
            await navigator.share({
                title: 'Organic Harvest Order',
                text: 'I just placed an order for premium organic food from Organic Harvest!',
                url: window.location.origin,
            });
        } catch {
            // Share not supported or user cancelled — fail silently
        }
    };

    // Direct PDF Download
    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;
        try {
            const element = invoiceRef.current;
            const domtoimage = (await import("dom-to-image-more")).default;
            const { jsPDF } = await import("jspdf");

            // Generate high-quality PNG
            const dataUrl = await domtoimage.toPng(element, {
                quality: 1,
                bgcolor: '#ffffff',
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });

            // Calculate A4 dimensions
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

            // Add image to PDF and trigger silent download
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Organic_Harvest_Receipt.pdf');
        } catch (error) {
            console.error("🔥 PDF Generation Error:", error);
        }
    };

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

        // Fetch full order details from Supabase for the print receipt
        if (orderId) {
            supabase
                .from("orders")
                .select("*")
                .eq("id", orderId)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Failed to load order details for invoice:", error.message);
                    } else if (data) {
                        setOrderDetails(data as OrderDetails);
                    }
                });
        }
    }, [clearCart, orderId]);

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

    // Determine the invoice date
    const invoiceDate = orderDetails?.created_at
        ? new Date(orderDetails.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })
        : new Date().toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

    const invoiceItems: OrderItem[] = orderDetails?.items ?? [];
    const invoiceSubtotal = orderDetails?.subtotal ?? totalAmount;
    const invoiceShipping = orderDetails?.shipping_fee ?? 0;
    const invoiceDiscount = orderDetails?.discount_applied ?? 0;
    const invoiceGrandTotal = orderDetails?.grand_total ?? totalAmount;
    const invoiceCoupon = orderDetails?.coupon_used ?? null;

    return (
        <>
            {/* ── SCREEN-ONLY SUCCESS CARD ─────────────────────────────────── */}
            <div className="container mx-auto px-4 py-20 min-h-[80vh] flex items-center justify-center print:hidden">
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
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button onClick={handleDownloadPDF} variant="outline" size="lg" className="rounded-xl h-14 px-8 text-lg font-bold flex items-center gap-2 transition-all duration-300">
                                        <Download className="w-5 h-5" />
                                        Download Receipt
                                    </Button>
                                    <Button onClick={handleShare} variant="outline" size="lg" className="rounded-xl h-14 px-8 text-lg font-bold flex items-center gap-2 transition-all duration-300">
                                        <Share2 className="w-5 h-5" />
                                        Share Order
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── PDF INVOICE (off-screen, captured by html2canvas) ────────── */}
            <div
                ref={invoiceRef}
                style={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    width: "794px",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    padding: "32px",
                }}
            >

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "24px", marginBottom: "24px" }}>
                    <div>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: "800", color: BRAND_COLOR, margin: 0 }}>Organic Harvest</p>
                        <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>Premium Organic Pantry Products · Pakistan</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "4px", color: BRAND_COLOR, margin: 0 }}>INVOICE</p>
                        <p style={{ fontSize: "13px", color: "#374151", margin: "6px 0 2px 0", whiteSpace: "nowrap" }}>
                            <span style={{ fontWeight: "600" }}>Order ID:</span> #{orderId.split("-")[0].toUpperCase()}
                        </p>
                        <p style={{ fontSize: "13px", color: "#374151", margin: 0, whiteSpace: "nowrap" }}>
                            <span style={{ fontWeight: "600" }}>Date:</span> {invoiceDate}
                        </p>
                    </div>
                </div>

                {/* Customer Details */}
                <div style={{ marginBottom: "28px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#6b7280", marginBottom: "12px" }}>Bill To / Ship To</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 48px" }}>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0" }}>Customer Name</p>
                            <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>{orderDetails?.customer_name || "—"}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0" }}>Email Address</p>
                            <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>{orderDetails?.customer_email || "—"}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0" }}>Phone</p>
                            <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>{orderDetails?.customer_phone || "—"}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0" }}>Shipping Address</p>
                            <p style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>
                                {orderDetails
                                    ? [orderDetails.customer_address, orderDetails.customer_city].filter(Boolean).join(", ")
                                    : "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Itemized Table */}
                <div style={{ marginBottom: "28px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f9fafb", color: "#6b7280" }}>
                                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: "600", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Item</th>
                                <th style={{ textAlign: "center", padding: "10px 14px", fontWeight: "600", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Qty</th>
                                <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: "600", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Unit Price</th>
                                <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: "600", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceItems.length > 0 ? invoiceItems.map((item, idx) => (
                                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#f9fafb" : "#ffffff" }}>
                                    <td style={{ padding: "10px 14px", fontWeight: "500" }}>{item.name}</td>
                                    <td style={{ padding: "10px 14px", textAlign: "center" }}>{item.quantity}</td>
                                    <td style={{ padding: "10px 14px", textAlign: "right" }}>{formatPrice(item.price)}</td>
                                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "600" }}>{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: "16px 14px", textAlign: "center", color: "#9ca3af" }}>No items available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Financial Summary */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ width: "380px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                            <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>Subtotal</span>
                            <span style={{ fontWeight: "500", whiteSpace: "nowrap" }}>{formatPrice(invoiceSubtotal)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                            <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>Shipping Fee</span>
                            <span style={{ fontWeight: "500", whiteSpace: "nowrap" }}>{invoiceShipping === 0 ? "Free" : formatPrice(invoiceShipping)}</span>
                        </div>
                        {invoiceCoupon && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                                <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>Coupon Applied</span>
                                <span style={{ fontWeight: "500", color: "#16a34a", whiteSpace: "nowrap" }}>{invoiceCoupon}</span>
                            </div>
                        )}
                        {invoiceDiscount > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "14px" }}>
                                <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>Discount</span>
                                <span style={{ fontWeight: "500", color: "#16a34a", whiteSpace: "nowrap" }}>- {formatPrice(invoiceDiscount)}</span>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px 0", fontSize: "20px", marginTop: "4px" }}>
                            <span style={{ fontWeight: "800", color: BRAND_COLOR, whiteSpace: "nowrap" }}>Grand Total</span>
                            <span style={{ fontWeight: "800", color: BRAND_COLOR, whiteSpace: "nowrap" }}>{formatPrice(invoiceGrandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: "40px", paddingTop: "16px", textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>
                    <p style={{ margin: 0 }}>Thank you for shopping with Organic Harvest · organicharvest.pk · support@organicharvest.pk</p>
                    <p style={{ margin: "4px 0 0 0" }}>This is a computer-generated invoice and does not require a physical signature.</p>
                </div>
            </div>
        </>
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
