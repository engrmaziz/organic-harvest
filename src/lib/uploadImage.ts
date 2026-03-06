import { supabase } from "@/lib/supabase";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export async function uploadImage(file: File): Promise<string> {
    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    const fileExt = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : null;

    if (!fileExt) {
        throw new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
    }

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uniqueName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(uniqueName);

    if (!data?.publicUrl) {
        throw new Error("Failed to retrieve public URL for uploaded image.");
    }

    return data.publicUrl;
}
