"use client";

import Link from "next/link";
import { ShoppingBag, Menu, Search, User, Instagram, Facebook, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function Navbar() {
    const { getCartCount, setIsOpen } = useCartStore();
    // Provide a hydration-safe mounted state to avoid SSR mismatch on the absolute count badge
    const [mounted, setMounted] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
            <div className="container px-6 flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-heading text-2xl font-bold tracking-tight text-primary">
                            Organic Harvest
                        </span>
                    </Link>
                    <nav className="hidden gap-6 md:flex">
                        <Link
                            href="/category/natural-sweets"
                            className="flex items-center text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            Natural Sweets
                        </Link>
                        <Link
                            href="/category/cooking-essentials"
                            className="flex items-center text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            Cooking Essentials
                        </Link>
                        <Link
                            href="/about"
                            className="flex items-center text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            About
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Account</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="relative shrink-0"
                        onClick={() => setIsOpen(true)}
                    >
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        {mounted && getCartCount() > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {getCartCount()}
                            </span>
                        )}
                        <span className="sr-only">Cart</span>
                    </Button>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6 text-foreground" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#0B1C10]/95 backdrop-blur-md border-l-0 flex flex-col pt-12 [&>button]:hidden">
                            <SheetHeader className="text-left border-b border-white/10 pb-6 mb-2 flex flex-row items-center justify-between">
                                <SheetTitle className="font-heading text-3xl font-bold text-[#D4AF37]">
                                    Organic Harvest
                                </SheetTitle>
                                <SheetClose className="rounded-sm opacity-100 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-secondary">
                                    <X size={28} className="text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors" />
                                    <span className="sr-only">Close</span>
                                </SheetClose>
                            </SheetHeader>
                            <nav className="flex flex-col flex-1 mt-6 space-y-4 justify-center">
                                <Link
                                    href="/category/natural-sweets"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-3 border-b border-white/10 text-xl font-heading font-light tracking-wide text-white/90 hover:text-[#D4AF37] hover:border-l-2 hover:border-l-[#D4AF37] hover:pl-4 hover:bg-white/5 transition-all duration-300"
                                >
                                    Natural Sweets
                                </Link>
                                <Link
                                    href="/category/cooking-essentials"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-3 border-b border-white/10 text-xl font-heading font-light tracking-wide text-white/90 hover:text-[#D4AF37] hover:border-l-2 hover:border-l-[#D4AF37] hover:pl-4 hover:bg-white/5 transition-all duration-300"
                                >
                                    Cooking Essentials
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-3 border-b border-white/10 text-xl font-heading font-light tracking-wide text-white/90 hover:text-[#D4AF37] hover:border-l-2 hover:border-l-[#D4AF37] hover:pl-4 hover:bg-white/5 transition-all duration-300"
                                >
                                    Our Story
                                </Link>
                                <Link
                                    href="/contact"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-3 border-b border-white/10 text-xl font-heading font-light tracking-wide text-white/90 hover:text-[#D4AF37] hover:border-l-2 hover:border-l-[#D4AF37] hover:pl-4 hover:bg-white/5 transition-all duration-300"
                                >
                                    Contact Support
                                </Link>
                            </nav>

                            {/* Social Media Footer inside Menu */}
                            <div className="mt-auto pb-8 pt-6 flex items-center justify-center gap-6">
                                <a href="#" className="p-3 bg-white/5 rounded-full text-white/80 hover:bg-[#D4AF37] hover:text-[#0B1C10] transition-colors duration-300">
                                    <Instagram className="h-6 w-6" />
                                </a>
                                <a href="#" className="p-3 bg-white/5 rounded-full text-white/80 hover:bg-[#D4AF37] hover:text-[#0B1C10] transition-colors duration-300">
                                    <Facebook className="h-6 w-6" />
                                </a>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
