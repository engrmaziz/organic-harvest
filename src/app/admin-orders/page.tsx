"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PackageSearch, Eye, Mail, MessageSquare, MapPin, Hash, CheckCircle2, LockKeyhole } from "lucide-react";

// Utility to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(price).replace("PKR", "Rs.");
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [authError, setAuthError] = useState("");

    useEffect(() => {
        // Check session storage on mount
        const sessionAuth = sessionStorage.getItem("admin_authenticated");
        if (sessionAuth === "true") {
            setIsAuthenticated(true);
            fetchOrders();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === "OrganicHarvest2026") {
            setIsAuthenticated(true);
            sessionStorage.setItem("admin_authenticated", "true");
            setAuthError("");
            fetchOrders();
        } else {
            setAuthError("Incorrect Admin Key");
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        } else {
            setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Pending":
                return "warning"; // Usually amber/yellow
            case "Processing":
            case "Shipped":
                return "default"; // Blue/Primary
            case "Delivered":
                return "success"; // Green
            case "Cancelled":
                return "destructive"; // Red
            default:
                return "outline";
        }
    };

    // Explicit tailwind colors for status if custom badges aren't defined
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-amber-100 text-amber-800 border-amber-200";
            case "Processing": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Shipped": return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "Delivered": return "bg-green-100 text-green-800 border-green-200";
            case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container px-4 py-20 mx-auto min-h-[80vh] flex items-center justify-center">
                <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
                            <LockKeyhole className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-heading font-bold">Admin Portal</CardTitle>
                        <CardDescription className="text-base">
                            Enter the secret key to view live order data.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Secret Admin Key"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="h-12 text-center text-lg tracking-widest"
                                    autoFocus
                                />
                                {authError && <p className="text-red-500 text-sm font-medium text-center mt-1">{authError}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full h-12 text-lg font-bold">
                                Unlock Dashboard
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="container px-4 py-12 mx-auto max-w-7xl min-h-screen">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-heading text-4xl font-bold flex items-center gap-3">
                        <PackageSearch className="w-8 h-8 text-primary" />
                        Order Management
                    </h1>
                    <p className="text-muted-foreground mt-2">View and manage all incoming store orders.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm">
                    {orders.length} Total Orders
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-medium text-foreground">No orders yet</h3>
                    <p className="text-muted-foreground">When customers place orders, they will appear here.</p>
                </div>
            ) : (
                <div className="bg-card border rounded-2xl shadow-sm overflow-hidden auto-cols-max">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer Info</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono font-medium">#{order.id.split("-")[0].toUpperCase()}</TableCell>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString("en-PK", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{order.customer_name}</span>
                                            <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center gap-1">
                                                {order.customer_phone}
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-primary">
                                        {formatPrice(order.total_amount)}
                                        {order.discount_code && (
                                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 text-[10px] uppercase border-green-200">
                                                {order.discount_code}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.status}
                                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                                        >
                                            <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold ${getStatusColor(order.status)} border rounded-full`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Processing">Processing</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="shadow-sm hover:border-primary hover:text-primary transition-colors">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle className="flex flex-wrap items-center gap-3 text-2xl font-heading">
                                                        Order #{order.id.split("-")[0].toUpperCase()}
                                                        <Badge className={`${getStatusColor(order.status)} border`}>
                                                            {order.status}
                                                        </Badge>
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Placed on {new Date(order.created_at).toLocaleString("en-PK")}
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                                    {/* Customer Details */}
                                                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                                                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                                            Contact Info
                                                        </h4>
                                                        <div className="text-sm space-y-1">
                                                            <p><span className="text-muted-foreground">Name:</span> {order.customer_name}</p>
                                                            <p><span className="text-muted-foreground">Phone:</span> {order.customer_phone}</p>
                                                            <p className="break-all"><span className="text-muted-foreground">Email:</span> {order.customer_email || "N/A"}</p>
                                                        </div>
                                                    </div>

                                                    {/* Delivery Details */}
                                                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                                                        <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            Delivery Address
                                                        </h4>
                                                        <div className="text-sm space-y-1">
                                                            <p><span className="text-muted-foreground">City:</span> {order.customer_city}</p>
                                                            <p className="text-muted-foreground leading-relaxed">
                                                                {order.customer_address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Notes */}
                                                {order.order_notes && (
                                                    <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                                        <h4 className="font-semibold flex items-center gap-2 text-amber-900 mb-2">
                                                            <MessageSquare className="w-4 h-4" />
                                                            Special Notes
                                                        </h4>
                                                        <p className="text-sm text-amber-800 italic">"{order.order_notes}"</p>
                                                    </div>
                                                )}

                                                {/* Items List */}
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                                        <Hash className="w-4 h-4 text-muted-foreground" />
                                                        Purchased Items ({order.items?.length || 0})
                                                    </h4>
                                                    <div className="border rounded-xl divide-y">
                                                        {order.items?.map((item: any, index: number) => (
                                                            <div key={index} className="flex justify-between items-center p-3 text-sm hover:bg-muted/20 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="font-medium bg-muted w-6 h-6 rounded flex items-center justify-center text-xs">
                                                                        {item.quantity}x
                                                                    </div>
                                                                    <span>{item.name}</span>
                                                                </div>
                                                                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 mt-6 pt-4 border-t">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground font-medium">Payment Method</span>
                                                        <span className="font-semibold">{order.payment_method}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-lg">
                                                        <span className="font-bold text-foreground">Grand Total</span>
                                                        <span className="font-bold text-primary">{formatPrice(order.total_amount)}</span>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
