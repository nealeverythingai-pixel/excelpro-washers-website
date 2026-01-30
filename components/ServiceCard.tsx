import { Check } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  features?: string[];
}

export function ServiceCard({ title, description, price, features }: ServiceCardProps) {
  return (
    <SpotlightCard className="shadow hover:shadow-lg transition-shadow duration-300 flex flex-col h-full dark:bg-gray-800 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6 flex-grow">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{title}</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>{description}</p>
        </div>
        {features && (
          <ul className="mt-4 space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-4 sm:px-6 rounded-b-xl">
        <div className="text-sm">
          <span className="font-medium text-primary-600 dark:text-primary-400">{price}</span>
        </div>
      </div>
    </SpotlightCard>
  );
}
