import { supabase } from "@/lib/supabase";
import CategoryClient from "@/components/CategoryClient";

export const revalidate = 60; // Revalidate dynamic page every 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const title = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
        title: `${title} | Organic Harvest Pakistan`,
        description: `Shop our premium ${title.toLowerCase()}. 100% organic, pure, and naturally sourced products delivered across Pakistan.`,
    };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const title = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Fetch products for this category right on the server
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("category", slug)
        .order("created_at", { ascending: false });

    // Pass the fetched dat down to our custom client UI wrapper
    return (
        <CategoryClient products={products || []} title={title} />
    );
}
