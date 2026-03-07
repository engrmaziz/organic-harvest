"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/[\s]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export interface ProductData {
    name: string;
    price: number;
    weight: string;
    description: string;
    category: string;
    tags: string;
    stock_quantity: number;
}

const ALLOWED_CATEGORIES = ["Natural Sweets", "Cooking Essentials"];

export async function addProduct(
    data: ProductData,
    imageUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Server-side validation
        if (!data.name || data.name.trim().length < 2) {
            return { success: false, error: "Name must be at least 2 characters." };
        }
        if (data.name.trim().length > 200) {
            return { success: false, error: "Name must be at most 200 characters." };
        }
        if (!Number.isFinite(data.price) || data.price <= 0) {
            return { success: false, error: "Price must be a positive number." };
        }
        if (!Number.isFinite(data.stock_quantity) || data.stock_quantity < 0 || !Number.isInteger(data.stock_quantity)) {
            return { success: false, error: "Stock quantity must be a non-negative integer." };
        }
        if (!data.weight || data.weight.trim().length === 0) {
            return { success: false, error: "Weight is required." };
        }
        if (!data.description || data.description.trim().length < 10) {
            return { success: false, error: "Description must be at least 10 characters." };
        }
        if (!ALLOWED_CATEGORIES.includes(data.category)) {
            return { success: false, error: "Invalid category." };
        }
        if (!imageUrl || !imageUrl.startsWith("https://")) {
            return { success: false, error: "A valid image URL is required." };
        }

        const trimmedName = data.name.trim();
        const { error } = await supabase.from("products").insert([
            {
                name: trimmedName,
                slug: generateSlug(trimmedName),
                price: data.price,
                weight: data.weight.trim(),
                description: data.description.trim(),
                category: data.category,
                image_url: imageUrl,
                tags: data.tags,
                stock_quantity: data.stock_quantity,
            },
        ]);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function deleteProduct(
    id: string,
    imageUrl?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate UUID format to prevent injection
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!id || !uuidRegex.test(id)) {
            return { success: false, error: "Invalid product ID." };
        }

        // Delete image from Supabase storage if a URL was provided
        if (imageUrl) {
            try {
                const marker = "/product-images/";
                const markerIndex = imageUrl.indexOf(marker);
                if (markerIndex !== -1) {
                    const filePath = imageUrl.slice(markerIndex + marker.length);
                    await supabase.storage.from("product-images").remove([filePath]);
                }
            } catch {
                // Non-fatal: proceed with DB deletion even if image removal fails
            }
        }

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
