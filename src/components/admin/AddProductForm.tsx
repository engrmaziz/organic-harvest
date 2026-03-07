"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PackagePlus } from "lucide-react";
import { uploadImage } from "@/lib/uploadImage";
import { addProduct } from "@/app/actions/product-actions";

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    price: z
        .string()
        .min(1, "Price is required.")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "Price must be a positive number.",
        }),
    weight: z.string().min(1, "Weight is required (e.g., 500g)."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    category: z.enum(["Natural Sweets", "Cooking Essentials"]),
    tags: z.string().optional(),
    stock_quantity: z
        .string()
        .min(1, "Stock quantity is required.")
        .refine(
            (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number.isInteger(Number(val)),
            { message: "Stock quantity must be a non-negative whole number." }
        ),
    image: z
        .custom<FileList>((val) => val instanceof FileList, "Image is required.")
        .refine((files) => files.length > 0, "Please select an image.")
        .refine(
            (files) => files[0]?.size <= 5 * 1024 * 1024,
            "Image must be less than 5MB."
        )
        .refine(
            (files) => ["image/jpeg", "image/png", "image/webp"].includes(files[0]?.type),
            "Only JPEG, PNG, or WebP images are allowed."
        ),
});

type ProductFormValues = z.infer<typeof productSchema>;

const inputClass =
    "w-full rounded-md border border-[#D4AF37]/30 bg-[#0B1C10] px-3 py-2 text-[#FDFBF7] placeholder-[#FDFBF7]/40 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition text-sm";

const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-1";

const errorClass = "mt-1 text-xs text-red-400";

export default function AddProductForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
    });

    const onSubmit = async (values: ProductFormValues) => {
        setSuccessMessage(null);
        setServerError(null);

        try {
            const imageFile = values.image[0];
            const imageUrl = await uploadImage(imageFile);

            const result = await addProduct(
                {
                    name: values.name,
                    price: Number(values.price),
                    weight: values.weight,
                    description: values.description,
                    category: values.category,
                    tags: values.tags ?? "",
                    stock_quantity: Number(values.stock_quantity),
                },
                imageUrl
            );

            if (!result.success) {
                setServerError(result.error ?? "Failed to add product.");
                return;
            }

            setSuccessMessage(`"${values.name}" has been added successfully!`);
            reset();
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred.";
            setServerError(message);
        }
    };

    return (
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B1C10] p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
                <PackagePlus className="h-6 w-6 text-[#D4AF37]" />
                <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#FDFBF7]">
                    Add New Product
                </h2>
            </div>

            {successMessage && (
                <div className="mb-4 rounded-md border border-green-500/40 bg-green-900/30 px-4 py-3 text-sm text-green-300">
                    {successMessage}
                </div>
            )}

            {serverError && (
                <div className="mb-4 rounded-md border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-300">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                    <label className={labelClass}>Product Name</label>
                    <input
                        {...register("name")}
                        placeholder="e.g., Sidr Honey"
                        className={inputClass}
                    />
                    {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                </div>

                {/* Price, Weight & Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Price (PKR)</label>
                        <input
                            {...register("price")}
                            type="number"
                            step="0.01"
                            placeholder="e.g., 1200"
                            className={inputClass}
                        />
                        {errors.price && <p className={errorClass}>{errors.price.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Weight</label>
                        <input
                            {...register("weight")}
                            placeholder="e.g., 500g"
                            className={inputClass}
                        />
                        {errors.weight && <p className={errorClass}>{errors.weight.message}</p>}
                    </div>
                </div>

                {/* Stock Quantity */}
                <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input
                        {...register("stock_quantity")}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g., 50"
                        className={inputClass}
                    />
                    {errors.stock_quantity && (
                        <p className={errorClass}>{errors.stock_quantity.message}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        placeholder="Describe the product..."
                        className={`${inputClass} resize-none`}
                    />
                    {errors.description && (
                        <p className={errorClass}>{errors.description.message}</p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className={labelClass}>Category</label>
                    <select {...register("category")} className={inputClass}>
                        <option value="Natural Sweets">Natural Sweets</option>
                        <option value="Cooking Essentials">Cooking Essentials</option>
                    </select>
                    {errors.category && (
                        <p className={errorClass}>{errors.category.message}</p>
                    )}
                </div>

                {/* Tags */}
                <div>
                    <label className={labelClass}>Tags (comma separated)</label>
                    <input
                        {...register("tags")}
                        type="text"
                        placeholder="e.g., honey, raw, organic"
                        className="w-full p-3 rounded-md bg-[#0B1C10] border border-[#D4AF37]/30 text-[#FDFBF7] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none placeholder:text-gray-500"
                    />
                    {errors.tags && <p className={errorClass}>{errors.tags.message}</p>}
                </div>

                {/* Image */}
                <div>
                    <label className={labelClass}>Product Image</label>
                    <input
                        {...register("image")}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="w-full cursor-pointer rounded-md border border-[#D4AF37]/30 bg-[#0B1C10] text-sm text-[#FDFBF7]/70 file:mr-4 file:rounded file:border-0 file:bg-[#D4AF37] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#0B1C10] hover:file:bg-[#D4AF37]/90 focus:outline-none"
                    />
                    {errors.image && (
                        <p className={errorClass}>{errors.image.message as string}</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-[#0B1C10] transition hover:bg-[#D4AF37]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading &amp; Saving...
                        </>
                    ) : (
                        <>
                            <PackagePlus className="h-4 w-4" />
                            Add Product
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
