export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="font-heading text-4xl font-bold mb-8">Terms & Conditions</h1>
            <div className="prose prose-stone dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground mb-4">Last Updated: October 2023</p>
                <p className="mb-6">
                    Welcome to Organic Harvest. By accessing and utilizing our website to purchase premium pantry products, you agree to comply with the following terms and conditions.
                </p>
                <h2 className="text-2xl font-bold mt-8 mb-4">Product Quality & Information</h2>
                <p className="mb-4">
                    We strive to provide accurate descriptions and high-quality images of our organic products. Natural variations in color and texture may occur with products like pure honey and desi ghee due to seasonal changes.
                </p>
                <h2 className="text-2xl font-bold mt-8 mb-4">Pricing and Payment</h2>
                <p className="mb-4">
                    All prices are listed in PKR (Pakistani Rupees). We reserve the right to modify prices at any time due to market fluctuations. Payment methods available include Cash on Delivery (COD) and manual bank transfers.
                </p>
            </div>
        </div>
    );
}
