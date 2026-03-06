"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { deleteProduct } from "@/app/actions/product-actions";
import AddProductForm from "@/components/admin/AddProductForm";

interface Product {
    id: string;
    name: string;
    price: number;
    weight?: string;
    description?: string;
    category?: string;
    image_url?: string;
    created_at?: string;
}
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockKeyhole, PackagePlus, Trash2, Loader2, LayoutGrid } from "lucide-react";

// ─── Delete Button Client Component ─────────────────────────────────────────

function DeleteButton({ id, name }: { id: string; name: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
        if (!confirmed) return;

        setIsDeleting(true);
        const result = await deleteProduct(id);
        if (!result.success) {
            alert(`Failed to delete: ${result.error}`);
        }
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-md bg-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-300 border border-red-700/40 hover:bg-red-800/50 transition disabled:cursor-not-allowed disabled:opacity-60"
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

// ─── Utility ─────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
    })
        .format(price)
        .replace("PKR", "Rs.");

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [authError, setAuthError] = useState("");

    useEffect(() => {
        const sessionAuth = sessionStorage.getItem("admin_authenticated");
        if (sessionAuth === "true") {
            setIsAuthenticated(true);
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === "OrganicHarvest2026") {
            setIsAuthenticated(true);
            sessionStorage.setItem("admin_authenticated", "true");
            setAuthError("");
            fetchProducts();
        } else {
            setAuthError("Incorrect Admin Key");
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching products:", error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    // ── Lock screen ────────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="container px-4 py-20 mx-auto min-h-[80vh] flex items-center justify-center">
                <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
                            <LockKeyhole className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-heading font-bold">Admin Portal</CardTitle>
                        <CardDescription className="text-base">
                            Enter the secret key to manage products.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Secret Admin Key"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="h-12 text-center text-lg tracking-widest"
                                    autoFocus
                                />
                                {authError && (
                                    <p className="text-red-500 text-sm font-medium text-center mt-1">
                                        {authError}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full h-12 text-lg font-bold">
                                Unlock Dashboard
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        );
    }

    // ── Dashboard ──────────────────────────────────────────────────────────────
    return (
        <div
            className="min-h-screen px-4 py-12"
            style={{ backgroundColor: "#0B1C10" }}
        >
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1
                            className="flex items-center gap-3 text-4xl font-bold"
                            style={{ fontFamily: "'Playfair Display', serif", color: "#FDFBF7" }}
                        >
                            <LayoutGrid className="h-8 w-8" style={{ color: "#D4AF37" }} />
                            Product Management
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#FDFBF7", opacity: 0.6 }}>
                            Add new products and manage your existing catalog.
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
                <div className="mb-12">
                    <AddProductForm />
                </div>

                {/* Products Grid */}
                <div className="mb-6 flex items-center gap-2">
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
                        <Loader2
                            className="h-12 w-12 animate-spin"
                            style={{ color: "#D4AF37" }}
                        />
                    </div>
                ) : products.length === 0 ? (
                    <div
                        className="rounded-2xl border py-20 text-center text-sm"
                        style={{
                            borderColor: "rgba(212,175,55,0.2)",
                            color: "rgba(253,251,247,0.5)",
                        }}
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
                                {/* Image */}
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

                                {/* Details */}
                                <div className="flex flex-1 flex-col gap-1 p-4">
                                    <p
                                        className="text-xs font-semibold uppercase tracking-widest"
                                        style={{ color: "#D4AF37", opacity: 0.7 }}
                                    >
                                        {product.category}
                                    </p>
                                    <h3
                                        className="line-clamp-2 font-bold leading-snug"
                                        style={{ color: "#FDFBF7", fontFamily: "'Playfair Display', serif" }}
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
                                </div>

                                {/* Delete */}
                                <div
                                    className="border-t p-3"
                                    style={{ borderColor: "rgba(212,175,55,0.1)" }}
                                >
                                    <DeleteButton id={product.id} name={product.name} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
