"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { createCoupon, toggleCouponStatus } from "@/app/actions/discount-actions";
import { Tag, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

const couponSchema = z.object({
    code: z.string().min(1, "Code is required.").max(50, "Code too long."),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z
        .string()
        .min(1, "Value is required.")
        .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
            message: "Must be a positive number.",
        }),
    max_uses: z
        .string()
        .min(1, "Max uses is required.")
        .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
            message: "Must be a positive integer.",
        }),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    max_uses: number;
    used_count: number;
    is_active: boolean;
    created_at: string;
}

const inputClass =
    "w-full rounded-md border border-[#D4AF37]/30 bg-[#0B1C10] px-3 py-2 text-[#FDFBF7] placeholder-[#FDFBF7]/40 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition text-sm";
const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-1";
const errorClass = "mt-1 text-xs text-red-400";

export default function DiscountsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: { discount_type: "percentage" },
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error) setCoupons(data || []);
        setLoading(false);
    };

    const onSubmit = async (values: CouponFormValues) => {
        setServerError(null);
        setSuccessMessage(null);
        const result = await createCoupon({
            code: values.code,
            discount_type: values.discount_type,
            discount_value: Number(values.discount_value),
            max_uses: Number(values.max_uses),
        });
        if (!result.success) {
            setServerError(result.error ?? "Failed to create coupon.");
            return;
        }
        setSuccessMessage(`Coupon "${values.code.toUpperCase()}" created successfully!`);
        reset();
        fetchCoupons();
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        await toggleCouponStatus(id, !currentStatus);
        setCoupons((prev) =>
            prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
        );
        setTogglingId(null);
    };

    return (
        <div className="p-8" style={{ color: "#FDFBF7" }}>
            <div className="mb-8">
                <h1
                    className="text-3xl font-bold flex items-center gap-3"
                    style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                >
                    <Tag className="h-7 w-7" style={{ color: "#D4AF37" }} />
                    Discount Engine
                </h1>
                <p className="mt-1 text-sm" style={{ color: "rgba(253,251,247,0.6)" }}>
                    Create and manage coupon codes
                </p>
            </div>

            {/* Create Coupon Form */}
            <div
                className="rounded-2xl border p-6 mb-8"
                style={{ borderColor: "rgba(212,175,55,0.2)", backgroundColor: "rgba(212,175,55,0.03)" }}
            >
                <h2
                    className="text-lg font-semibold mb-4"
                    style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                >
                    Generate New Coupon
                </h2>

                {successMessage && (
                    <div className="mb-4 rounded-md border border-green-500/40 bg-green-900/30 px-4 py-3 text-sm text-green-300">
                        {successMessage}
                    </div>
                )}
                {serverError && (
                    <div className="mb-4 rounded-md border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-300">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Coupon Code</label>
                            <input
                                {...register("code")}
                                placeholder="e.g., SUMMER20"
                                className={inputClass}
                                style={{ textTransform: "uppercase" }}
                            />
                            {errors.code && <p className={errorClass}>{errors.code.message}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Discount Type</label>
                            <select {...register("discount_type")} className={inputClass}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (PKR)</option>
                            </select>
                            {errors.discount_type && (
                                <p className={errorClass}>{errors.discount_type.message}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Discount Value</label>
                            <input
                                {...register("discount_value")}
                                type="number"
                                step="0.01"
                                placeholder="e.g., 10 or 200"
                                className={inputClass}
                            />
                            {errors.discount_value && (
                                <p className={errorClass}>{errors.discount_value.message}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Max Uses</label>
                            <input
                                {...register("max_uses")}
                                type="number"
                                placeholder="e.g., 100"
                                className={inputClass}
                            />
                            {errors.max_uses && (
                                <p className={errorClass}>{errors.max_uses.message}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-bold transition disabled:opacity-60"
                        style={{ backgroundColor: "#D4AF37", color: "#0B1C10" }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Tag className="h-4 w-4" />
                                Create Coupon
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Coupons Table */}
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
                        All Coupons
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#D4AF37" }} />
                    </div>
                ) : coupons.length === 0 ? (
                    <div
                        className="py-16 text-center"
                        style={{ color: "rgba(253,251,247,0.4)" }}
                    >
                        No coupons yet. Create your first coupon above.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
                                    {["Code", "Type", "Value", "Uses", "Status", "Kill Switch"].map((h) => (
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
                                {coupons.map((coupon) => (
                                    <tr
                                        key={coupon.id}
                                        style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}
                                    >
                                        <td className="px-6 py-3 font-mono font-bold" style={{ color: "#D4AF37" }}>
                                            {coupon.code}
                                        </td>
                                        <td className="px-6 py-3" style={{ color: "rgba(253,251,247,0.7)" }}>
                                            {coupon.discount_type === "percentage" ? "Percentage" : "Fixed"}
                                        </td>
                                        <td className="px-6 py-3 font-semibold" style={{ color: "#FDFBF7" }}>
                                            {coupon.discount_type === "percentage"
                                                ? `${coupon.discount_value}%`
                                                : `Rs. ${coupon.discount_value}`}
                                        </td>
                                        <td className="px-6 py-3" style={{ color: "rgba(253,251,247,0.7)" }}>
                                            {coupon.used_count} / {coupon.max_uses}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span
                                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: coupon.is_active
                                                        ? "rgba(34,197,94,0.15)"
                                                        : "rgba(239,68,68,0.15)",
                                                    color: coupon.is_active ? "#4ade80" : "#f87171",
                                                }}
                                            >
                                                {coupon.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => handleToggle(coupon.id, coupon.is_active)}
                                                disabled={togglingId === coupon.id}
                                                className="flex items-center gap-1.5 text-xs font-semibold transition disabled:opacity-50"
                                                style={{ color: coupon.is_active ? "#f87171" : "#4ade80" }}
                                                title={coupon.is_active ? "Deactivate" : "Activate"}
                                            >
                                                {togglingId === coupon.id ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : coupon.is_active ? (
                                                    <>
                                                        <ToggleRight className="h-5 w-5" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="h-5 w-5" />
                                                        Activate
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
