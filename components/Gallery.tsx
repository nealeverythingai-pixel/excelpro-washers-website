"use client";

import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";

const images = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    alt: "Residential Window Cleaning",
    caption: "Residential Homes",
  },
  {
    src: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=2070&auto=format&fit=crop",
    alt: "Professional Window Cleaning Service",
    caption: "Expert Technicians",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    alt: "Commercial Window Cleaning",
    caption: "Commercial Properties",
  },
];

export function Gallery() {
  return (
    <section className="bg-white dark:bg-gray-900 py-16 sm:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              See Our Work
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              We take pride in delivering crystal clear results for every client.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-lg group">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="p-6 text-white font-semibold text-lg">
                    {image.caption}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
