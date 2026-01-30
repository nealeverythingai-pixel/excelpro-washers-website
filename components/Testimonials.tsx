"use client";

import { Star } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Kanata",
    rating: 5,
    text: "Absolutely phenomenal service! My windows have never been cleaner. The team was professional, punctual, and the results were streak-free. I'll definitely be using them again!",
    service: "Window Cleaning"
  },
  {
    name: "Michael Chen",
    location: "Orleans",
    rating: 5,
    text: "We had our driveway pressure washed and it looks brand new! They removed years of built-up grime and oil stains. Highly recommend ExcelPro Washers.",
    service: "Pressure Washing"
  },
  {
    name: "Jennifer Thompson",
    location: "Barrhaven",
    rating: 5,
    text: "The soft wash service made our house look 10 years younger! They were careful with our plants and the price was very reasonable. Five stars!",
    service: "Soft Washing"
  },
  {
    name: "David Martinez",
    location: "Downtown Ottawa",
    rating: 5,
    text: "Best window cleaning company in Ottawa! They cleaned all 3 floors of our home, including hard-to-reach windows. The booking process was seamless and the results were perfect.",
    service: "Residential Window Cleaning"
  },
  {
    name: "Lisa Anderson",
    location: "Nepean",
    rating: 5,
    text: "I was blown away by the quality and attention to detail. My gutters were clogged and overflowing, but they cleaned them out completely and even took photos to show me. Great communication!",
    service: "Gutter Cleaning"
  },
  {
    name: "Robert Taylor",
    location: "Gloucester",
    rating: 5,
    text: "After our renovation, the windows were covered in paint and dust. ExcelPro's post-renovation cleaning service made them spotless. They saved us hours of work. Worth every penny!",
    service: "Post-Renovation Cleaning"
  }
];

export function Testimonials() {
  return (
    <section className="bg-white dark:bg-gray-900 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
              Don't just take our word for it - hear from our satisfied customers across Ottawa
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.location}
                    </p>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  "{testimonial.text}"
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                  {testimonial.service}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6}>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-6 py-3 rounded-full">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                4.9/5
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                based on 127 reviews
              </span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
