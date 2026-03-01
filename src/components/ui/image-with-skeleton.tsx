"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    sizes?: string;
    priority?: boolean;
}

export function ImageWithSkeleton({ src, alt, className, containerClassName, sizes, priority }: ImageWithSkeletonProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={cn("relative overflow-hidden", containerClassName)}>
            {!isLoaded && (
                <Skeleton className="absolute inset-0 h-full w-full rounded-none z-0" />
            )}
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                onLoad={() => setIsLoaded(true)}
                className={cn(
                    "object-cover transition-all duration-700 ease-in-out z-10",
                    isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md scale-105",
                    className
                )}
                style={{ objectFit: 'cover' }}
            />
        </div>
    );
}
