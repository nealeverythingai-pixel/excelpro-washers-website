'use client'

import { useState, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { createQuote } from './actions'
import { Check, Info, Droplets, Home, Waves, Umbrella, CloudRain, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState = {
  message: '',
}

export function SalesQuoteForm() {
  // @ts-ignore
  const [state, formAction] = useFormState(createQuote, initialState)

  // --- Calculator State ---
  const [activeServices, setActiveServices] = useState({
    windowCleaning: false,
    softWash: false,
    pressureWashing: false,
    gutterCleaning: false,
    roofCleaning: false
  });
  
  const [stories, setStories] = useState<number>(1);
  const [smallWindows, setSmallWindows] = useState<number>(0);
  const [largeWindows, setLargeWindows] = useState<number>(0);
  const [homeType, setHomeType] = useState<'townhouse' | 'semi' | 'detached' | 'large'>('detached');
  const [drivewaySize, setDrivewaySize] = useState<'none' | 'single' | 'double' | 'triple'>('none');
  const [deckPatioArea, setDeckPatioArea] = useState<number>(0);

  // --- Calculation Logic ---
  const calculateCosts = () => {
    let windowPrice = 0;
    let softWashPrice = 0;
    let pressurePrice = 0;
    let gutterPrice = 0;
    let roofPrice = 0;

    // Window Cleaning
    if (activeServices.windowCleaning) {
      let smallRate = 5;
      let largeRate = 10;
      if (stories === 3) {
        smallRate = 8;
        largeRate = 13;
      }
      windowPrice = (smallWindows * smallRate) + (largeWindows * largeRate);
    }

    // Soft Wash
    if (activeServices.softWash) {
      const houseRates = { townhouse: 299, semi: 349, detached: 399, large: 549 };
      softWashPrice = houseRates[homeType];
    }

    // Gutter Cleaning
    if (activeServices.gutterCleaning) {
        const gutterRates = { townhouse: 175, semi: 225, detached: 275, large: 375 };
        gutterPrice = gutterRates[homeType];
        if (stories === 3) gutterPrice += 50; 
    }

    // Roof Cleaning
    if (activeServices.roofCleaning) {
        const roofRates = { townhouse: 450, semi: 650, detached: 850, large: 1100 };
        roofPrice = roofRates[homeType];
    }

    // Pressure Washing
    if (activeServices.pressureWashing) {
      const drivewayRates = { none: 0, single: 149, double: 229, triple: 329 };
      if (drivewaySize) pressurePrice += drivewayRates[drivewaySize];
      if (deckPatioArea) pressurePrice += deckPatioArea * 0.35; 
    }

    const calculatedTotal = Math.round(windowPrice + softWashPrice + pressurePrice + gutterPrice + roofPrice);
    let finalTotal = calculatedTotal;
    let minimumApplied = false;

    if (calculatedTotal > 0 && calculatedTotal < 200) {
        finalTotal = 200;
        minimumApplied = true;
    }

    return {
      window: Math.round(windowPrice),
      softWash: Math.round(softWashPrice),
      pressure: Math.round(pressurePrice),
      gutter: Math.round(gutterPrice),
      roof: Math.round(roofPrice),
      total: calculatedTotal,
      finalTotal,
      minimumApplied
    };
  };

  const costs = calculateCosts();

  // Prepare items for DB
  const getItemsJSON = () => {
      const items = [];
      if (activeServices.windowCleaning && costs.window > 0) items.push({ description: 'Window Cleaning', quantity: 1, unitPrice: costs.window });
      if (activeServices.softWash) items.push({ description: 'Soft Wash', quantity: 1, unitPrice: costs.softWash });
      if (activeServices.gutterCleaning) items.push({ description: 'Gutter Cleaning', quantity: 1, unitPrice: costs.gutter });
      if (activeServices.roofCleaning) items.push({ description: 'Roof Cleaning', quantity: 1, unitPrice: costs.roof });
      if (activeServices.pressureWashing && costs.pressure > 0) items.push({ description: 'Pressure Washing', quantity: 1, unitPrice: costs.pressure });
      if (costs.minimumApplied) items.push({ description: 'Minimum Service Charge Adjustment', quantity: 1, unitPrice: 200 - costs.total });
      return JSON.stringify(items);
  }

  return (
    <form action={formAction} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-6 sm:space-y-5">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Client Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Capture the lead details here.</p>
        </div>
        <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">First name</label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input type="text" name="firstName" id="firstName" required className="max-w-lg block w-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Last name</label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input type="text" name="lastName" id="lastName" required className="max-w-lg block w-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Email</label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input type="email" name="email" id="email" required className="block w-full max-w-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
            </div>
             <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Phone</label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input type="tel" name="phone" id="phone" required className="block w-full max-w-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
            </div>
             <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Street Address</label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input type="text" name="address" id="address" required className="block w-full max-w-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
            </div>
        </div>
      </div>

      <div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Job Estimator</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Calculate the quote based on property specs.</p>
        </div>
        
        {/* Service Toggles */}
        <div className="flex flex-wrap gap-4">
            {[
                { id: 'windowCleaning', label: 'Window Cleaning', icon: Droplets, color: 'primary' },
                { id: 'softWash', label: 'House Washing', icon: Home, color: 'green' },
                { id: 'gutterCleaning', label: 'Gutters', icon: Umbrella, color: 'orange' },
                { id: 'roofCleaning', label: 'Roof', icon: CloudRain, color: 'purple' },
                { id: 'pressureWashing', label: 'Pressure Wash', icon: Waves, color: 'blue' },
            ].map((s) => (
                 <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveServices(p => ({ ...p, [s.id]: !p[s.id as keyof typeof activeServices] }))}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                        // @ts-ignore
                        activeServices[s.id] 
                            ? `bg-${s.color}-50 border-${s.color}-500 text-${s.color}-700 bg-gray-100 border-gray-500` // Fallback colors handled by simple logic below
                            : "bg-white border-dashed border-gray-300 text-gray-400"
                    )}
                    style={{
                        backgroundColor: activeServices[s.id as keyof typeof activeServices] ? '#f0fdf4' : 'white',
                        borderColor: activeServices[s.id as keyof typeof activeServices] ? '#16a34a' : '#d1d5db',
                        color: activeServices[s.id as keyof typeof activeServices] ? '#15803d' : '#9ca3af'
                    }}
                >
                    <s.icon className="w-4 h-4" /> {s.label}
                </button>
            ))}
        </div>

        {/* Dynamic Inputs */}
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
             {/* Note: This is a direct functionality port of PricingCalculator.tsx logic */}
             
             {/* Window Inputs */}
             {activeServices.windowCleaning && (
                 <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2"><Droplets className="w-4 h-4"/> Window Cleaning</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select 
                            value={stories} onChange={(e) => setStories(parseInt(e.target.value))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3"
                        >
                            <option value={1}>1 Story</option>
                            <option value={2}>2 Stories</option>
                            <option value={3}>3 Stories</option>
                        </select>
                        <input type="number" placeholder="Small Windows (qty)" value={smallWindows || ''} onChange={(e) => setSmallWindows(Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3" />
                        <input type="number" placeholder="Large Windows (qty)" value={largeWindows || ''} onChange={(e) => setLargeWindows(Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3" />
                    </div>
                 </div>
             )}

             {/* Property Type (Shared) */}
             {(activeServices.softWash || activeServices.gutterCleaning || activeServices.roofCleaning) && (
                 <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2"><Home className="w-4 h-4"/> Property Size</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                         {['townhouse', 'semi', 'detached', 'large'].map((t) => (
                             <button
                                key={t}
                                type="button"
                                onClick={() => setHomeType(t as any)}
                                className={cn("p-2 text-sm border rounded-md capitalize", homeType === t ? "bg-green-100 border-green-500 text-green-800" : "bg-white border-gray-300")}
                             >
                                {t}
                             </button>
                         ))}
                    </div>
                 </div>
             )}

             {/* Pressure Washing */}
             {activeServices.pressureWashing && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2"><Waves className="w-4 h-4"/> Pressure Washing</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <select 
                            value={drivewaySize} onChange={(e) => setDrivewaySize(e.target.value as any)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3"
                        >
                            <option value="none">No Driveway</option>
                            <option value="single">Single Driveway</option>
                            <option value="double">Double Driveway</option>
                            <option value="triple">Triple Driveway</option>
                        </select>
                        <input type="number" placeholder="Deck/Patio Area (sq ft)" value={deckPatioArea || ''} onChange={(e) => setDeckPatioArea(Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3" />
                    </div>
                 </div>
             )}
        </div>
      </div>

      <div className="pt-8 bg-gray-50 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-white pb-10">
        <div className="rounded-lg bg-green-50 p-6 border border-green-200">
             <div className="flex justify-between items-center mb-4 border-b border-green-200 pb-2">
                 <span className="text-gray-700 font-medium">Estimated Total</span>
                 <span className="text-3xl font-bold text-green-700">${costs.finalTotal}</span>
             </div>
             
             {costs.minimumApplied && (
                 <div className="mb-4 text-xs text-amber-700 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠ Minimum Service Charge of $200 Applied
                 </div>
             )}

             {/* Hidden Inputs for Form Submission */}
             <input type="hidden" name="total" value={costs.finalTotal} />
             <input type="hidden" name="items" value={getItemsJSON()} />

             <div className="flex justify-end gap-3">
                 <button
                    type="submit"
                    className="flex w-full sm:w-auto justify-center rounded-md border border-transparent bg-green-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                 >
                    <Save className="mr-2 h-5 w-5" /> Save Quote & Client
                 </button>
             </div>
        </div>
      </div>
    </form>
  )
}
