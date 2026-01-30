import { Hero } from "@/components/Hero";
import { ServiceCard } from "@/components/ServiceCard";
import { Gallery } from "@/components/Gallery";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { siteConfig } from "@/lib/site";
import { CheckCircle, Clock, Shield, Camera } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />

      {/* Trust Bar */}
      <section className="bg-gray-50 dark:bg-gray-800 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.2}>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-4">
                  <span className="font-bold text-lg">$150</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Minimum Visit</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Ensuring quality service</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fast Booking</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Easy online scheduling</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Streak-Free</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Satisfaction guaranteed</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-4">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Before/After</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">See the difference</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Professional Exterior Cleaning
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              Comprehensive cleaning solutions to restore and protect your Ottawa property.
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.1}>
              <ServiceCard
                title={service.title}
                description={service.description}
                price={service.price}
              />
            </FadeIn>
          ))}
        </div>
      </section>

      <Gallery />

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                How It Works
              </h2>
            </div>
          </FadeIn>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300 dark:border-gray-700 hidden md:block" />
            </div>
            <div className="relative flex flex-col md:flex-row justify-between">
              {[
                { step: 1, title: "Request Quote", desc: "Fill out our simple form" },
                { step: 2, title: "Confirm", desc: "We confirm availability" },
                { step: 3, title: "Deposit", desc: "Secure your spot via e-Transfer" },
                { step: 4, title: "Clean", desc: "Technician arrives & cleans" },
                { step: 5, title: "Enjoy", desc: "Pay remainder & enjoy the view" },
              ].map((item, index) => (
                <FadeIn key={item.step} delay={index * 0.1} className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-4 z-10 transition-colors duration-300">
                  <span className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="lg:grid lg:grid-cols-2 lg:gap-24 lg:items-center">
          <FadeIn direction="right">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Why Choose ExcelPro Washers?
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                We are dedicated to providing the best window cleaning experience in Ottawa. Our team is professional, reliable, and focused on delivering exceptional results.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Professional and courteous technicians",
                  "We prioritize safety and professionalism",
                  "Specialized equipment for superior results",
                  "Satisfaction guaranteed on every job",
                  "Locally owned and operated in Ottawa",
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="ml-3 text-base text-gray-500 dark:text-gray-400">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.2}>
            <div className="mt-10 lg:mt-0 relative">
               <div className="aspect-video rounded-xl shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                   {/* Placeholder for Why Choose Us Image */}
                   <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 min-h-[300px]">
                      <span className="text-lg">Professional Service</span>
                   </div>
               </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <FAQ />
      <CTA />
    </div>
  );
}
