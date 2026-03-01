"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { ShieldCheck, Truck, Leaf, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";

// Utility to format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(price).replace("PKR", "Rs.");
};

// Utility to handle broken image URLs from DB or local paths
const getImageUrl = (url?: string) => {
  if (!url) return "https://placehold.co/800x800/FDFBF7/B8860B.png?text=Organic+Product";
  if (url.startsWith("/")) return url;
  if (!url.startsWith("http")) return "https://placehold.co/800x800/FDFBF7/B8860B.png?text=Organic+Product";
  return url;
};

const CATEGORIES = [
  {
    title: "Natural Sweets",
    description: "Pure Honey & Premium Dates",
    image: "/images/pure-sidr-honey.jpg",
    href: "/category/natural-sweets",
  },
  {
    title: "Cooking Essentials",
    description: "Desi Ghee & Canola Oil",
    image: "/images/desi-ghee-cooking-oil.jpg",
    href: "/category/cooking-essentials",
  },
];

export default function Home() {
  const [hotProducts, setHotProducts] = useState<any[]>([]);
  const { addItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    async function fetchHotProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_hot_selling", true)
        .limit(4);

      console.log("HOME Supabase fetch:", { data, error, url: process.env.NEXT_PUBLIC_SUPABASE_URL });

      if (!error && data) {
        setHotProducts(data);
      }
    }
    fetchHotProducts();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[100dvh] overflow-hidden">
        {/* Local static background image */}
        <div className="absolute inset-0 z-0 bg-[#2E472D]">
          <Image
            src="/images/hero-organic-harvest.jpg"
            alt="Organic Farm & Honey"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 text-primary border-primary bg-background/10 backdrop-blur-md font-medium px-4 py-1 text-sm rounded-full uppercase tracking-widest">
            100% Organic & Pure
          </Badge>
          <h1 className="mb-4 font-heading text-6xl md:text-8xl font-bold tracking-tight text-white drop-shadow-xl leading-tight">
            Nature's Purity, <br className="hidden md:block" /> Delivered.
          </h1>
          <p className="mb-8 text-lg md:text-2xl font-medium text-white/90 max-w-2xl drop-shadow-md">
            Experience the finest essence of farm-to-table goodness. Premium honey, dates, ghee, and oils crafted for your well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/products" className="w-full sm:w-auto relative z-10">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10 font-semibold shadow-2xl rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground border border-primary transition-all duration-300 hover:scale-105">
                Shop Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg h-14 px-10 font-semibold bg-transparent text-white border-white/80 hover:bg-white hover:text-black rounded-sm transition-all duration-300 hover:scale-105">
              Our Story
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {[
            { icon: Leaf, title: "100% Organic", desc: "No additives or preservatives" },
            { icon: Truck, title: "Fast Delivery", desc: "Across all major cities in Pakistan" },
            { icon: ShieldCheck, title: "Quality Assured", desc: "Lab tested for absolute purity" },
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-xl bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <item.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-24 bg-[#FAF9F6] w-full">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <h2 className="font-heading text-5xl font-bold text-foreground">Shop by Category</h2>
            <div className="w-24 h-1.5 bg-primary rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {CATEGORIES.map((cat, i) => (
              <Link href={cat.href} key={i} className="group overflow-hidden rounded-2xl relative shadow-2xl block hover:shadow-3xl transition-shadow duration-500 aspect-[4/5] md:aspect-[3/4] bg-[#FAF9F6]">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500 z-20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-30">
                  <h3 className="font-heading text-4xl font-bold text-white mb-4 drop-shadow-lg">{cat.title}</h3>
                  <p className="text-white/90 text-lg mb-8 max-w-sm drop-shadow-md">{cat.description}</p>
                  <div className="px-8 py-3 bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-sm transition-all duration-300 font-semibold tracking-wide uppercase text-sm">
                    View Collection
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Selling Products */}
      <section className="py-24 container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <h2 className="font-heading text-5xl font-bold text-foreground">Curated Picks</h2>
          <div className="w-24 h-1.5 bg-primary rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {!hotProducts || hotProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground text-lg">
              Our curated picks will appear here soon.
            </div>
          ) : (
            hotProducts.map((product) => (
              <div key={product.id} onClick={() => router.push(`/product/${product.slug}`)} className="group group/card cursor-pointer flex flex-col bg-card rounded-2xl hover:shadow-2xl transition-all duration-300 border border-border/50 overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#FDFBF7]">
                  <Badge className="absolute top-4 left-4 z-20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 py-1 uppercase tracking-widest text-[10px] shadow-sm">
                    Best Seller
                  </Badge>
                  <ImageWithSkeleton
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    containerClassName="absolute inset-0 h-full w-full z-10"
                    className="group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-col gap-3 p-6 flex-grow bg-white">
                  <div className="flex flex-col flex-grow">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">
                      {product.category.replace("-", " ")}
                    </span>
                    <h3 className="font-heading font-bold text-xl text-foreground group-hover/card:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
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
            ))
          )}
        </div>

        <div className="mt-20 flex justify-center">
          <Link href="/products">
            <Button variant="outline" size="lg" className="rounded-sm px-12 h-14 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg uppercase tracking-wider font-semibold transition-all duration-300">
              View Complete Catalog
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
