'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Sparkles, Home, Droplets, Wind, Zap } from 'lucide-react';

const serviceOptions = [
  { 
    value: 'window-cleaning', 
    label: 'Window Cleaning',
    icon: Home,
    description: 'Streak-free cleaning for all window types',
    basePrice: 300
  },
  { 
    value: 'pressure-washing', 
    label: 'Pressure Washing',
    icon: Droplets,
    description: 'Deep clean driveways, decks, and siding',
    basePrice: 400
  },
  { 
    value: 'gutter-cleaning', 
    label: 'Gutter Cleaning',
    icon: Wind,
    description: 'Remove debris and prevent water damage',
    basePrice: 150
  },
  { 
    value: 'soft-washing', 
    label: 'Soft Washing',
    icon: Zap,
    description: 'Gentle cleaning for delicate surfaces',
    basePrice: 800
  }
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    services: [] as string[],
    address: '',
    details: '',
    marketingConsent: false,
    smsConsent: false,
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [estimatedQuote, setEstimatedQuote] = useState<number>(0);

  // Calculate estimated quote based on selected services
  useEffect(() => {
    if (formData.services.length === 0) {
      setEstimatedQuote(0);
      return;
    }

    let total = 0;
    
    formData.services.forEach(serviceValue => {
      const service = serviceOptions.find(s => s.value === serviceValue);
      if (service) {
        total += service.basePrice;
      }
    });
    
    // Multi-service discounts
    if (formData.services.length >= 2) {
      total = total * 0.95; // 5% discount for 2+ services
    }
    if (formData.services.length >= 3) {
      total = total * 0.95; // Additional 5% for 3+ services
    }
    
    setEstimatedQuote(Math.round(total));
  }, [formData.services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Thank you! We\'ll contact you shortly.');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          services: [],
          address: '',
          details: '',
          marketingConsent: false,
          smsConsent: false,
        });
        setTouched({});
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to submit form. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-format phone number
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
    setTouched(prev => ({ ...prev, services: true }));
  };

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPhoneValid = (phone: string) => {
    return phone.replace(/\D/g, '').length === 10;
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 6;
    
    if (formData.firstName.trim()) completed++;
    if (formData.lastName.trim()) completed++;
    if (formData.email.trim() && isEmailValid(formData.email)) completed++;
    if (formData.phone.trim() && isPhoneValid(formData.phone)) completed++;
    if (formData.services.length > 0) completed++;
    if (formData.details.trim().length >= 20) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Form Completion
          </span>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Estimated Quote Banner */}
      {estimatedQuote > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Quote</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Based on your selections</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ${estimatedQuote.toLocaleString()}
            </p>
            {formData.services.length >= 2 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Multi-service discount applied! 🎉
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
          <p className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {message}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          <p className="font-medium">✗ {message}</p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name *
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              onBlur={() => handleBlur('firstName')}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm pr-10"
              placeholder="John"
            />
            {formData.firstName.trim() && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name *
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              onBlur={() => handleBlur('lastName')}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm pr-10"
              placeholder="Doe"
            />
            {formData.lastName.trim() && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
          </label>
          <div className="relative mt-1">
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={`block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm pr-10 ${
                touched.email && !isEmailValid(formData.email) && formData.email
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="john@example.com"
            />
            {formData.email && isEmailValid(formData.email) && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
          </div>
          {touched.email && !isEmailValid(formData.email) && formData.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">Please enter a valid email</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone *
          </label>
          <div className="relative mt-1">
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              maxLength={14}
              className={`block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm pr-10 ${
                touched.phone && !isPhoneValid(formData.phone) && formData.phone
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="(613) 555-1234"
            />
            {formData.phone && isPhoneValid(formData.phone) && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
          </div>
          {touched.phone && !isPhoneValid(formData.phone) && formData.phone && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">Please enter a valid 10-digit phone number</p>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            By providing your phone number, you agree to receive Visit Reminders and other transactional text messages (SMS) from ExcelPro Washers. You can unsubscribe at anytime by replying STOP. Message and data rates may apply. Message frequency varies. Reply HELP for help or STOP to cancel.
          </p>
          <div className="mt-2 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="smsConsent"
              checked={formData.smsConsent}
              onChange={(e) => setFormData(prev => ({ ...prev, smsConsent: e.target.checked }))}
              className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded flex-shrink-0"
            />
            <label htmlFor="smsConsent" className="text-xs text-gray-600 dark:text-gray-400">
              I also agree to receive marketing SMS from ExcelPro Washers (promotions, seasonal offers). Reply STOP MKT to opt out of marketing SMS.
            </label>
          </div>
        </div>
      </div>

      {/* Services Selection with Animated Cards */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Services Needed * <span className="text-xs text-gray-500 dark:text-gray-400">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviceOptions.map((service) => {
            const Icon = service.icon;
            const isSelected = formData.services.includes(service.value);
            
            return (
              <label
                key={service.value}
                className={`relative flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleServiceToggle(service.value)}
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      {service.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{service.description}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
                )}
              </label>
            );
          })}
        </div>
        {formData.services.length === 0 && touched.services && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">Please select at least one service</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Property Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="123 Main St, Ottawa, ON"
        />
      </div>

      {/* Project Details with Character Counter */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Details *
          </label>
          <span className={`text-xs font-medium ${formData.details.length >= 20 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            {formData.details.length} / 20 minimum
          </span>
        </div>
        <textarea
          id="details"
          name="details"
          required
          rows={4}
          value={formData.details}
          onChange={handleChange}
          onBlur={() => handleBlur('details')}
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm ${
            touched.details && formData.details.length < 20 && formData.details.length > 0
              ? 'border-yellow-300 dark:border-yellow-700'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Tell us about your project, property size, urgency, and any specific requirements..."
        />
        <div className="mt-2 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Pro Tip:</strong> Include urgency ("ASAP", "this week"), property details (sq ft, number of windows), and budget flexibility for the most accurate instant quotes.
          </p>
        </div>
      </div>

      {/* Marketing Consent */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="marketingConsent"
          checked={formData.marketingConsent}
          onChange={(e) => setFormData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="marketingConsent" className="text-sm text-gray-600 dark:text-gray-400">
          I&apos;d like to receive seasonal tips, exclusive offers, and cleaning insights from ExcelPro Washers. You can unsubscribe anytime.
        </label>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={status === 'submitting' || formData.services.length === 0}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Submitting...
            </>
          ) : (
            'Get Your Free Quote'
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Our AI will analyze your request and send you a personalized quote within minutes. Hot leads get called within 1 hour!
      </p>
    </form>
  );
}
