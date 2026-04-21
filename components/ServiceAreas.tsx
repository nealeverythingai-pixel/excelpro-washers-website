"use client";

import { MapPin, CheckCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

const serviceAreas = [
  { name: "Downtown Ottawa", available: true },
  { name: "Kanata", available: true },
  { name: "Orleans", available: true },
  { name: "Barrhaven", available: true },
  { name: "Nepean", available: true },
  { name: "Gloucester", available: true },
  { name: "Stittsville", available: true },
  { name: "Manotick", available: true },
  { name: "Riverside South", available: true },
  { name: "Alta Vista", available: true },
  { name: "The Glebe", available: true },
  { name: "Westboro", available: true },
];

export function ServiceAreas() {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Proudly Serving Ottawa & Surrounding Areas
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
              Professional exterior cleaning services across the National Capital Region
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Map placeholder */}
          <FadeIn direction="right">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8 min-h-[400px] flex flex-col items-center justify-center transition-colors duration-300">
              <MapPin className="h-24 w-24 text-primary-600 dark:text-primary-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ottawa & Surrounding Areas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                We service all major neighborhoods within a 30km radius of downtown Ottawa
              </p>
              <div className="mt-6">
                <a
                  href="tel:+14389006384"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Check Your Area
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Service areas list */}
          <FadeIn direction="left" delay={0.2}>
            <div className="grid grid-cols-2 gap-4">
              {serviceAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {area.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Don't see your area?</strong> We're expanding! Call us at{" "}
                <a href="tel:+14389006384" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  (438) 900-6384
                </a>{" "}
                to check availability.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
