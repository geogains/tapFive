"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  imageFit?: "cover" | "contain";
  imageScale?: number;
};

export function ProductGallery({ images, alt, imageFit = "cover", imageScale }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--tf-radius-lg)] bg-tf-neutral-900">
        <div
          className="relative h-full w-full"
          style={imageScale ? { transform: `scale(${imageScale})` } : undefined}
        >
          <Image
            src={activeImage}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={imageFit === "contain" ? "object-contain" : "object-cover"}
          />
        </div>
      </div>

      {/* Thumbnail rail only renders once there's more than one image to switch between. */}
      {images.length > 1 ? (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--tf-radius-md)] bg-tf-neutral-900 ring-2 ring-offset-2 transition-all",
                index === activeIndex ? "ring-tf-accent" : "ring-transparent hover:ring-tf-neutral-300",
              )}
            >
              <div
                className="relative h-full w-full"
                style={imageScale ? { transform: `scale(${imageScale})` } : undefined}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className={imageFit === "contain" ? "object-contain" : "object-cover"}
                />
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
