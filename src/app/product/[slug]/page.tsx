import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, ShieldCheck, Leaf, MessageCircle } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";

export const revalidate = 60; // Revalidate dynamic page every 60 seconds

// Utility to handle broken image URLs from DB
const getImageUrl = (url?: string) => {
    if (!url) return "https://placehold.co/800x800/FDFBF7/B8860B.png?text=Organic+Product";
    if (url.startsWith("/")) return url;
    if (!url.startsWith("http")) return "https://placehold.co/800x800/FDFBF7/B8860B.png?text=Organic+Product";
    return url;
};

// Next.js Dynamic Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!product) return { title: "Product Not Found | Organic Harvest" };

    return {
        title: `${product.name} - ${product.weight || 'Premium Organic'} | Organic Harvest`,
        description: product.description || `Buy 100% pure organic ${product.name} in Pakistan.`,
        openGraph: {
            images: [getImageUrl(product.image_url)],
        },
    };
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !product) {
        notFound();
    }

    const priceFormatted = new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(product.price).replace("PKR", "Rs.");

    // Google Detailed Product JSON-LD Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: getImageUrl(product.image_url),
        description: product.description || `Premium Quality Organic ${product.name}`,
        brand: {
            "@type": "Brand",
            name: "Organic Harvest"
        },
        offers: {
            "@type": "Offer",
            url: `https://organicharvest.pk/product/${product.slug}`,
            priceCurrency: "PKR",
            price: product.price,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition"
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
            {/* Inject Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Product Image Gallery */}
                <div className="flex flex-col gap-4">
                    <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-secondary/20 shadow-xl border border-border/50">
                        {product.is_hot_selling && (
                            <Badge className="absolute top-6 left-6 z-20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-1.5 uppercase tracking-widest text-xs shadow-md">
                                Best Seller
                            </Badge>
                        )}
                        <ImageWithSkeleton
                            src={getImageUrl(product.image_url)}
                            alt={product.name}
                            containerClassName="absolute inset-0 h-full w-full z-10"
                            className="hover:scale-105 rounded-3xl"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col py-4 lg:py-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-semibold text-primary/80 uppercase tracking-wider">
                            <Leaf className="w-5 h-5 text-primary" />
                            <span>100% Organic & Pure</span>
                        </div>
                        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
                            {product.name}
                        </h1>
                        <div className="flex items-end gap-4 mt-4">
                            <span className="text-3xl font-bold text-primary">{priceFormatted}</span>
                            <span className="text-lg text-muted-foreground font-medium mb-1">
                                {product.weight || "Standard Format"}
                            </span>
                        </div>
                    </div>

                    <div className="prose prose-p:text-muted-foreground prose-p:leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    {/* Extracted Client Component for Zustand State */}
                    <div className="flex flex-col gap-3">
                        <AddToCartButton product={product} />

                        <a
                            href={`https://wa.me/923147514874?text=${encodeURIComponent(`Hi Organic Harvest! I'm interested in the ${product.name}. Can you provide more details about delivery/purity?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-12 rounded-xl border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-semibold transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group"
                        >
                            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            Ask about this on WhatsApp
                        </a>
                    </div>

                    <div className="mt-8 pt-8 border-t border-border/50 text-muted-foreground/90 leading-relaxed font-light text-base md:text-lg">
                        {product.long_description || "Premium organic quality, harvested for your well-being. Sourced ethically to ensure you receive only the purest essence of nature's bounty."}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-border/50 mt-8">
                        <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl border border-border/50">
                            <Truck className="w-8 h-8 text-primary/80" />
                            <div>
                                <p className="font-semibold text-sm">Nationwide Delivery</p>
                                <p className="text-xs text-muted-foreground">Cash on Delivery available</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-2xl border border-border/50">
                            <ShieldCheck className="w-8 h-8 text-primary/80" />
                            <div>
                                <p className="font-semibold text-sm">Premium Quality</p>
                                <p className="text-xs text-muted-foreground">Satisfaction guaranteed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
