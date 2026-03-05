'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { createQuote } from './actions'
import { Save, Ruler, Building2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const initialState = { message: '' }

// --- PRICING CONSTANTS ---
const TIER_CONFIG = {
  basic: { label: 'Basic Refresh', base: 249, description: 'Exterior windows + house wash + driveway pressure wash', color: 'blue' },
  mid: { label: 'Home Exterior Clean', base: 599, description: 'Basic + gutters + interior windows + detailed hand-wash', color: 'green' },
  full: { label: 'Full Property Reset', base: 999, description: 'Mid + roof treatment + deck/patio + premium sealant', color: 'purple' },
} as const

const STORY_MULTIPLIERS: Record<number, number> = { 1: 1.0, 2: 1.15, 3: 1.30 }

const WINDOW_TYPES = [
  {
    key: 'small', label: 'Small', weight: 1.0, size: '~2ft × 2ft',
    locations: 'Bathroom, basement, garage, transom above doors',
    visual: [
      '┌──────┐',
      '│      │',
      '│  ▪   │',
      '│      │',
      '└──────┘',
    ],
  },
  {
    key: 'medium', label: 'Medium', weight: 1.5, size: '~3ft × 4ft',
    locations: 'Bedrooms, kitchen, dining room, hallways',
    visual: [
      '┌─────┬─────┐',
      '│     │     │',
      '│     │     │',
      '│     │     │',
      '│     │     │',
      '└─────┴─────┘',
    ],
  },
  {
    key: 'large', label: 'Large', weight: 2.5, size: '~5ft × 6ft+',
    locations: 'Living room picture windows, sliding patio doors, bay windows',
    visual: [
      '┌───────────────────┐',
      '│                   │',
      '│     ☀             │',
      '│        ⌂          │',
      '│                   │',
      '│                   │',
      '└───────────────────┘',
    ],
  },
  {
    key: 'specialty', label: 'Specialty', weight: 3.5, size: 'Varies',
    locations: 'Skylights, French doors, floor-to-ceiling, arched/custom shapes',
    visual: [
      '      ╱╲',
      '    ╱    ╲',
      '  ╱        ╲',
      '  │  ┌──┐  │',
      '  │  │  │  │',
      '  │  │  │  │',
      '  └──┴──┴──┘',
    ],
  },
] as const

const ADDONS = [
  { key: 'interiorWindows', label: 'Interior Window Cleaning', price: 80 },
  { key: 'deckPatio', label: 'Deck / Patio Cleaning', price: 150 },
  { key: 'roofMoss', label: 'Roof Moss / Algae Treatment', price: 250 },
] as const

// Round to nearest $5
function roundTo5(n: number) { return Math.round(n / 5) * 5 }

export function SalesQuoteForm() {
  // @ts-ignore — Next.js 16 formAction compat
  const [state, formAction] = useFormState(createQuote, initialState)

  // --- State ---
  const [houseDiag, setHouseDiag] = useState<string>('')
  const [drivewayDiag, setDrivewayDiag] = useState<string>('')
  const [stories, setStories] = useState<number>(2)
  const [tier, setTier] = useState<'basic' | 'mid' | 'full'>('mid')
  const [windows, setWindows] = useState({ small: 0, medium: 0, large: 0, specialty: 0 })
  const [addons, setAddons] = useState({ interiorWindows: false, deckPatio: false, roofMoss: false })
  const [showGuide, setShowGuide] = useState(false)
  const [quoteCopied, setQuoteCopied] = useState(false)

  // --- Calculations ---
  const houseDiagM = parseFloat(houseDiag) || 0
  const drivewayDiagM = parseFloat(drivewayDiag) || 0

  // Diagonal → side → area → sqft
  const houseSideM = houseDiagM / Math.SQRT2
  const houseAreaM2 = houseSideM * houseSideM
  const houseAreaSqft = Math.round(houseAreaM2 * 10.764)

  // Size multiplier (baseline 2500 sqft) — floor of 1.0 so base price is the minimum
  const sizeMultiplier = houseAreaSqft > 0 ? Math.max(1.0, houseAreaSqft / 2500) : 1

  // Story multiplier
  const storyMultiplier = STORY_MULTIPLIERS[stories] || 1.0

  // Window factor — continuous scaling: +1.5% per weighted window
  const weightedWindows = (windows.small * 1.0) + (windows.medium * 1.5) + (windows.large * 2.5) + (windows.specialty * 3.5)
  const totalWindowCount = windows.small + windows.medium + windows.large + windows.specialty
  const windowFactor = 1.0 + (weightedWindows * 0.015)

  // Driveway pressure washing — any measurement = pressure wash service ($0.25/sqft)
  const drivewaySideM = drivewayDiagM / Math.SQRT2
  const drivewayAreaSqft = Math.round((drivewaySideM * drivewaySideM) * 10.764)
  const drivewayAddon = drivewayAreaSqft > 0 ? roundTo5(drivewayAreaSqft * 0.25) : 0

  // Fixed add-ons
  const fixedAddons = ADDONS.reduce((sum, a) => sum + (addons[a.key as keyof typeof addons] ? a.price : 0), 0)

  // FINAL PRICE
  const basePrice = TIER_CONFIG[tier].base
  const rawPrice = basePrice * sizeMultiplier * storyMultiplier * windowFactor + drivewayAddon + fixedAddons
  const finalPrice = roundTo5(rawPrice)

  // 70/30 split
  const contractorPay = roundTo5(finalPrice * 0.70)
  const ownerCut = finalPrice - contractorPay

  // Window factor label
  const windowPct = Math.round((windowFactor - 1) * 100)
  const windowFactorLabel = windowPct === 0 ? 'No windows' : `+${windowPct}%`

  // Build items JSON for DB
  const getItemsJSON = () => {
    const items: { description: string; quantity: number; unitPrice: number }[] = []
    items.push({ description: `${TIER_CONFIG[tier].label} Package`, quantity: 1, unitPrice: roundTo5(basePrice * sizeMultiplier * storyMultiplier * windowFactor) })
    if (drivewayAddon > 0) items.push({ description: `Driveway Pressure Washing (${drivewayAreaSqft} sqft)`, quantity: 1, unitPrice: drivewayAddon })
    ADDONS.forEach(a => { if (addons[a.key as keyof typeof addons]) items.push({ description: a.label, quantity: 1, unitPrice: a.price }) })
    return JSON.stringify(items)
  }

  // Copy-ready quote
  const quoteText = `Based on your property measurements, your ${TIER_CONFIG[tier].label} package would be $${finalPrice.toLocaleString()}. This includes all services selected. Our team can start as soon as you're ready!`

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(quoteText).then(() => {
      setQuoteCopied(true)
      setTimeout(() => setQuoteCopied(false), 2000)
    })
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* @ts-ignore */}
      {state?.message && (
        // @ts-ignore
        <div className="rounded-md bg-red-50 p-4 text-red-700 text-sm">{state.message}</div>
      )}

      {/* ======== STEP 1: CLIENT INFO ======== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">1</span>
          <h3 className="text-lg font-semibold">Client Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="firstName" placeholder="First Name *" required className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          <input name="lastName" placeholder="Last Name *" required className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          <input name="email" type="email" placeholder="Email *" required className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          <input name="phone" type="tel" placeholder="Phone *" required className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          <input name="address" placeholder="Street Address *" required className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:col-span-2" />
        </div>
      </section>

      {/* ======== STEP 2: GOOGLE EARTH MEASUREMENTS ======== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">2</span>
          <h3 className="text-lg font-semibold">Property Measurements</h3>
        </div>
        <p className="text-sm text-gray-500">Measure the diagonal in Google Earth (meters). We auto-convert to area.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Ruler className="w-4 h-4" /> House Diagonal (m)</label>
            <input type="number" step="0.1" min="0" placeholder="e.g. 18.5" value={houseDiag} onChange={e => setHouseDiag(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            {houseAreaSqft > 0 && (
              <p className="text-xs text-green-700 font-medium">≈ {houseAreaSqft.toLocaleString()} sq ft &nbsp;|&nbsp; Size multiplier: {sizeMultiplier.toFixed(2)}×</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Ruler className="w-4 h-4" /> Driveway Diagonal (m)</label>
            <input type="number" step="0.1" min="0" placeholder="e.g. 12" value={drivewayDiag} onChange={e => setDrivewayDiag(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            {drivewayAreaSqft > 0 && (
              <p className="text-xs text-green-700 font-medium">≈ {drivewayAreaSqft.toLocaleString()} sqft → Pressure washing: +${drivewayAddon}</p>
            )}
          </div>
        </div>

        {/* Stories */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1"><Building2 className="w-4 h-4" /> Number of Stories</label>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <button key={s} type="button" onClick={() => setStories(s)}
                className={cn('flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-all',
                  stories === s ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}>
                {s} {s === 1 ? 'Story' : 'Stories'}
                <span className="block text-xs font-normal mt-0.5 opacity-70">×{STORY_MULTIPLIERS[s].toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======== STEP 3: WINDOW COUNT ======== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">3</span>
            <h3 className="text-lg font-semibold">Window Count</h3>
          </div>
          <button type="button" onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
            <Eye className="w-3.5 h-3.5" /> {showGuide ? 'Hide' : 'Show'} Window Guide
          </button>
        </div>

        {/* VISUAL WINDOW GUIDE */}
        {showGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WINDOW_TYPES.map(wt => (
              <div key={wt.key} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{wt.label}</p>
                    <p className="text-xs text-gray-500">{wt.size}</p>
                  </div>
                  <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{wt.weight}×</span>
                </div>
                {/* ASCII Visual */}
                <div className="bg-white border border-dashed border-gray-200 rounded-lg p-3 mb-2 flex items-center justify-center">
                  <pre className="text-xs leading-tight text-gray-600 font-mono select-none">{wt.visual.join('\n')}</pre>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-medium text-gray-700">Where to find: </span>{wt.locations}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Window Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WINDOW_TYPES.map(wt => (
            <div key={wt.key} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs font-medium text-gray-600 mb-1">{wt.label} <span className="text-gray-400">({wt.weight}×)</span></p>
              <div className="flex items-center justify-center gap-2">
                <button type="button" onClick={() => setWindows(p => ({ ...p, [wt.key]: Math.max(0, p[wt.key as keyof typeof p] - 1) }))}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors">−</button>
                <span className="text-xl font-bold text-gray-900 w-8 text-center">{windows[wt.key as keyof typeof windows]}</span>
                <button type="button" onClick={() => setWindows(p => ({ ...p, [wt.key]: p[wt.key as keyof typeof p] + 1 }))}
                  className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-700 font-bold text-lg flex items-center justify-center transition-colors">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Window Summary */}
        {totalWindowCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-sm px-1">
            <span className="text-gray-600">{totalWindowCount} windows ({weightedWindows.toFixed(1)} weighted)</span>
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold',
              windowPct <= 10 ? 'bg-green-100 text-green-700' :
              windowPct <= 25 ? 'bg-blue-100 text-blue-700' :
              windowPct <= 40 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            )}>
              Window factor: {windowFactor.toFixed(2)}× ({windowFactorLabel})
            </span>
          </div>
        )}

        {/* Quick Reference */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">⚡ Quick Reference for Reps — +1.5% per weighted window</p>
          <p>5 weighted → +8% &nbsp;|&nbsp; 10 → +15% &nbsp;|&nbsp; 20 → +30% &nbsp;|&nbsp; 30 → +45% &nbsp;|&nbsp; 40+ → +60%+</p>
        </div>
      </section>

      {/* ======== STEP 4: PACKAGE TIER ======== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">4</span>
          <h3 className="text-lg font-semibold">Package Selection</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => (
            <button key={key} type="button" onClick={() => setTier(key)}
              className={cn('relative p-4 rounded-xl border-2 text-left transition-all',
                tier === key
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-200 bg-white hover:border-gray-300')}>
              {key === 'full' && <span className="absolute -top-2 right-3 text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">BEST VALUE</span>}
              <p className="font-bold text-gray-900">{cfg.label}</p>
              <p className="text-2xl font-extrabold text-green-700 mt-1">${cfg.base}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cfg.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ======== STEP 5: ADD-ONS ======== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">5</span>
          <h3 className="text-lg font-semibold">Optional Add-Ons</h3>
        </div>
        <div className="space-y-2">
          {ADDONS.map(a => (
            <label key={a.key}
              className={cn('flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all',
                addons[a.key as keyof typeof addons] ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300')}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={addons[a.key as keyof typeof addons]}
                  onChange={() => setAddons(p => ({ ...p, [a.key]: !p[a.key as keyof typeof p] }))}
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                <span className="text-sm font-medium text-gray-800">{a.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-600">+${a.price}</span>
            </label>
          ))}
          {drivewayAddon > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg border-2 border-green-300 bg-green-50">
              <span className="text-sm font-medium text-green-800">🚗 Driveway Pressure Washing ({drivewayAreaSqft.toLocaleString()} sqft)</span>
              <span className="text-sm font-bold text-green-700">+${drivewayAddon}</span>
            </div>
          )}
        </div>
      </section>

      {/* ======== STEP 6: PRICE SUMMARY ======== */}
      <section className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">6</span>
          <h3 className="text-lg font-semibold text-gray-900">Quote Summary</h3>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Base ({TIER_CONFIG[tier].label})</span><span>${basePrice}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Size multiplier ({houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft` : 'N/A'})</span><span>×{sizeMultiplier.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Story multiplier ({stories} {stories === 1 ? 'story' : 'stories'})</span><span>×{storyMultiplier.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Window factor ({weightedWindows.toFixed(1)} weighted)</span><span>×{windowFactor.toFixed(2)}</span>
          </div>
          {drivewayAddon > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Driveway pressure wash ({drivewayAreaSqft.toLocaleString()} sqft)</span><span>+${drivewayAddon}</span>
            </div>
          )}
          {fixedAddons > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Add-ons</span><span>+${fixedAddons}</span>
            </div>
          )}
          <div className="border-t border-green-300 pt-3 mt-3">
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold text-gray-900">Client Quote</span>
              <span className="text-3xl font-extrabold text-green-700">${finalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payout Split */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 rounded-lg p-3 text-center border border-green-200">
            <p className="text-xs text-gray-500 font-medium">Contractor (70%)</p>
            <p className="text-xl font-bold text-blue-700">${contractorPay.toLocaleString()}</p>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center border border-green-200">
            <p className="text-xs text-gray-500 font-medium">Owner (30%)</p>
            <p className="text-xl font-bold text-green-700">${ownerCut.toLocaleString()}</p>
          </div>
        </div>

        {/* Copy-Ready Quote */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Copy-Ready Quote for Client</p>
          <div className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-gray-200 italic leading-relaxed">
            &ldquo;{quoteText}&rdquo;
          </div>
          <button type="button" onClick={handleCopyQuote}
            className={cn('w-full text-center text-sm font-medium py-2 rounded-lg transition-all',
              quoteCopied ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-300 hover:bg-green-50')}>
            {quoteCopied ? '✓ Copied!' : '📋 Copy Quote Text'}
          </button>
        </div>

        {/* Hidden form fields */}
        <input type="hidden" name="total" value={finalPrice} />
        <input type="hidden" name="items" value={getItemsJSON()} />
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="contractorPay" value={contractorPay} />
        <input type="hidden" name="ownerCut" value={ownerCut} />
        <input type="hidden" name="houseAreaSqft" value={houseAreaSqft} />
        <input type="hidden" name="windowFactor" value={windowFactor} />
        <input type="hidden" name="sizeMultiplier" value={sizeMultiplier.toFixed(2)} />
        <input type="hidden" name="storyMultiplier" value={storyMultiplier.toFixed(2)} />

        {/* Submit */}
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 py-4 px-6 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98]">
          <Save className="w-5 h-5" /> Save Quote &amp; Client
        </button>
      </section>
    </form>
  )
}
