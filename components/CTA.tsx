import { siteConfig } from "@/lib/site";

export function CTA() {
  return (
    <div className="bg-primary-700 dark:bg-primary-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready for clearer views?</span>
          <span className="block">Get your free quote today.</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-primary-100 dark:text-primary-200">
          Fast booking, professional service, and streak-free results. Minimum visit $200.
        </p>
        <a
          href={siteConfig.business.googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto transition-colors duration-300"
        >
          Get a Quote
        </a>
      </div>
    </div>
  );
}
