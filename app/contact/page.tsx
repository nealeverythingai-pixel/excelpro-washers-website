import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Get Free Quote - ExcelPro Washers Ottawa",
  description: "Contact ExcelPro Washers for professional window cleaning, pressure washing, and soft wash services in Ottawa. Free quotes, same-day response. Call (343) 321-5300.",
  keywords: [
    "contact window cleaners Ottawa",
    "free cleaning quote Ottawa",
    "window cleaning estimate",
    "pressure washing quote",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact ExcelPro Washers | Free Quote",
    description: "Get a free quote for professional cleaning services in Ottawa. Same-day response guaranteed.",
    type: "website",
    url: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <main className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
              Contact ExcelPro Washers Ottawa
            </h1>
            <div className="mt-3">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Ready to schedule your window cleaning or pressure washing? Have questions about our services? We're here to help with free quotes and expert advice.
              </p>
            </div>
            <div className="mt-9">
              <div className="flex">
                <div className="flex-shrink-0" aria-hidden="true">
                  <Phone className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <div className="ml-3 text-base text-gray-500 dark:text-gray-400">
                  <p>
                    <a href={`tel:${siteConfig.business.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                      {siteConfig.business.phone}
                    </a>
                  </p>
                  <p className="mt-1">
                    <a href={`sms:${siteConfig.business.sms}`} className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                      Text us for a quick reply
                    </a>
                  </p>
                </div>
              </div>
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <div className="ml-3 text-base text-gray-500 dark:text-gray-400">
                  <p>
                    <a href={`mailto:${siteConfig.business.email}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                      {siteConfig.business.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <div className="ml-3 text-base text-gray-500 dark:text-gray-400">
                  <p>{siteConfig.business.areaServed}</p>
                  <p className="mt-1 text-sm">Serving Ottawa, Kanata, Orleans, Barrhaven, and Nepean</p>
                </div>
              </div>
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <div className="ml-3 text-base text-gray-500 dark:text-gray-400">
                  <p>{siteConfig.business.hours}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Note: We confirm technician availability before booking any appointment to ensure we can meet your schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 sm:mt-16 md:mt-0">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl mb-6">
              Get Your Free Quote
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
