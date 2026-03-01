import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-background">
            <div className="container px-6 py-12 md:py-16 text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-heading text-xl font-bold text-primary">Organic Harvest</h3>
                        <p className="text-sm text-foreground/70 mx-auto md:mx-0 max-w-sm">
                            Premium, organic pantry products from farm to table. Pure Honey, Dates, Desi Ghee, and Canola Oil.
                        </p>
                        <div className="flex space-x-4 justify-center md:justify-start">
                            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-foreground/60 hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li><Link href="/category/natural-sweets" className="hover:text-primary transition-colors">Natural Sweets</Link></li>
                            <li><Link href="/category/cooking-essentials" className="hover:text-primary transition-colors">Cooking Essentials</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-border text-center text-sm text-foreground/60">
                    <p>© {new Date().getFullYear()} Organic Harvest. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
