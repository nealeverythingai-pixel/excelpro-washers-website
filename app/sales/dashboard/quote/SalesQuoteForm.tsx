'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { createQuote } from './actions'
import { Save, Ruler, Building2, Eye, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const initialState = { message: '' }

// --- PRICING CONSTANTS ---
const TIER_CONFIG = {
  basic: { label: 'Basic Refresh', base: 249, description: 'Exterior windows + house wash + driveway pressure wash', color: 'blue', emoji: '🏠' },
  mid: { label: 'Home Exterior Clean', base: 599, description: 'Basic + gutters + interior windows + detailed hand-wash', color: 'green', emoji: '✨' },
  full: { label: 'Full Property Reset', base: 999, description: 'Mid + roof treatment + deck/patio + premium sealant', color: 'purple', emoji: '🌟' },
} as const

const STORY_MULTIPLIERS: Record<number, number> = { 1: 1.0, 2: 1.15, 3: 1.30 }

const WINDOW_TYPES = [
  {
    key: 'small', label: 'Small', weight: 1.0, size: '~2ft × 2ft',
    locations: 'Bathroom, basement, garage, transom above doors',
    visual: [
      '╔══════════╗',
      '║ ╭──────╮ ║',
      '║ │ ·  · │ ║',
      '║ │      │ ║',
      '║ │  ··  │ ║',
      '║ ╰──────╯ ║',
      '║     ○     ║',
      '╚══════════╝',
    ],
  },
  {
    key: 'medium', label: 'Medium', weight: 1.5, size: '~3ft × 4ft',
    locations: 'Bedrooms, kitchen, dining room, hallways',
    visual: [
      '╔═════════╦═════════╗',
      '║ ╭─────╮ ║ ╭─────╮ ║',
      '║ │     │ ║ │     │ ║',
      '║ │     │ ║ │     │ ║',
      '║ │     │ ║ │     │ ║',
      '║ │     │ ║ │     │ ║',
      '║ ╰─────╯ ║ ╰─────╯ ║',
      '║    ○     ║    ○     ║',
      '╚═════════╩═════════╝',
    ],
  },
  {
    key: 'large', label: 'Large', weight: 2.5, size: '~5ft × 6ft+',
    locations: 'Living room picture windows, sliding patio doors, bay windows',
    visual: [
      '╔══════════════════════════════╗',
      '║ ╭────────╮╭────────╮╭────────╮ ║',
      '║ │        ││   ☀    ││        │ ║',
      '║ │        ││  ╱ ╲   ││        │ ║',
      '║ │        ││ ╱   ╲  ││        │ ║',
      '║ │        ││╱ ⌂   ╲ ││        │ ║',
      '║ │        ││────────││        │ ║',
      '║ │        ││  ≋≋≋   ││        │ ║',
      '║ ╰────────╯╰────────╯╰────────╯ ║',
      '╚══════════════════════════════╝',
    ],
  },
  {
    key: 'specialty', label: 'Specialty', weight: 3.5, size: 'Varies',
    locations: 'Skylights, French doors, floor-to-ceiling, arched/custom shapes',
    visual: [
      '        ╭───────╮',
      '      ╭─┤  ☆    ├─╮',
      '    ╭─┤  ╲     ╱  ├─╮',
      '    │  ╲   ╲ ╱   ╱  │',
      '    │   ╰───┼───╯   │',
      '  ╔═╧═══════╧═══════╧═╗',
      '  ║ ╭──────╮ ╭──────╮ ║',
      '  ║ │      │ │      │ ║',
      '  ║ │      │ │      │ ║',
      '  ║ │      │ │      │ ║',
      '  ║ ╰──────╯ ╰──────╯ ║',
      '  ╚═══════════════════╝',
    ],
  },
] as const

const ADDONS = [
  { key: 'interiorWindows', label: 'Interior Windows', price: 80, emoji: '🪟' },
  { key: 'deckPatio', label: 'Deck / Patio', price: 150, emoji: '🏡' },
  { key: 'roofMoss', label: 'Roof Moss Treatment', price: 250, emoji: '🍃' },
] as const

function roundTo5(n: number) { return Math.round(n / 5) * 5 }

// Step labels for progress bar
const STEPS = ['Client', 'Property', 'Windows', 'Package', 'Add-Ons', 'Summary']

export function SalesQuoteForm() {
  // @ts-ignore — Next.js 16 formAction compat
  const [state, formAction] = useFormState(createQuote, initialState)

  const [activeStep, setActiveStep] = useState(0) // which step is expanded on mobile
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
  const houseSideM = houseDiagM / Math.SQRT2
  const houseAreaM2 = houseSideM * houseSideM
  const houseAreaSqft = Math.round(houseAreaM2 * 10.764)
  const sizeMultiplier = houseAreaSqft > 0 ? Math.max(1.0, houseAreaSqft / 2500) : 1
  const storyMultiplier = STORY_MULTIPLIERS[stories] || 1.0
  const weightedWindows = (windows.small * 1.0) + (windows.medium * 1.5) + (windows.large * 2.5) + (windows.specialty * 3.5)
  const totalWindowCount = windows.small + windows.medium + windows.large + windows.specialty
  const windowFactor = 1.0 + (weightedWindows * 0.015)
  const houseWashCost = houseAreaSqft > 0 ? roundTo5(houseAreaSqft * 0.25) : 0
  const drivewaySideM = drivewayDiagM / Math.SQRT2
  const drivewayAreaSqft = Math.round((drivewaySideM * drivewaySideM) * 10.764)
  const drivewayAddon = drivewayAreaSqft > 0 ? roundTo5(drivewayAreaSqft * 0.25) : 0
  const totalWashSqft = houseAreaSqft + drivewayAreaSqft
  const totalWashCost = houseWashCost + drivewayAddon
  const fixedAddons = ADDONS.reduce((sum, a) => sum + (addons[a.key as keyof typeof addons] ? a.price : 0), 0)
  const basePrice = TIER_CONFIG[tier].base
  const rawPrice = basePrice * sizeMultiplier * storyMultiplier * windowFactor + houseWashCost + drivewayAddon + fixedAddons
  const finalPrice = roundTo5(rawPrice)
  const contractorPay = roundTo5(finalPrice * 0.70)
  const ownerCut = finalPrice - contractorPay
  const windowPct = Math.round((windowFactor - 1) * 100)
  const windowFactorLabel = windowPct === 0 ? 'No windows' : `+${windowPct}%`

  const getItemsJSON = () => {
    const items: { description: string; quantity: number; unitPrice: number }[] = []
    items.push({ description: `${TIER_CONFIG[tier].label} Package`, quantity: 1, unitPrice: roundTo5(basePrice * sizeMultiplier * storyMultiplier * windowFactor) })
    if (houseWashCost > 0) items.push({ description: `House Washing (${houseAreaSqft.toLocaleString()} sqft)`, quantity: 1, unitPrice: houseWashCost })
    if (drivewayAddon > 0) items.push({ description: `Driveway Pressure Washing (${drivewayAreaSqft.toLocaleString()} sqft)`, quantity: 1, unitPrice: drivewayAddon })
    ADDONS.forEach(a => { if (addons[a.key as keyof typeof addons]) items.push({ description: a.label, quantity: 1, unitPrice: a.price }) })
    return JSON.stringify(items)
  }

  const quoteText = `Based on your property measurements, your ${TIER_CONFIG[tier].label} package would be $${finalPrice.toLocaleString()}. This includes all services selected. Our team can start as soon as you're ready!`

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(quoteText).then(() => {
      setQuoteCopied(true)
      setTimeout(() => setQuoteCopied(false), 2000)
    })
  }

  // Collapsible step wrapper
  const StepSection = ({ step, title, children, badge }: { step: number; title: string; children: React.ReactNode; badge?: string }) => {
    const isOpen = activeStep === step
    const isCompleted = activeStep > step
    return (
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all">
        <button type="button" onClick={() => setActiveStep(isOpen ? -1 : step)}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-gray-50 transition-colors">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors',
            isCompleted ? 'bg-green-500 text-white' : isOpen ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500')}>
            {isCompleted ? <Check className="w-4 h-4" /> : step + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-sm', isOpen ? 'text-gray-900' : 'text-gray-600')}>{title}</p>
            {badge && !isOpen && <p className="text-xs text-gray-400 truncate mt-0.5">{badge}</p>}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-300 flex-shrink-0" />}
        </button>
        <div className={cn('transition-all duration-200', isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden')}>
          <div className="px-4 pb-5 pt-1 space-y-4">
            {children}
            {/* Next button */}
            {step < 5 && (
              <button type="button" onClick={() => setActiveStep(step + 1)}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-sm active:scale-[0.98] transition-all shadow-sm">
                Continue →
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <form action={formAction} className="space-y-3 pb-28">
      {/* @ts-ignore */}
      {state?.message && (
        // @ts-ignore
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm font-medium">{state.message}</div>
      )}

      {/* ─── Progress Bar ─── */}
      <div className="flex items-center gap-1 px-1 mb-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className={cn('h-1.5 w-full rounded-full transition-colors',
              i <= activeStep ? 'bg-green-500' : 'bg-gray-200'
            )} />
            <span className={cn('text-[9px] font-semibold hidden sm:block',
              i <= activeStep ? 'text-green-600' : 'text-gray-400'
            )}>{label}</span>
          </div>
        ))}
      </div>

      {/* ═══════ STEP 1: CLIENT INFO ═══════ */}
      <StepSection step={0} title="Client Information">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="firstName" placeholder="First Name *" required inputMode="text" autoComplete="given-name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
            <input name="lastName" placeholder="Last Name *" required inputMode="text" autoComplete="family-name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
          </div>
          <input name="email" type="email" placeholder="Email *" required autoComplete="email"
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
          <input name="phone" type="tel" placeholder="Phone *" required inputMode="tel" autoComplete="tel"
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
          <input name="address" placeholder="Street Address *" required autoComplete="street-address"
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
        </div>
      </StepSection>

      {/* ═══════ STEP 2: MEASUREMENTS ═══════ */}
      <StepSection step={1} title="Property Measurements"
        badge={houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft house` : undefined}>
        <p className="text-sm text-gray-500">Measure the diagonal in Google Earth (meters).</p>

        <div className="space-y-4">
          {/* House */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-green-600" /> House Diagonal (m)
            </label>
            <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="e.g. 18.5"
              value={houseDiag} onChange={e => setHouseDiag(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" />
            {houseAreaSqft > 0 && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2.5">
                <p className="text-sm font-semibold text-green-800">≈ {houseAreaSqft.toLocaleString()} sqft</p>
                <p className="text-xs text-green-600 mt-0.5">House washing: +${houseWashCost} · Size: {sizeMultiplier.toFixed(2)}×</p>
              </div>
            )}
          </div>

          {/* Driveway */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-blue-600" /> Driveway Diagonal (m)
            </label>
            <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="e.g. 12"
              value={drivewayDiag} onChange={e => setDrivewayDiag(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" />
            {drivewayAreaSqft > 0 && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5">
                <p className="text-sm font-semibold text-blue-800">≈ {drivewayAreaSqft.toLocaleString()} sqft</p>
                <p className="text-xs text-blue-600 mt-0.5">Pressure washing: +${drivewayAddon}</p>
              </div>
            )}
          </div>

          {/* Combined total */}
          {totalWashCost > 0 && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2.5">
              <p className="text-sm font-bold text-emerald-800">💧 Total Washing: {totalWashSqft.toLocaleString()} sqft → ${totalWashCost}</p>
            </div>
          )}

          {/* Stories */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-orange-600" /> Stories
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(s => (
                <button key={s} type="button" onClick={() => setStories(s)}
                  className={cn('py-4 rounded-xl text-sm font-bold border-2 transition-all active:scale-95',
                    stories === s ? 'bg-green-50 border-green-500 text-green-800 shadow-sm' : 'bg-white border-gray-200 text-gray-500')}>
                  {s}F
                  <span className="block text-xs font-normal mt-0.5 opacity-70">×{STORY_MULTIPLIERS[s].toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </StepSection>

      {/* ═══════ STEP 3: WINDOWS ═══════ */}
      <StepSection step={2} title="Window Count"
        badge={totalWindowCount > 0 ? `${totalWindowCount} windows · ${windowFactorLabel}` : undefined}>

        {/* Visual Guide toggle */}
        <button type="button" onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 py-2.5 rounded-xl active:scale-[0.98] transition-all">
          <Eye className="w-3.5 h-3.5" /> {showGuide ? 'Hide' : 'Show'} Window Guide
        </button>

        {showGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WINDOW_TYPES.map(wt => (
              <div key={wt.key} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                {/* Visual */}
                <div className="bg-gradient-to-b from-sky-50 to-blue-50 px-3 py-4 flex items-center justify-center border-b border-gray-100">
                  <pre className="text-[9px] sm:text-[10px] leading-[1.3] text-sky-800/70 font-mono select-none whitespace-pre">{wt.visual.join('\n')}</pre>
                </div>
                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{wt.label}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{wt.size}</p>
                    </div>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-lg">{wt.weight}×</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-600">📍 </span>{wt.locations}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Window Counters — 2 column grid with big touch targets */}
        <div className="grid grid-cols-2 gap-3">
          {WINDOW_TYPES.map(wt => (
            <div key={wt.key} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-700 mb-2">{wt.label} <span className="text-gray-400">({wt.weight}×)</span></p>
              <div className="flex items-center justify-center gap-3">
                <button type="button" onClick={() => setWindows(p => ({ ...p, [wt.key]: Math.max(0, p[wt.key as keyof typeof p] - 1) }))}
                  className="w-11 h-11 rounded-full bg-white border-2 border-gray-200 text-gray-600 font-bold text-xl flex items-center justify-center active:scale-90 active:bg-gray-100 transition-all shadow-sm">−</button>
                <span className="text-2xl font-bold text-gray-900 w-10 text-center tabular-nums">{windows[wt.key as keyof typeof windows]}</span>
                <button type="button" onClick={() => setWindows(p => ({ ...p, [wt.key]: p[wt.key as keyof typeof p] + 1 }))}
                  className="w-11 h-11 rounded-full bg-green-500 text-white font-bold text-xl flex items-center justify-center active:scale-90 active:bg-green-600 transition-all shadow-sm">+</button>
              </div>
            </div>
          ))}
        </div>

        {totalWindowCount > 0 && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2.5 flex items-center justify-between">
            <span className="text-sm text-gray-700">{totalWindowCount} windows ({weightedWindows.toFixed(1)} weighted)</span>
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold',
              windowPct <= 10 ? 'bg-green-100 text-green-700' :
              windowPct <= 25 ? 'bg-blue-100 text-blue-700' :
              windowPct <= 40 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            )}>
              {windowFactor.toFixed(2)}× ({windowFactorLabel})
            </span>
          </div>
        )}
      </StepSection>

      {/* ═══════ STEP 4: PACKAGE ═══════ */}
      <StepSection step={3} title="Package Selection"
        badge={`${TIER_CONFIG[tier].label} — $${basePrice}`}>
        <div className="space-y-3">
          {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => (
            <button key={key} type="button" onClick={() => setTier(key)}
              className={cn('w-full relative p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]',
                tier === key
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200 shadow-sm'
                  : 'border-gray-200 bg-white')}>
              {key === 'full' && <span className="absolute -top-2 right-3 text-[10px] font-bold bg-purple-600 text-white px-2.5 py-0.5 rounded-full">BEST VALUE</span>}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{cfg.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{cfg.label}</p>
                    <p className="text-xl font-extrabold text-green-700">${cfg.base}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cfg.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </StepSection>

      {/* ═══════ STEP 5: ADD-ONS ═══════ */}
      <StepSection step={4} title="Add-Ons"
        badge={fixedAddons > 0 || totalWashCost > 0 ? `+$${fixedAddons + totalWashCost} in extras` : undefined}>
        <div className="space-y-2">
          {ADDONS.map(a => (
            <label key={a.key}
              className={cn('flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]',
                addons[a.key as keyof typeof addons] ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white')}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={addons[a.key as keyof typeof addons]}
                  onChange={() => setAddons(p => ({ ...p, [a.key]: !p[a.key as keyof typeof p] }))}
                  className="w-5 h-5 text-green-600 rounded-lg border-gray-300 focus:ring-green-500" />
                <span className="text-sm font-medium text-gray-800">{a.emoji} {a.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-600">+${a.price}</span>
            </label>
          ))}

          {/* Auto-included services */}
          {(houseWashCost > 0 || drivewayAddon > 0) && (
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto-included from measurements</p>
              {houseWashCost > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                  <span className="text-sm font-medium text-green-800">🏠 House Washing ({houseAreaSqft.toLocaleString()} sqft)</span>
                  <span className="text-sm font-bold text-green-700">+${houseWashCost}</span>
                </div>
              )}
              {drivewayAddon > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">🚗 Driveway Pressure Wash ({drivewayAreaSqft.toLocaleString()} sqft)</span>
                  <span className="text-sm font-bold text-blue-700">+${drivewayAddon}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </StepSection>

      {/* ═══════ STEP 6: SUMMARY ═══════ */}
      <StepSection step={5} title="Quote Summary"
        badge={`$${finalPrice.toLocaleString()}`}>

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Base ({TIER_CONFIG[tier].label})</span><span>${basePrice}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Size ({houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft` : 'N/A'})</span><span>×{sizeMultiplier.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Stories ({stories}F)</span><span>×{storyMultiplier.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Windows ({weightedWindows.toFixed(1)}w)</span><span>×{windowFactor.toFixed(2)}</span>
          </div>
          {houseWashCost > 0 && (
            <div className="flex justify-between text-gray-600"><span>House wash</span><span>+${houseWashCost}</span></div>
          )}
          {drivewayAddon > 0 && (
            <div className="flex justify-between text-gray-600"><span>Driveway wash</span><span>+${drivewayAddon}</span></div>
          )}
          {totalWashCost > 0 && (
            <div className="flex justify-between font-medium text-emerald-700"><span>Total washing ({totalWashSqft.toLocaleString()} sqft)</span><span>${totalWashCost}</span></div>
          )}
          {fixedAddons > 0 && (
            <div className="flex justify-between text-gray-600"><span>Add-ons</span><span>+${fixedAddons}</span></div>
          )}
        </div>

        {/* Total */}
        <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium">Client Quote</p>
              <p className="text-3xl font-extrabold tracking-tight">${finalPrice.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-200">Sub: ${contractorPay.toLocaleString()}</p>
              <p className="text-xs text-green-200">You: ${ownerCut.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Copy Quote */}
        <div className="space-y-2">
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 italic leading-relaxed border border-gray-200">
            &ldquo;{quoteText}&rdquo;
          </div>
          <button type="button" onClick={handleCopyQuote}
            className={cn('w-full text-center text-sm font-semibold py-3 rounded-xl transition-all active:scale-[0.98]',
              quoteCopied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 active:bg-gray-200')}>
            {quoteCopied ? '✓ Copied!' : '📋 Copy Quote Text'}
          </button>
        </div>
      </StepSection>

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

      {/* ─── Sticky Bottom: Price + Submit ─── */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200/80 shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">${finalPrice.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-medium">Sub ${contractorPay.toLocaleString()} · You ${ownerCut.toLocaleString()}</p>
          </div>
          <button type="submit"
            className="flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 py-3.5 px-6 text-sm font-bold text-white shadow-lg active:scale-[0.96] transition-all whitespace-nowrap">
            <Save className="w-4 h-4" /> Save Quote
          </button>
        </div>
      </div>
    </form>
  )
}
