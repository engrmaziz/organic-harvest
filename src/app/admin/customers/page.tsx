"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Download, Loader2 } from "lucide-react";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    })
        .format(price)
        .replace("PKR", "Rs.");

type DateFilter = "7" | "30" | "all" | "custom";

interface CustomerSummary {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    total_orders: number;
    lifetime_value: number;
    last_order_date: string;
}

export default function CustomersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error) setOrders(data || []);
        setLoading(false);
    };

    const filteredOrders = useMemo(() => {
        const now = new Date();
        return orders.filter((order) => {
            const date = new Date(order.created_at);
            if (dateFilter === "7") {
                const cutoff = new Date(now);
                cutoff.setDate(now.getDate() - 7);
                return date >= cutoff;
            }
            if (dateFilter === "30") {
                const cutoff = new Date(now);
                cutoff.setDate(now.getDate() - 30);
                return date >= cutoff;
            }
            if (dateFilter === "custom" && customFrom && customTo) {
                return date >= new Date(customFrom) && date <= new Date(customTo + "T23:59:59");
            }
            return true;
        });
    }, [orders, dateFilter, customFrom, customTo]);

    const customers = useMemo<CustomerSummary[]>(() => {
        const map: Record<string, CustomerSummary> = {};
        filteredOrders.forEach((order) => {
            const phone = order.customer_phone || "Unknown";
            if (!map[phone]) {
                map[phone] = {
                    customer_name: order.customer_name || "—",
                    customer_phone: phone,
                    customer_email: order.customer_email || "—",
                    total_orders: 0,
                    lifetime_value: 0,
                    last_order_date: order.created_at,
                };
            }
            map[phone].total_orders += 1;
            map[phone].lifetime_value +=
                order.grand_total ?? order.total_amount ?? 0;
            if (
                new Date(order.created_at) > new Date(map[phone].last_order_date)
            ) {
                map[phone].last_order_date = order.created_at;
                map[phone].customer_name = order.customer_name || map[phone].customer_name;
                map[phone].customer_email = order.customer_email || map[phone].customer_email;
            }
        });
        return Object.values(map).sort((a, b) => b.lifetime_value - a.lifetime_value);
    }, [filteredOrders]);

    const exportCSV = () => {
        const headers = ["Name", "Phone", "Email", "Total Orders", "Lifetime Value (PKR)"];
        const rows = customers.map((c) => [
            c.customer_name,
            c.customer_phone,
            c.customer_email,
            c.total_orders,
            c.lifetime_value,
        ]);
        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `customers-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8" style={{ color: "#FDFBF7" }}>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1
                        className="text-3xl font-bold flex items-center gap-3"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                    >
                        <Users className="h-7 w-7" style={{ color: "#D4AF37" }} />
                        Customers (CRM)
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "rgba(253,251,247,0.6)" }}>
                        Customer directory with lifetime value insights
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {(["7", "30", "all", "custom"] as DateFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className="px-3 py-1.5 rounded-full text-sm font-semibold border transition"
                            style={{
                                backgroundColor: dateFilter === f ? "#D4AF37" : "transparent",
                                color: dateFilter === f ? "#0B1C10" : "#D4AF37",
                                borderColor: "#D4AF37",
                            }}
                        >
                            {f === "7"
                                ? "Last 7 Days"
                                : f === "30"
                                    ? "Last 30 Days"
                                    : f === "all"
                                        ? "All Time"
                                        : "Custom"}
                        </button>
                    ))}
                    {dateFilter === "custom" && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="rounded-md px-2 py-1 text-sm border"
                                style={{ backgroundColor: "#0B1C10", color: "#FDFBF7", borderColor: "rgba(212,175,55,0.4)" }}
                            />
                            <span style={{ color: "rgba(253,251,247,0.5)" }}>to</span>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="rounded-md px-2 py-1 text-sm border"
                                style={{ backgroundColor: "#0B1C10", color: "#FDFBF7", borderColor: "rgba(212,175,55,0.4)" }}
                            />
                        </div>
                    )}

                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition"
                        style={{ backgroundColor: "#D4AF37", color: "#0B1C10" }}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#D4AF37" }} />
                </div>
            ) : customers.length === 0 ? (
                <div
                    className="rounded-2xl border py-20 text-center"
                    style={{ borderColor: "rgba(212,175,55,0.2)", color: "rgba(253,251,247,0.4)" }}
                >
                    No customers found for this period.
                </div>
            ) : (
                <div
                    className="rounded-2xl border overflow-hidden"
                    style={{ borderColor: "rgba(212,175,55,0.2)" }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.15)", backgroundColor: "rgba(212,175,55,0.05)" }}>
                                    {["Name", "Phone", "Email", "Total Orders", "Lifetime Value"].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: "rgba(212,175,55,0.8)" }}
                                            >
                                                {h}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr
                                        key={customer.customer_phone}
                                        style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}
                                    >
                                        <td
                                            className="px-6 py-3 font-semibold"
                                            style={{ color: "#FDFBF7" }}
                                        >
                                            {customer.customer_name}
                                        </td>
                                        <td
                                            className="px-6 py-3"
                                            style={{ color: "rgba(253,251,247,0.7)" }}
                                        >
                                            {customer.customer_phone}
                                        </td>
                                        <td
                                            className="px-6 py-3"
                                            style={{ color: "rgba(253,251,247,0.7)" }}
                                        >
                                            {customer.customer_email}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span
                                                className="px-2 py-0.5 rounded-full text-xs font-bold"
                                                style={{
                                                    backgroundColor: "rgba(212,175,55,0.15)",
                                                    color: "#D4AF37",
                                                }}
                                            >
                                                {customer.total_orders}
                                            </span>
                                        </td>
                                        <td
                                            className="px-6 py-3 font-bold"
                                            style={{ color: "#D4AF37" }}
                                        >
                                            {formatPrice(customer.lifetime_value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
