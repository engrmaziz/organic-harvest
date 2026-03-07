"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, DollarSign, Loader2 } from "lucide-react";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    })
        .format(price)
        .replace("PKR", "Rs.");

type DateFilter = "7" | "30" | "custom";

export default function AdminDashboardPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<DateFilter>("30");
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
            .order("created_at", { ascending: true });
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
        }).sort(
            (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, [orders, dateFilter, customFrom, customTo]);

    const revenueByDay = useMemo(() => {
        const map: Record<string, number> = {};
        filteredOrders.forEach((order) => {
            const day = new Date(order.created_at).toLocaleDateString("en-PK", {
                month: "short",
                day: "numeric",
            });
            const amount = order.grand_total ?? order.total_amount ?? 0;
            map[day] = (map[day] || 0) + amount;
        });
        return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
    }, [filteredOrders]);

    const ordersByDay = useMemo(() => {
        const map: Record<string, number> = {};
        filteredOrders.forEach((order) => {
            const day = new Date(order.created_at).toLocaleDateString("en-PK", {
                month: "short",
                day: "numeric",
            });
            map[day] = (map[day] || 0) + 1;
        });
        return Object.entries(map).map(([date, orders]) => ({ date, orders }));
    }, [filteredOrders]);

    const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + (o.grand_total ?? o.total_amount ?? 0),
        0
    );

    const labelStyle = { color: "#FDFBF7", fontFamily: "sans-serif", fontSize: 12 };

    return (
        <div className="p-8" style={{ color: "#FDFBF7" }}>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1
                        className="text-3xl font-bold flex items-center gap-3"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                    >
                        <TrendingUp className="h-7 w-7" style={{ color: "#D4AF37" }} />
                        Analytics Dashboard
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "rgba(253,251,247,0.6)" }}>
                        Revenue and order insights
                    </p>
                </div>

                {/* Date Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {(["7", "30", "custom"] as DateFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className="px-3 py-1.5 rounded-full text-sm font-semibold border transition"
                            style={{
                                backgroundColor:
                                    dateFilter === f ? "#D4AF37" : "transparent",
                                color: dateFilter === f ? "#0B1C10" : "#D4AF37",
                                borderColor: "#D4AF37",
                            }}
                        >
                            {f === "7" ? "Last 7 Days" : f === "30" ? "Last 30 Days" : "Custom"}
                        </button>
                    ))}
                    {dateFilter === "custom" && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="rounded-md px-2 py-1 text-sm border"
                                style={{
                                    backgroundColor: "#0B1C10",
                                    color: "#FDFBF7",
                                    borderColor: "rgba(212,175,55,0.4)",
                                }}
                            />
                            <span style={{ color: "rgba(253,251,247,0.5)" }}>to</span>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="rounded-md px-2 py-1 text-sm border"
                                style={{
                                    backgroundColor: "#0B1C10",
                                    color: "#FDFBF7",
                                    borderColor: "rgba(212,175,55,0.4)",
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    {
                        icon: DollarSign,
                        label: "Total Revenue",
                        value: formatPrice(totalRevenue),
                    },
                    {
                        icon: ShoppingCart,
                        label: "Total Orders",
                        value: filteredOrders.length,
                    },
                    {
                        icon: TrendingUp,
                        label: "Avg Order Value",
                        value: filteredOrders.length
                            ? formatPrice(totalRevenue / filteredOrders.length)
                            : formatPrice(0),
                    },
                ].map(({ icon: Icon, label, value }) => (
                    <div
                        key={label}
                        className="rounded-2xl border p-5"
                        style={{
                            borderColor: "rgba(212,175,55,0.2)",
                            backgroundColor: "rgba(212,175,55,0.05)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Icon className="h-5 w-5" style={{ color: "#D4AF37" }} />
                            <span className="text-sm" style={{ color: "rgba(253,251,247,0.6)" }}>
                                {label}
                            </span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: "#D4AF37" }}>
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#D4AF37" }} />
                </div>
            ) : (
                <>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div
                            className="rounded-2xl border p-6"
                            style={{ borderColor: "rgba(212,175,55,0.2)", backgroundColor: "rgba(212,175,55,0.05)" }}
                        >
                            <h2
                                className="text-lg font-semibold mb-4"
                                style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                            >
                                Revenue Over Time
                            </h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={revenueByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                                    <XAxis dataKey="date" tick={labelStyle} />
                                    <YAxis tick={labelStyle} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0B1C10", border: "1px solid rgba(212,175,55,0.3)", color: "#FDFBF7" }}
                                        formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div
                            className="rounded-2xl border p-6"
                            style={{ borderColor: "rgba(212,175,55,0.2)", backgroundColor: "rgba(212,175,55,0.05)" }}
                        >
                            <h2
                                className="text-lg font-semibold mb-4"
                                style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                            >
                                Orders Per Day
                            </h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={ordersByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
                                    <XAxis dataKey="date" tick={labelStyle} />
                                    <YAxis tick={labelStyle} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0B1C10", border: "1px solid rgba(212,175,55,0.3)", color: "#FDFBF7" }}
                                        formatter={(value) => [Number(value), "Orders"]}
                                    />
                                    <Bar dataKey="orders" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div
                        className="rounded-2xl border overflow-hidden"
                        style={{ borderColor: "rgba(212,175,55,0.2)" }}
                    >
                        <div
                            className="px-6 py-4 border-b"
                            style={{ borderColor: "rgba(212,175,55,0.2)", backgroundColor: "rgba(212,175,55,0.05)" }}
                        >
                            <h2
                                className="text-lg font-semibold"
                                style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                            >
                                Order History
                            </h2>
                        </div>
                        {filteredOrders.length === 0 ? (
                            <div className="py-16 text-center" style={{ color: "rgba(253,251,247,0.4)" }}>
                                No orders found for this period.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
                                            {["Date", "Customer", "Coupon Used", "Grand Total"].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                                    style={{ color: "rgba(212,175,55,0.8)" }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}
                                                >
                                                    <td className="px-6 py-3" style={{ color: "rgba(253,251,247,0.6)" }}>
                                                        {new Date(order.created_at).toLocaleDateString("en-PK", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-3 font-medium" style={{ color: "#FDFBF7" }}>
                                                        {order.customer_name}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        {order.coupon_used || order.discount_code ? (
                                                            <span
                                                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                                                style={{
                                                                    backgroundColor: "rgba(212,175,55,0.15)",
                                                                    color: "#D4AF37",
                                                                }}
                                                            >
                                                                {order.coupon_used || order.discount_code}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: "rgba(253,251,247,0.3)" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td
                                                        className="px-6 py-3 font-bold"
                                                        style={{ color: "#D4AF37" }}
                                                    >
                                                        {formatPrice(
                                                            order.grand_total ?? order.total_amount ?? 0
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
