"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What is your minimum charge?",
    answer: "Our minimum charge for any service visit is $200. This ensures we can provide the highest quality service with professional equipment and insurance coverage.",
  },
  {
    question: "Do you clean windows in the winter?",
    answer: "Yes! We specialize in interior window cleaning during the winter months. We also offer post-renovation cleaning year-round.",
  },
  {
    question: "How do I pay?",
    answer: "We currently accept e-Transfer. Payment is due upon completion of the job and your satisfaction with our work.",
  },
  {
    question: "Are you insured?",
    answer: "Yes, we prioritize safety and professionalism. We carry liability insurance for your peace of mind.",
  },
  {
    question: "Do you service commercial properties?",
    answer: "Absolutely. We offer monthly and bi-weekly maintenance plans for offices, storefronts, and other commercial spaces in Ottawa.",
  },
  {
    question: "What areas do you serve?",
    answer: "We serve Ottawa and the surrounding suburbs, including Kanata, Orleans, Barrhaven, and Nepean.",
  },
];

export function FAQ() {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200 dark:divide-gray-700">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6 divide-y divide-gray-200 dark:divide-gray-700">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Disclosure({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pt-6">
      <dt className="text-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-left w-full flex justify-between items-start text-gray-400 dark:text-gray-500"
        >
          <span className="font-medium text-gray-900 dark:text-white">{question}</span>
          <span className="ml-6 h-7 flex items-center">
            {isOpen ? (
              <ChevronUp className="h-6 w-6 transform" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-6 w-6 transform" aria-hidden="true" />
            )}
          </span>
        </button>
      </dt>
      {isOpen && (
        <dd className="mt-2 pr-12">
          <p className="text-base text-gray-500 dark:text-gray-400">{answer}</p>
        </dd>
      )}
    </div>
  );
}
