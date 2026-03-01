import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
                <Badge variant="outline" className="text-primary border-primary">Our Story</Badge>
                <h1 className="font-heading text-5xl font-bold">From Farm to Table</h1>
                <div className="w-24 h-1 bg-primary rounded-full" />
                <p className="text-lg text-muted-foreground mt-8 leading-relaxed">
                    At Organic Harvest, we believe that nature provides the finest ingredients for a healthy life.
                    Founded with a passion for purity, we source our premium honey, dates, ghee, and oils directly
                    from trusted local farmers who practice sustainable and organic farming.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Every product we deliver is 100% pure, unadulterated, and lab-tested to ensure you receive
                    nothing but the absolute best quality for you and your family.
                </p>
            </div>
        </div>
    );
}
