"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Package,
    Tag,
    LockKeyhole,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ADMIN_PASSWORD = "OrganicHarvest2026";
const SESSION_KEY = "admin_authenticated";

const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/discounts", label: "Discounts", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [authError, setAuthError] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const sessionAuth = sessionStorage.getItem(SESSION_KEY);
        if (sessionAuth === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem(SESSION_KEY, "true");
            setAuthError("");
        } else {
            setAuthError("Incorrect Admin Key");
        }
    };

    if (!mounted) return null;

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
                            Enter the secret key to access the admin dashboard.
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

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "#0B1C10" }}>
            {/* Sidebar */}
            <aside
                className="w-64 flex-shrink-0 flex flex-col py-8 px-4 border-r"
                style={{ backgroundColor: "#0B1C10", borderColor: "rgba(212,175,55,0.2)" }}
            >
                <div className="mb-8 px-2">
                    <h1
                        className="text-xl font-bold"
                        style={{ fontFamily: "'Playfair Display', serif", color: "#D4AF37" }}
                    >
                        Organic Harvest
                    </h1>
                    <p className="text-xs mt-1" style={{ color: "rgba(253,251,247,0.5)" }}>
                        Admin Dashboard
                    </p>
                </div>

                <nav className="flex flex-col gap-1">
                    {navLinks.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2"
                                style={{
                                    color: isActive ? "#D4AF37" : "rgba(253,251,247,0.7)",
                                    backgroundColor: isActive ? "rgba(212,175,55,0.1)" : "transparent",
                                    borderColor: isActive ? "#D4AF37" : "transparent",
                                }}
                            >
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto" style={{ backgroundColor: "#0B1C10" }}>
                {children}
            </main>
        </div>
    );
}
