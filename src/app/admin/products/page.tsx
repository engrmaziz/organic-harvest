"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { deleteProduct } from "@/app/actions/product-actions";
import AddProductForm from "@/components/admin/AddProductForm";
import { Package, PackagePlus, Trash2, Loader2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    weight?: string;
    description?: string;
    category?: string;
    tags?: string;
    image_url?: string;
    created_at?: string;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    })
        .format(price)
        .replace("PKR", "Rs.");

function DeleteButton({ id, name, onDeleted }: { id: string; name: string; onDeleted: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"? This action cannot be undone.`
        );
        if (!confirmed) return;
        setIsDeleting(true);
        const result = await deleteProduct(id);
        if (!result.success) {
            alert(`Failed to delete: ${result.error}`);
        } else {
            onDeleted();
        }
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold border transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
                backgroundColor: "rgba(185,28,28,0.2)",
                color: "#f87171",
                borderColor: "rgba(185,28,28,0.3)",
            }}
        >
            {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Trash2 className="h-3.5 w-3.5" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error) setProducts(data || []);
        setLoading(false);
    };

    return (
        <div className="p-8" style={{ color: "#FDFBF7" }}>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1
                        className="text-3xl font-bold flex items-center gap-3"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                    >
                        <Package className="h-7 w-7" style={{ color: "#D4AF37" }} />
                        Product Management
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "rgba(253,251,247,0.6)" }}>
                        Add new products and manage your existing catalog
                    </p>
                </div>
                <div
                    className="rounded-full px-4 py-2 text-sm font-semibold"
                    style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" }}
                >
                    {products.length} Products
                </div>
            </div>

            {/* Add Product Form */}
            <div className="mb-10">
                <AddProductForm />
            </div>

            {/* Products Grid */}
            <div className="mb-5 flex items-center gap-2">
                <PackagePlus className="h-5 w-5" style={{ color: "#D4AF37" }} />
                <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                >
                    Current Catalog
                </h2>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin" style={{ color: "#D4AF37" }} />
                </div>
            ) : products.length === 0 ? (
                <div
                    className="rounded-2xl border py-20 text-center text-sm"
                    style={{ borderColor: "rgba(212,175,55,0.2)", color: "rgba(253,251,247,0.4)" }}
                >
                    No products found. Add your first product above.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="flex flex-col overflow-hidden rounded-2xl border"
                            style={{
                                borderColor: "rgba(212,175,55,0.2)",
                                backgroundColor: "rgba(11,28,16,0.8)",
                            }}
                        >
                            <div className="relative h-48 w-full overflow-hidden bg-black/20">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <PackagePlus
                                            className="h-12 w-12 opacity-30"
                                            style={{ color: "#D4AF37" }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col gap-1 p-4">
                                <p
                                    className="text-xs font-semibold uppercase tracking-widest"
                                    style={{ color: "#D4AF37", opacity: 0.7 }}
                                >
                                    {product.category}
                                </p>
                                <h3
                                    className="line-clamp-2 font-bold leading-snug"
                                    style={{
                                        color: "#FDFBF7",
                                        fontFamily: "'Playfair Display', serif",
                                    }}
                                >
                                    {product.name}
                                </h3>
                                <p className="mt-1 text-sm font-semibold" style={{ color: "#D4AF37" }}>
                                    {formatPrice(product.price)}
                                </p>
                                {product.weight && (
                                    <p className="text-xs" style={{ color: "rgba(253,251,247,0.5)" }}>
                                        {product.weight}
                                    </p>
                                )}
                                {product.tags && (
                                    <p className="text-xs mt-1" style={{ color: "rgba(253,251,247,0.4)" }}>
                                        {product.tags}
                                    </p>
                                )}
                            </div>

                            <div
                                className="border-t p-3"
                                style={{ borderColor: "rgba(212,175,55,0.1)" }}
                            >
                                <DeleteButton
                                    id={product.id}
                                    name={product.name}
                                    onDeleted={fetchProducts}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
