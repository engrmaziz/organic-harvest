"use client";

import { useState, useMemo } from "react";

import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

// Utility to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    }).format(price).replace("PKR", "Rs.");
};

// Utility to handle broken image URLs from DB
const getImageUrl = (url?: string) => {
    if (!url) return "https://placehold.co/800x800/FDFBF7/B8860B.png?text=Organic+Product";
    if (url.startsWith("/")) return url;
    if (!url.startsWith("http")) return "https://placehold.co/800x800/FDFBF7/B8860B.png?text=Organic+Product";
    return url;
};

export default function CategoryClient({ products, title }: { products: any[], title: string }) {
    const { addItem } = useCartStore();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState("default");

    const filteredAndSortedProducts = useMemo(() => {
        if (!products) return [];
        let result = [...products];

        if (selectedCategory !== "All") {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (sortOrder === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, selectedCategory, sortOrder]);

    return (
        <div className="container mx-auto px-4 py-20 md:py-24 max-w-7xl">
            <div className="flex flex-col items-center text-center space-y-6 mb-20">
                <Badge variant="outline" className="text-primary border-primary bg-background/10 backdrop-blur-md px-4 py-1 text-sm rounded-full uppercase tracking-widest">
                    Organic Collection
                </Badge>
                <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground capitalize tracking-tight">
                    {title}
                </h1>
                <div className="w-24 h-1.5 bg-primary rounded-full mt-2" />
                <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
                    Discover our premium selection of {title.toLowerCase()}, sourced directly from nature for your well-being.
                </p>
            </div>

            {!products || products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-muted-foreground mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-muted-foreground/50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 13h6m-3-3v6m-9-1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-foreground">No products found</h3>
                    <p className="mt-1 text-muted-foreground">
                        We are currently restocking our {title.toLowerCase()}. Check back soon!
                    </p>
                </div>
            ) : (
                <>
                    {/* Luxury Minimalist Filters & Sorting */}
                    <div className="flex flex-col sm:flex-row justify-end items-end sm:items-baseline gap-8 mb-16 px-2">
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <span className="text-xs text-muted-foreground/80 uppercase tracking-[0.2em]">Category</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full sm:w-auto appearance-none bg-transparent border-0 border-b border-border/80 text-[#0B1C10] font-heading text-lg pb-1.5 pr-8 focus:outline-none focus:ring-0 hover:border-primary/50 transition-all cursor-pointer rounded-none"
                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230B1C10' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '1em' }}
                            >
                                <option value="All">All Products</option>
                                <option value="natural-sweets">Natural Sweets</option>
                                <option value="cooking-essentials">Cooking Essentials</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <span className="text-xs text-muted-foreground/80 uppercase tracking-[0.2em]">Sort By</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full sm:w-auto appearance-none bg-transparent border-0 border-b border-border/80 text-[#0B1C10] font-heading text-lg pb-1.5 pr-8 focus:outline-none focus:ring-0 hover:border-primary/50 transition-all cursor-pointer rounded-none"
                                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230B1C10' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '1em' }}
                            >
                                <option value="default">Featured</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {filteredAndSortedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-border/50 shadow-sm">
                            <h3 className="text-2xl font-heading font-bold text-foreground">No matches found</h3>
                            <p className="mt-2 text-muted-foreground text-lg">Try adjusting your filters to discover what you're looking for.</p>
                            <Button variant="outline" size="lg" className="mt-8 border-primary text-primary hover:bg-primary hover:text-white transition-colors" onClick={() => { setSelectedCategory("All"); setSortOrder("default"); }}>
                                Clear All Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredAndSortedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => router.push(`/product/${product.slug}`)}
                                    className="group group/card cursor-pointer flex flex-col bg-card rounded-2xl hover:shadow-2xl transition-all duration-300 border border-border/50 overflow-hidden"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-[#FDFBF7]">
                                        {product.is_hot_selling && (
                                            <Badge className="absolute top-4 left-4 z-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 py-1 uppercase tracking-widest text-[10px] shadow-sm">
                                                Best Seller
                                            </Badge>
                                        )}
                                        <ImageWithSkeleton
                                            src={getImageUrl(product.image_url)}
                                            alt={product.name}
                                            containerClassName="absolute inset-0 h-full w-full"
                                            className="group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3 p-6 flex-grow bg-white">
                                        <div className="flex flex-col flex-grow">
                                            <h3 className="font-heading font-bold text-xl text-foreground group-hover/card:text-primary transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>
                                            {product.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-border/50 mt-auto flex flex-col gap-4">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-bold text-2xl text-primary">
                                                    {formatPrice(product.price)}
                                                </span>
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    {product.weight || "1 Unit"}
                                                </span>
                                            </div>
                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    addItem({
                                                        id: product.id,
                                                        name: product.name,
                                                        price: product.price,
                                                        weight: product.weight,
                                                        image_url: product.image_url,
                                                    });
                                                }}
                                                className="w-full h-12 rounded-xl bg-foreground hover:bg-primary text-background font-semibold transition-colors duration-300 shadow-md group-hover:shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag className="h-5 w-5" />
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
