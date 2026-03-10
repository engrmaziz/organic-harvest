"use server";

import { createClient } from "@supabase/supabase-js";

function createSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error("Missing Supabase environment variables.");
    }
    return createClient(url, key);
}

export async function saveDraftOrder(
    email: string,
    items: { product_id: string; name: string; quantity: number; price: number }[],
    subtotal: number,
    existingDraftId?: string | null
): Promise<{ id: string | null; error?: string }> {
    try {
        const supabase = createSupabaseClient();

        if (existingDraftId) {
            const { data, error } = await supabase
                .from("orders")
                .update({ customer_email: email, items, total_amount: subtotal })
                .eq("id", existingDraftId)
                .eq("status", "Draft")
                .select("id");

            if (error) throw error;

            // If the draft was already consumed by the cron job, fall through and create a new one
            if (data && data.length > 0) {
                return { id: existingDraftId };
            }
        }

        const { data, error } = await supabase
            .from("orders")
            .insert([{ customer_email: email, status: "Draft", total_amount: subtotal, items }])
            .select("id")
            .single();

        if (error) throw error;
        return { id: data.id };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save draft order.";
        console.error("💾 saveDraftOrder error:", message);
        return { id: null, error: message };
    }
}
