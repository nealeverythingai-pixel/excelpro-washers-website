"use client";

import { useState } from "react";
import { Calculator, Check, Info, Droplets, Home, Waves, Umbrella, CloudRain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PricingCalculator() {
  // Service Toggles
  const [activeServices, setActiveServices] = useState({
    windowCleaning: true,
    softWash: false,
    pressureWashing: false,
    gutterCleaning: false,
    roofCleaning: false
  });

  // Window Cleaning State
  const [stories, setStories] = useState<number>(1);
  const [smallWindows, setSmallWindows] = useState<number>(0);
  const [largeWindows, setLargeWindows] = useState<number>(0);

  // Home Type State (Shared by Soft Wash, Gutter, Roof)
  const [homeType, setHomeType] = useState<'townhouse' | 'semi' | 'detached' | 'large'>('detached');

  // Pressure Washing State
  const [drivewaySize, setDrivewaySize] = useState<'none' | 'single' | 'double' | 'triple'>('none');
  const [deckPatioArea, setDeckPatioArea] = useState<number>(0);

  // Pricing Logic
  const calculateCosts = () => {
    let windowPrice = 0;
    let softWashPrice = 0;
    let pressurePrice = 0;
    let gutterPrice = 0;
    let roofPrice = 0;

    // Window Cleaning Calculation
    if (activeServices.windowCleaning) {
      let smallRate = 5;
      let largeRate = 10;
      if (stories === 3) {
        smallRate = 8;
        largeRate = 13;
      }
      windowPrice = (smallWindows * smallRate) + (largeWindows * largeRate);
    }

    // Soft Wash Calculation
    if (activeServices.softWash) {
      const houseRates = {
        townhouse: 299,
        semi: 349,
        detached: 399,
        large: 549
      };
      softWashPrice = houseRates[homeType];
    }

    // Gutter Cleaning Calculation
    if (activeServices.gutterCleaning) {
        const gutterRates = {
            townhouse: 175,
            semi: 225,
            detached: 275,
            large: 375
        };
        gutterPrice = gutterRates[homeType];
        
        // Add surcharge for 3-story homes if not already accounted for in "large" (but keeping logic simple)
        if (stories === 3) {
            gutterPrice += 50; 
        }
    }

    // Roof Cleaning Calculation
    if (activeServices.roofCleaning) {
        const roofRates = {
            townhouse: 450,
            semi: 650,
            detached: 850,
            large: 1100
        };
        roofPrice = roofRates[homeType];
    }

    // Pressure Washing Calculation
    if (activeServices.pressureWashing) {
      const drivewayRates = {
        none: 0,
        single: 149,
        double: 229,
        triple: 329
      };
      if (drivewaySize) pressurePrice += drivewayRates[drivewaySize];
      if (deckPatioArea) pressurePrice += deckPatioArea * 0.35; // $0.35 per sq ft
    }

    const calculatedTotal = Math.round(windowPrice + softWashPrice + pressurePrice + gutterPrice + roofPrice);
    let finalTotal = calculatedTotal;
    let minimumApplied = false;

    // Apply Global Minimum of $200
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

  const generateMessage = () => {
    const parts = [];
    if (activeServices.windowCleaning && (costs.window > 0)) {
      parts.push(`Window Cleaning ($${costs.window})`);
    }
    if (activeServices.softWash) {
      parts.push(`Soft Wash ($${costs.softWash})`);
    }
    if (activeServices.gutterCleaning) {
      parts.push(`Gutter Cleaning ($${costs.gutter})`);
    }
    if (activeServices.roofCleaning) {
      parts.push(`Roof Cleaning ($${costs.roof})`);
    }
    if (activeServices.pressureWashing && costs.pressure > 0) {
      parts.push(`Pressure Washing ($${costs.pressure})`);
    }
    let msg = `I calculated an estimate of $${costs.total} for: ${parts.join(', ')}. Property Type: ${homeType}.`;
    
    if (costs.minimumApplied) {
        msg += ` Note: A minimum service charge of $200 has been applied (original total: $${costs.total}).`;
    }

    return msg;
  };

  return (
    <section className="py-16 bg-white sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Instant Price Estimator</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Select the services you need and get a custom estimate in seconds.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            
            {/* Service Selection Tabs */}
            <div className="flex flex-wrap gap-4 mb-10">
                <button
                    onClick={() => setActiveServices(p => ({ ...p, windowCleaning: !p.windowCleaning }))}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium border-2 transition-all shadow-sm hover:shadow-md",
                        activeServices.windowCleaning ? "bg-primary-50 border-primary-500 text-primary-700" : "bg-white border-dashed border-gray-300 text-gray-400 hover:border-primary-300 hover:text-gray-600"
                    )}
                >
                   <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", activeServices.windowCleaning ? "bg-primary-600 border-primary-600" : "border-gray-300 bg-white")}>
                        {activeServices.windowCleaning && <Check className="w-3 h-3 text-white" />}
                   </div>
                   <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" /> Window Cleaning
                   </div>
                </button>
                <button
                    onClick={() => setActiveServices(p => ({ ...p, softWash: !p.softWash }))}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium border-2 transition-all shadow-sm hover:shadow-md",
                        activeServices.softWash ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-dashed border-gray-300 text-gray-400 hover:border-green-300 hover:text-gray-600"
                    )}
                >
                   <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", activeServices.softWash ? "bg-green-600 border-green-600" : "border-gray-300 bg-white")}>
                        {activeServices.softWash && <Check className="w-3 h-3 text-white" />}
                   </div>
                   <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" /> House Washing
                    </div>
                </button>
                <button
                    onClick={() => setActiveServices(p => ({ ...p, pressureWashing: !p.pressureWashing }))}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium border-2 transition-all shadow-sm hover:shadow-md",
                        activeServices.pressureWashing ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-dashed border-gray-300 text-gray-400 hover:border-blue-300 hover:text-gray-600"
                    )}
                >
                   <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", activeServices.pressureWashing ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white")}>
                        {activeServices.pressureWashing && <Check className="w-3 h-3 text-white" />}
                   </div>
                   <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4" /> Pressure Washing
                   </div>
                </button>
                <button
                    onClick={() => setActiveServices(p => ({ ...p, gutterCleaning: !p.gutterCleaning }))}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium border-2 transition-all shadow-sm hover:shadow-md",
                        activeServices.gutterCleaning ? "bg-orange-50 border-orange-500 text-orange-700" : "bg-white border-dashed border-gray-300 text-gray-400 hover:border-orange-300 hover:text-gray-600"
                    )}
                >
                   <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", activeServices.gutterCleaning ? "bg-orange-600 border-orange-600" : "border-gray-300 bg-white")}>
                        {activeServices.gutterCleaning && <Check className="w-3 h-3 text-white" />}
                   </div>
                   <div className="flex items-center gap-2">
                        <Umbrella className="w-4 h-4" /> Gutter Cleaning
                   </div>
                </button>
                <button
                    onClick={() => setActiveServices(p => ({ ...p, roofCleaning: !p.roofCleaning }))}
                    className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium border-2 transition-all shadow-sm hover:shadow-md",
                        activeServices.roofCleaning ? "bg-purple-50 border-purple-500 text-purple-700" : "bg-white border-dashed border-gray-300 text-gray-400 hover:border-purple-300 hover:text-gray-600"
                    )}
                >
                   <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", activeServices.roofCleaning ? "bg-purple-600 border-purple-600" : "border-gray-300 bg-white")}>
                        {activeServices.roofCleaning && <Check className="w-3 h-3 text-white" />}
                   </div>
                   <div className="flex items-center gap-2">
                        <CloudRain className="w-4 h-4" /> Roof Cleaning
                   </div>
                </button>
            </div>

            <div className="space-y-12">
              {/* Window Cleaning Section */}
              {activeServices.windowCleaning && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-lg font-bold tracking-tight text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-primary-600" /> Window Cleaning
                  </h3>
                  
                  {/* Stories Input */}
                  <div className="mb-8">
                    <label className="text-sm font-semibold leading-6 text-gray-900">How many stories is your home?</label>
                    <div className="mt-4 flex gap-4">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setStories(num)}
                          className={cn(
                            "flex-1 rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-all",
                            stories === num
                              ? "bg-primary-600 text-white ring-primary-600"
                              : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {num} Story
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Windows Input */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label htmlFor="small-windows" className="text-sm font-semibold text-gray-900">
                          Small Windows
                        </label>
                        <div className="group relative flex items-center">
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Regular sized double-hung or slider windows.
                            </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        id="small-windows"
                        min="0"
                        value={smallWindows || ''}
                        onChange={(e) => setSmallWindows(Math.max(0, parseInt(e.target.value) || 0))}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label htmlFor="large-windows" className="text-sm font-semibold text-gray-900">
                          Large Windows
                        </label>
                        <div className="group relative flex items-center">
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Large picture windows, bay windows, or patio doors.
                            </span>
                        </div>
                      </div>
                      <input
                        type="number"
                        id="large-windows"
                        min="0"
                        value={largeWindows || ''}
                        onChange={(e) => setLargeWindows(Math.max(0, parseInt(e.target.value) || 0))}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Soft Wash / Gutter / Roof Shared Property Selection */}
              {(activeServices.softWash || activeServices.gutterCleaning || activeServices.roofCleaning) && (
                <div className="animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold tracking-tight text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                        <Home className="w-5 h-5 text-gray-600" /> Property Details (for Soft Wash / Gutters / Roof)
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'townhouse', label: 'Townhouse', price: 'Standard' },
                            { id: 'semi', label: 'Semi-Detached', price: 'Medium' },
                            { id: 'detached', label: 'Detached (Standard)', price: 'Large' },
                            { id: 'large', label: 'Large Estate', price: 'Estate' },
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setHomeType(type.id as any)}
                                className={cn(
                                    "relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all",
                                    homeType === type.id
                                        ? "border-green-600 bg-green-50"
                                        : "border-gray-200 hover:border-green-200 bg-white"
                                )}
                            >
                                <span className={cn("font-semibold", homeType === type.id ? "text-green-900" : "text-gray-900")}>
                                    {type.label}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">{type.price} Size</span>
                                {homeType === type.id && <Check className="absolute top-4 right-4 w-5 h-5 text-green-600" />}
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {/* Pressure Washing Section */}
              {activeServices.pressureWashing && (
                 <div className="animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold tracking-tight text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                        <Waves className="w-5 h-5 text-blue-600" /> Pressure Washing
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold leading-6 text-gray-900 block mb-4">Driveway Cleaning</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { id: 'none', label: 'None', price: 0 },
                                    { id: 'single', label: 'Single', price: 149 },
                                    { id: 'double', label: 'Double', price: 229 },
                                    { id: 'triple', label: 'Triple', price: 329 },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setDrivewaySize(type.id as any)}
                                        className={cn(
                                            "rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-all",
                                            drivewaySize === type.id
                                            ? "bg-blue-600 text-white ring-blue-600"
                                            : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="deck-area" className="text-sm font-semibold leading-6 text-gray-900 block mb-2">
                                Deck / Patio / Walkway Area (sq ft)
                            </label>
                             <div className="relative mt-2 rounded-md shadow-sm max-w-xs">
                                <input
                                    type="number"
                                    id="deck-area"
                                    min="0"
                                    value={deckPatioArea || ''}
                                    onChange={(e) => setDeckPatioArea(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="block w-full rounded-md border-0 py-1.5 pl-4 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    placeholder="0"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-gray-500 sm:text-sm">sq ft</span>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Estimated at $0.35 per sq ft</p>
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* Empty State Help */}
            {!activeServices.windowCleaning && !activeServices.softWash && !activeServices.pressureWashing && !activeServices.gutterCleaning && !activeServices.roofCleaning && (
                <div className="text-center py-10 text-gray-500 italic">
                    Select a service above to get started.
                </div>
            )}

          </div>

          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16 sticky top-24">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">Estimated Total</p>
                
                {/* Breakdown */}
                <div className="mt-4 space-y-2 text-sm text-gray-500 border-b border-gray-200 pb-4 mb-4">
                    {activeServices.windowCleaning && (
                        <div className="flex justify-between">
                            <span>Window Cleaning:</span>
                            <span className="font-medium text-gray-900">${costs.window}</span>
                        </div>
                    )}
                    {activeServices.softWash && (
                        <div className="flex justify-between">
                            <span>Soft Wash:</span>
                            <span className="font-medium text-gray-900">${costs.softWash}</span>
                        </div>
                    )}
                    {activeServices.gutterCleaning && (
                        <div className="flex justify-between">
                            <span>Gutter Cleaning:</span>
                            <span className="font-medium text-gray-900">${costs.gutter}</span>
                        </div>
                    )}
                    {activeServices.roofCleaning && (
                        <div className="flex justify-between">
                            <span>Roof Cleaning:</span>
                            <span className="font-medium text-gray-900">${costs.roof}</span>
                        </div>
                    )}
                    {activeServices.pressureWashing && (
                        <div className="flex justify-between">
                            <span>Pressure Washing:</span>
                            <span className="font-medium text-gray-900">${costs.pressure}</span>
                        </div>
                    )}
                     {(!activeServices.windowCleaning && !activeServices.softWash && !activeServices.pressureWashing && !activeServices.gutterCleaning && !activeServices.roofCleaning) && (
                        <span className="italic text-gray-400">No services selected</span>
                    )}
                    
                    {/* Minimum Charge Display */}
                    {costs.minimumApplied && (
                        <>
                            <div className="flex justify-between pt-2 border-t border-dashed border-gray-200">
                                <span>Subtotal:</span>
                                <span className="font-medium text-gray-500">${costs.total}</span>
                            </div>
                            <div className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                                Minimum Service Charge Applied: $200 CAD
                            </div>
                        </>
                    )}
                </div>

                <p className="flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">${costs.finalTotal}</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">CAD</span>
                </p>
                
                <div className="mt-10">
                    <Link
                    href={`/contact?subject=Quote Request&message=${generateMessage()}`}
                    className="block w-full rounded-md bg-green-600 px-3 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all transform hover:scale-105"
                    >
                    Book This Price
                    </Link>
                    <p className="mt-4 text-xs text-center text-gray-500">
                        *Final price subject to on-site verification.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
