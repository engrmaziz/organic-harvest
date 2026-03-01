import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
                <h1 className="font-heading text-4xl md:text-5xl font-bold">Get In Touch</h1>
                <div className="w-24 h-1 bg-primary rounded-full" />
                <p className="text-muted-foreground max-w-2xl mt-4">
                    Have a question about our organic products? We're here to help!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="space-y-8">
                    <h2 className="font-heading text-2xl font-semibold">Contact Information</h2>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <Phone className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Phone</h3>
                                <p className="text-muted-foreground">+92 300 0000000</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Mail className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Email</h3>
                                <p className="text-muted-foreground">hello@organicharvest.pk</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <MapPin className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Address</h3>
                                <p className="text-muted-foreground">123 Organic Farms Road, Lahore, Pakistan</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Your email address" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="How can we help you?" className="min-h-[120px]" />
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11">
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
