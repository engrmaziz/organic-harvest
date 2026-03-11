"use server";

import { supabase } from "@/lib/supabase";

export interface UpsellProduct {
    id: string;
    name: string;
    price: number;
    weight: string;
    image_url: string;
    discountedPrice: number;
}

export async function getSmartUpsell(
    currentCartProductIds: string[]
): Promise<UpsellProduct | null> {
    try {
        let query = supabase
            .from("products")
            .select("id, name, price, weight, image_url")
            .order("price", { ascending: false })
            .limit(1);

        if (currentCartProductIds.length > 0) {
            query = query.not("id", "in", `(${currentCartProductIds.join(",")})`);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            return null;
        }

        const product = data[0];
        const discountedPrice = Math.round(product.price * 0.85 * 100) / 100;

        return {
            id: product.id,
            name: product.name,
            price: product.price,
            weight: product.weight ?? "",
            image_url: product.image_url ?? "",
            discountedPrice,
        };
    } catch {
        return null;
    }
}
