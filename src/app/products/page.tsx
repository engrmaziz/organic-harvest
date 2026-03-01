import { supabase } from "@/lib/supabase";
import CategoryClient from "@/components/CategoryClient";

export const revalidate = 60; // Revalidate the product catalog every 60 seconds

export const metadata = {
    title: "Complete Catalog | Organic Harvest Pakistan",
    description: "Shop our entire premium selection of 100% organic, pure, and naturally sourced products delivered across Pakistan.",
};

export default async function ProductsPage() {
    // Fetch all active products directly from Supabase on the server
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("is_hot_selling", { ascending: false })
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* 
              We reuse the gorgeous CategoryClient grid UI, 
              feeding it the entire catalog data payload.
            */}
            <CategoryClient
                products={products || []}
                title="Our Complete Catalog"
            />
        </div>
    );
}
