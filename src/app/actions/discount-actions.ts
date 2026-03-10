"use server";

import { supabase } from "@/lib/supabase";

export interface CouponResult {
    success: boolean;
    error?: string;
    data?: {
        discount_type: "percentage" | "fixed";
        discount_value: number;
        code: string;
    };
}

export async function validateCoupon(code: string): Promise<CouponResult> {
    try {
        if (!code || code.trim().length === 0) {
            return { success: false, error: "Please enter a coupon code." };
        }

        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code.trim().toUpperCase())
            .single();

        if (error || !data) {
            return { success: false, error: "Coupon expired or invalid." };
        }

        if (!data.is_active) {
            return { success: false, error: "Coupon expired or invalid." };
        }

        if (data.max_uses !== null && data.used_count >= data.max_uses) {
            return { success: false, error: "This coupon has already been redeemed." };
        }

        return {
            success: true,
            data: {
                discount_type: data.discount_type,
                discount_value: data.discount_value,
                code: data.code,
            },
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function burnCoupon(code: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!code || code.trim().length === 0) {
            return { success: false, error: "Coupon code is required." };
        }

        const { data, error: fetchError } = await supabase
            .from("coupons")
            .select("used_count")
            .eq("code", code.trim().toUpperCase())
            .single();

        if (fetchError || !data) {
            return { success: false, error: "Coupon not found." };
        }

        const { error: updateError } = await supabase
            .from("coupons")
            .update({ used_count: data.used_count + 1 })
            .eq("code", code.trim().toUpperCase());

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function createCoupon(payload: {
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    max_uses: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        if (!payload.code || payload.code.trim().length === 0) {
            return { success: false, error: "Coupon code is required." };
        }
        if (!["percentage", "fixed"].includes(payload.discount_type)) {
            return { success: false, error: "Invalid discount type." };
        }
        if (!Number.isFinite(payload.discount_value) || payload.discount_value <= 0) {
            return { success: false, error: "Discount value must be a positive number." };
        }
        if (!Number.isInteger(payload.max_uses) || payload.max_uses <= 0) {
            return { success: false, error: "Max uses must be a positive integer." };
        }

        const { error } = await supabase.from("coupons").insert([
            {
                code: payload.code.trim().toUpperCase(),
                discount_type: payload.discount_type,
                discount_value: payload.discount_value,
                max_uses: payload.max_uses,
            },
        ]);

        if (error) {
            if (error.code === "23505") {
                return { success: false, error: "A coupon with this code already exists." };
            }
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function toggleCouponStatus(
    id: string,
    is_active: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!id || !uuidRegex.test(id)) {
            return { success: false, error: "Invalid coupon ID." };
        }

        const { error } = await supabase
            .from("coupons")
            .update({ is_active })
            .eq("id", id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
