'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { createQuote } from './actions'
import { Save, Ruler, Building2, Eye, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const initialState = { message: '' }

// --- PRICING CONSTANTS ---
const STORY_MULTIPLIERS: Record<number, number> = { 1: 1.0, 2: 1.15, 3: 1.30 }

// Per-service rates
const EXT_WINDOW_RATE  = 10    // $10 per weighted window unit (exterior)
const INT_WINDOW_RATE  = 10    // base rate — 20% off when bundled with exterior
const SIDING_RATE      = 0.35  // $0.35/sqft
const DRIVEWAY_RATE    = 0.25  // $0.25/sqft
const GUTTER_RATE      = 5     // $5 per linear meter of perimeter × story multiplier
const GUTTER_MIN       = 150   // minimum $150
const DECK_RATE        = 0.40  // $0.40/sqft
const ROOF_RATE        = 0.60  // $0.60/sqft (premium)
const ROOF_MIN         = 400   // minimum $400

// Floor rates — Ottawa market minimum (rep's negotiation floor, best price offer)
const EXT_WINDOW_FLOOR  = 7    // $7/weighted unit
const INT_WINDOW_FLOOR  = 6    // $6/weighted unit (bundle 20% still applies on top)
const SIDING_FLOOR      = 0.30 // $0.30/sqft
const DRIVEWAY_FLOOR    = 0.20 // $0.20/sqft
const DECK_FLOOR        = 0.30 // $0.30/sqft
const ROOF_FLOOR        = 0.45 // $0.45/sqft, min $400

const WINDOW_TYPES = [
  { key: 'small', label: 'Small', weight: 1.0, size: '~2ft × 2ft', locations: 'Bathroom, basement, garage, transom above doors' },
  { key: 'medium', label: 'Medium', weight: 1.5, size: '~3ft × 4ft', locations: 'Bedrooms, kitchen, dining room, hallways' },
  { key: 'large', label: 'Large', weight: 2.5, size: '~5ft × 6ft+', locations: 'Living room picture windows, sliding patio doors, bay windows' },
  { key: 'specialty', label: 'Specialty', weight: 3.5, size: 'Varies', locations: 'Skylights, French doors, floor-to-ceiling, arched/custom shapes' },
] as const

// SVG Window Illustrations
function WindowSVG({ type }: { type: string }) {
  const glass = '#dbeafe'
  const glassStroke = '#93c5fd'
  const frame = '#78716c'
  const frameDark = '#57534e'
  const sill = '#a8a29e'
  const sky = '#e0f2fe'
  const sun = '#fbbf24'

  if (type === 'small') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Wall */}
        <rect x="0" y="0" width="100" height="100" rx="4" fill="#f5f5f4" />
        {/* Outer frame */}
        <rect x="18" y="12" width="64" height="72" rx="3" fill={frameDark} />
        {/* Glass pane */}
        <rect x="22" y="16" width="56" height="64" rx="2" fill={glass} stroke={glassStroke} strokeWidth="0.5" />
        {/* Frosted pattern */}
        <circle cx="38" cy="38" r="6" fill="white" opacity="0.4" />
        <circle cx="58" cy="52" r="4" fill="white" opacity="0.3" />
        <circle cx="48" cy="44" r="8" fill="white" opacity="0.25" />
        {/* Cross divider */}
        <line x1="50" y1="16" x2="50" y2="80" stroke={frame} strokeWidth="2.5" />
        <line x1="22" y1="48" x2="78" y2="48" stroke={frame} strokeWidth="2.5" />
        {/* Handle */}
        <rect x="54" y="44" width="8" height="3" rx="1" fill={sill} />
        {/* Sill */}
        <rect x="14" y="82" width="72" height="6" rx="2" fill={sill} />
      </svg>
    )
  }

  if (type === 'medium') {
    return (
      <svg viewBox="0 0 120 140" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Wall */}
        <rect x="0" y="0" width="120" height="140" rx="4" fill="#f5f5f4" />
        {/* Outer frame */}
        <rect x="10" y="10" width="100" height="112" rx="3" fill={frameDark} />
        {/* Left pane */}
        <rect x="14" y="14" width="44" height="104" rx="2" fill={glass} stroke={glassStroke} strokeWidth="0.5" />
        {/* Right pane */}
        <rect x="62" y="14" width="44" height="104" rx="2" fill={glass} stroke={glassStroke} strokeWidth="0.5" />
        {/* Horizontal divider left */}
        <line x1="14" y1="66" x2="58" y2="66" stroke={frame} strokeWidth="2.5" />
        {/* Horizontal divider right */}
        <line x1="62" y1="66" x2="106" y2="66" stroke={frame} strokeWidth="2.5" />
        {/* Center mullion */}
        <rect x="56" y="10" width="8" height="112" rx="1" fill={frameDark} />
        {/* Left handle */}
        <rect x="46" y="62" width="8" height="3" rx="1" fill={sill} />
        {/* Right handle */}
        <rect x="66" y="62" width="8" height="3" rx="1" fill={sill} />
        {/* Sky reflection top-left */}
        <circle cx="30" cy="36" r="8" fill="white" opacity="0.3" />
        <circle cx="82" cy="36" r="6" fill="white" opacity="0.25" />
        {/* Sill */}
        <rect x="6" y="120" width="108" height="8" rx="3" fill={sill} />
        <rect x="8" y="126" width="104" height="4" rx="2" fill="#d6d3d1" />
      </svg>
    )
  }

  if (type === 'large') {
    return (
      <svg viewBox="0 0 180 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Wall */}
        <rect x="0" y="0" width="180" height="120" rx="4" fill="#f5f5f4" />
        {/* Outer frame */}
        <rect x="8" y="8" width="164" height="96" rx="3" fill={frameDark} />
        {/* Left pane */}
        <rect x="12" y="12" width="50" height="88" rx="2" fill={glass} stroke={glassStroke} strokeWidth="0.5" />
        {/* Center pane (picture window) */}
        <rect x="65" y="12" width="50" height="88" rx="2" fill={sky} stroke={glassStroke} strokeWidth="0.5" />
        {/* Right pane */}
        <rect x="118" y="12" width="50" height="88" rx="2" fill={glass} stroke={glassStroke} strokeWidth="0.5" />
        {/* Mullions */}
        <rect x="60" y="8" width="7" height="96" rx="1" fill={frameDark} />
        <rect x="113" y="8" width="7" height="96" rx="1" fill={frameDark} />
        {/* Sun in center pane */}
        <circle cx="90" cy="32" r="10" fill={sun} />
        <line x1="90" y1="18" x2="90" y2="22" stroke={sun} strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="42" x2="90" y2="46" stroke={sun} strokeWidth="2" strokeLinecap="round" />
        <line x1="76" y1="32" x2="80" y2="32" stroke={sun} strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="32" x2="104" y2="32" stroke={sun} strokeWidth="2" strokeLinecap="round" />
        {/* Landscape in center */}
        <path d="M65 75 L80 55 L90 65 L100 50 L115 75 Z" fill="#86efac" opacity="0.6" />
        <path d="M65 80 L75 68 L90 78 L105 65 L115 80 Z" fill="#4ade80" opacity="0.5" />
        {/* House silhouette */}
        <path d="M83 75 L90 65 L97 75 Z" fill="#a3a3a3" opacity="0.4" />
        <rect x="86" y="70" width="8" height="10" rx="0.5" fill="#a3a3a3" opacity="0.4" />
        {/* Reflection on side panes */}
        <circle cx="37" cy="40" r="10" fill="white" opacity="0.25" />
        <circle cx="143" cy="40" r="8" fill="white" opacity="0.2" />
        {/* Sill */}
        <rect x="4" y="102" width="172" height="8" rx="3" fill={sill} />
        <rect x="6" y="108" width="168" height="4" rx="2" fill="#d6d3d1" />
      </svg>
    )
  }

  // Specialty — arched top with French doors
  return (
    <svg viewBox="0 0 140 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Wall */}
      <rect x="0" y="0" width="140" height="160" rx="4" fill="#f5f5f4" />
      {/* Arched top */}
      <path d="M20 60 Q20 14 70 14 Q120 14 120 60 L120 60 L20 60 Z" fill={frameDark} />
      <path d="M24 60 Q24 18 70 18 Q116 18 116 60 L116 60 L24 60 Z" fill={sky} />
      {/* Arch spokes (fan pattern) */}
      <line x1="70" y1="58" x2="38" y2="30" stroke={frame} strokeWidth="1.5" />
      <line x1="70" y1="58" x2="52" y2="22" stroke={frame} strokeWidth="1.5" />
      <line x1="70" y1="58" x2="70" y2="18" stroke={frame} strokeWidth="1.5" />
      <line x1="70" y1="58" x2="88" y2="22" stroke={frame} strokeWidth="1.5" />
      <line x1="70" y1="58" x2="102" y2="30" stroke={frame} strokeWidth="1.5" />
      {/* Arch base bar */}
      <rect x="20" y="56" width="100" height="6" rx="1" fill={frameDark} />
      {/* Door frame */}
      <rect x="20" y="60" width="100" height="88" rx="2" fill={frameDark} />
      {/* Left door */}
      <rect x="24" y="64" width="44" height="80" rx="2" fill={glass} stroke={glassStroke} strokeWidth="0.5" />
      {/* Right door */}
      <rect x="72" y="64" width="44" height="80" rx="2" fill={glass} stroke={glassStroke} strokeWidth="0.5" />
      {/* Left door grid */}
      <line x1="24" y1="92" x2="68" y2="92" stroke={frame} strokeWidth="1.5" />
      <line x1="24" y1="118" x2="68" y2="118" stroke={frame} strokeWidth="1.5" />
      <line x1="46" y1="64" x2="46" y2="144" stroke={frame} strokeWidth="1.5" />
      {/* Right door grid */}
      <line x1="72" y1="92" x2="116" y2="92" stroke={frame} strokeWidth="1.5" />
      <line x1="72" y1="118" x2="116" y2="118" stroke={frame} strokeWidth="1.5" />
      <line x1="94" y1="64" x2="94" y2="144" stroke={frame} strokeWidth="1.5" />
      {/* Door handles */}
      <circle cx="64" cy="106" r="2.5" fill={sill} />
      <circle cx="76" cy="106" r="2.5" fill={sill} />
      {/* Reflections */}
      <circle cx="36" cy="78" r="6" fill="white" opacity="0.3" />
      <circle cx="100" cy="80" r="5" fill="white" opacity="0.25" />
      {/* Star in arch */}
      <circle cx="70" cy="36" r="4" fill={sun} opacity="0.6" />
      {/* Sill */}
      <rect x="16" y="146" width="108" height="6" rx="2" fill={sill} />
    </svg>
  )
}

function roundTo5(n: number) { return Math.round(n / 5) * 5 }

// Step labels for progress bar
const STEPS = ['Client', 'Property', 'Windows', 'Services', 'Summary']

export function SalesQuoteForm() {
  // @ts-ignore — Next.js 16 formAction compat
  const [state, formAction] = useFormState(createQuote, initialState)

  const [activeStep, setActiveStep] = useState(0) // which step is expanded on mobile
  const [houseDiag, setHouseDiag] = useState<string>('')
  const [drivewayDiag, setDrivewayDiag] = useState<string>('')
  const [stories, setStories] = useState<number>(2)
  const [windows, setWindows] = useState({ small: 0, medium: 0, large: 0, specialty: 0 })
  const [services, setServices] = useState({
    exteriorWindows: false,
    interiorWindows: false,
    houseSiding: false,
    drivewayWash: false,
    gutterCleaning: false,
    deckPatio: false,
    roofMoss: false,
  })
  const [deckDiag, setDeckDiag] = useState<string>('')
  const toggleService = (key: keyof typeof services) =>
    setServices(p => ({ ...p, [key]: !p[key] }))
  const [showGuide, setShowGuide] = useState(false)
  const [quoteCopied, setQuoteCopied] = useState(false)
  const [bestPriceMode, setBestPriceMode] = useState(false)
  const [leadSource, setLeadSource] = useState<'given' | 'produced'>('given')

  // --- Measurements ---
  const houseDiagM = parseFloat(houseDiag) || 0
  const drivewayDiagM = parseFloat(drivewayDiag) || 0
  const houseSideM = houseDiagM / Math.SQRT2
  const houseAreaSqft = Math.round(houseSideM * houseSideM * 10.764)
  const housePerimeterM = houseSideM * 4
  const storyMultiplier = STORY_MULTIPLIERS[stories] || 1.0
  const drivewaySideM = drivewayDiagM / Math.SQRT2
  const drivewayAreaSqft = Math.round(drivewaySideM * drivewaySideM * 10.764)
  const deckDiagM = parseFloat(deckDiag) || 0
  const deckAreaSqft = Math.round((deckDiagM / Math.SQRT2) ** 2 * 10.764)
  const weightedWindows = (windows.small * 1.0) + (windows.medium * 1.5) + (windows.large * 2.5) + (windows.specialty * 3.5)
  const totalWindowCount = windows.small + windows.medium + windows.large + windows.specialty

  // --- Per-service price estimates (shown even before toggling) ---
  const extWindowPrice  = roundTo5(weightedWindows * EXT_WINDOW_RATE)
  const intWindowPrice  = roundTo5(weightedWindows * INT_WINDOW_RATE * (services.exteriorWindows ? 0.80 : 1.0))
  const sidingPrice     = houseAreaSqft > 0 ? roundTo5(houseAreaSqft * SIDING_RATE) : 0
  const drivewayPrice   = drivewayAreaSqft > 0 ? roundTo5(drivewayAreaSqft * DRIVEWAY_RATE) : 0
  const gutterPrice     = houseAreaSqft > 0 ? roundTo5(Math.max(GUTTER_MIN, housePerimeterM * GUTTER_RATE * storyMultiplier)) : GUTTER_MIN
  const deckPrice       = deckAreaSqft > 0 ? roundTo5(deckAreaSqft * DECK_RATE) : 0
  const roofPrice       = houseAreaSqft > 0 ? roundTo5(Math.max(ROOF_MIN, houseAreaSqft * ROOF_RATE)) : ROOF_MIN

  // --- Floor prices (best price / negotiation offer) ---
  const extWindowFloor  = roundTo5(weightedWindows * EXT_WINDOW_FLOOR)
  const intWindowFloor  = roundTo5(weightedWindows * INT_WINDOW_FLOOR * (services.exteriorWindows ? 0.80 : 1.0))
  const sidingFloor     = houseAreaSqft > 0 ? roundTo5(houseAreaSqft * SIDING_FLOOR) : 0
  const drivewayFloor   = drivewayAreaSqft > 0 ? roundTo5(drivewayAreaSqft * DRIVEWAY_FLOOR) : 0
  const gutterFloor     = houseAreaSqft > 0 ? roundTo5(Math.max(GUTTER_MIN, housePerimeterM * GUTTER_RATE * storyMultiplier * 0.85)) : GUTTER_MIN
  const deckFloor       = deckAreaSqft > 0 ? roundTo5(deckAreaSqft * DECK_FLOOR) : 0
  const roofFloor       = houseAreaSqft > 0 ? roundTo5(Math.max(ROOF_MIN, houseAreaSqft * ROOF_FLOOR)) : ROOF_MIN

  // Active prices — switches between standard and floor based on toggle
  const activeExtWindow  = bestPriceMode ? extWindowFloor  : extWindowPrice
  const activeIntWindow  = bestPriceMode ? intWindowFloor  : intWindowPrice
  const activeSiding     = bestPriceMode ? sidingFloor     : sidingPrice
  const activeDriveway   = bestPriceMode ? drivewayFloor   : drivewayPrice
  const activeGutter     = bestPriceMode ? gutterFloor     : gutterPrice
  const activeDeck       = bestPriceMode ? deckFloor       : deckPrice
  const activeRoof       = bestPriceMode ? roofFloor       : roofPrice

  // --- Final price: only selected services ---
  const selectedTotal =
    (services.exteriorWindows ? extWindowPrice : 0) +
    (services.interiorWindows ? intWindowPrice : 0) +
    (services.houseSiding     ? sidingPrice    : 0) +
    (services.drivewayWash    ? drivewayPrice  : 0) +
    (services.gutterCleaning  ? gutterPrice    : 0) +
    (services.deckPatio       ? deckPrice      : 0) +
    (services.roofMoss        ? roofPrice      : 0)
  const finalPrice = roundTo5(selectedTotal)

  const activeTotal =
    (services.exteriorWindows ? activeExtWindow : 0) +
    (services.interiorWindows ? activeIntWindow : 0) +
    (services.houseSiding     ? activeSiding    : 0) +
    (services.drivewayWash    ? activeDriveway  : 0) +
    (services.gutterCleaning  ? activeGutter    : 0) +
    (services.deckPatio       ? activeDeck      : 0) +
    (services.roofMoss        ? activeRoof      : 0)
  const activePrice = roundTo5(activeTotal)
  const savings = finalPrice - activePrice

  const commissionRate = leadSource === 'produced' ? 0.15 : 0.10
  const repCommission = roundTo5(activePrice * commissionRate)
  const contractorPay = roundTo5(activePrice * 0.70)
  const selectedCount = Object.values(services).filter(Boolean).length
  const windowFactorLabel = totalWindowCount === 0 ? 'No windows' : `${totalWindowCount} windows`

  const getItemsJSON = () => {
    const items: { description: string; quantity: number; unitPrice: number }[] = []
    if (services.exteriorWindows) items.push({ description: `Exterior Window Cleaning (${totalWindowCount} windows)`, quantity: 1, unitPrice: extWindowPrice })
    if (services.interiorWindows) items.push({ description: `Interior Window Cleaning (${totalWindowCount} windows${services.exteriorWindows ? ', 20% bundle' : ''})`, quantity: 1, unitPrice: intWindowPrice })
    if (services.houseSiding)     items.push({ description: `House Siding / Soft Wash (${houseAreaSqft.toLocaleString()} sqft)`, quantity: 1, unitPrice: sidingPrice })
    if (services.drivewayWash)    items.push({ description: `Driveway Pressure Wash (${drivewayAreaSqft.toLocaleString()} sqft)`, quantity: 1, unitPrice: drivewayPrice })
    if (services.gutterCleaning)  items.push({ description: `Gutter Cleaning (${stories}-storey)`, quantity: 1, unitPrice: gutterPrice })
    if (services.deckPatio)       items.push({ description: `Deck / Patio Cleaning (${deckAreaSqft.toLocaleString()} sqft)`, quantity: 1, unitPrice: deckPrice })
    if (services.roofMoss)        items.push({ description: `Roof Moss Treatment — Premium (${houseAreaSqft.toLocaleString()} sqft)`, quantity: 1, unitPrice: roofPrice })
    return JSON.stringify(items)
  }

  const selectedServiceNames = [
    services.exteriorWindows && 'exterior windows',
    services.interiorWindows && 'interior windows',
    services.houseSiding     && 'house soft wash',
    services.drivewayWash    && 'driveway pressure wash',
    services.gutterCleaning  && 'gutter cleaning',
    services.deckPatio       && 'deck/patio',
    services.roofMoss        && 'roof moss treatment',
  ].filter(Boolean).join(', ')

  const quoteText = selectedCount > 0
    ? `Based on your property, the total for ${selectedServiceNames} would be $${activePrice.toLocaleString()}${bestPriceMode ? ` — that's our best offer, exclusively for you today` : ''}. Our team can start as soon as you're ready!`
    : `We'd love to help! Let us know which services you're interested in and we'll get you a custom quote.`

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
            {step < 4 && (
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
    <form action={formAction} className="space-y-3">
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
            <span className={cn('text-[9px] lg:text-[11px] font-semibold hidden sm:block',
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 lg:py-2.5 text-base lg:text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
            <input name="lastName" placeholder="Last Name *" required inputMode="text" autoComplete="family-name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 lg:py-2.5 text-base lg:text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <input name="email" type="email" placeholder="Email *" required autoComplete="email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 lg:py-2.5 text-base lg:text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
            <input name="phone" type="tel" placeholder="Phone *" required inputMode="tel" autoComplete="tel"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 lg:py-2.5 text-base lg:text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />
          </div>
          <input name="address" placeholder="Street Address *" required autoComplete="street-address"
            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 lg:py-2.5 text-base lg:text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 placeholder:text-gray-400" />

          {/* Lead Source */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Lead Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setLeadSource('given')}
                className={cn('py-3 rounded-xl text-sm font-bold border-2 transition-all active:scale-95',
                  leadSource === 'given' ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm' : 'bg-white border-gray-200 text-gray-500')}>
                📋 Lead Given
                <span className="block text-xs font-normal mt-0.5 opacity-70">10% commission</span>
              </button>
              <button type="button" onClick={() => setLeadSource('produced')}
                className={cn('py-3 rounded-xl text-sm font-bold border-2 transition-all active:scale-95',
                  leadSource === 'produced' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 'bg-white border-gray-200 text-gray-500')}>
                🎯 Self-Generated
                <span className="block text-xs font-normal mt-0.5 opacity-70">15% commission</span>
              </button>
            </div>
          </div>
        </div>
      </StepSection>

      {/* ═══════ STEP 2: MEASUREMENTS ═══════ */}
      <StepSection step={1} title="Property Measurements"
        badge={houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft house` : undefined}>
        <p className="text-sm text-gray-500">Measure the diagonal in Google Earth (meters).</p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* House */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-green-600" /> House Diagonal (m)
            </label>
            <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="e.g. 18.5"
              value={houseDiag} onChange={e => setHouseDiag(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 lg:py-2.5 text-lg lg:text-base font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" />
            {houseAreaSqft > 0 && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2.5">
                <p className="text-sm font-semibold text-green-800">≈ {houseAreaSqft.toLocaleString()} sqft</p>
                <p className="text-xs text-green-600 mt-0.5">Siding: ${sidingPrice} · Gutters: ~${gutterPrice} · Roof: ${roofPrice}</p>
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 lg:py-2.5 text-lg lg:text-base font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" />
            {drivewayAreaSqft > 0 && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5">
                <p className="text-sm font-semibold text-blue-800">≈ {drivewayAreaSqft.toLocaleString()} sqft</p>
                <p className="text-xs text-blue-600 mt-0.5">Driveway wash: ${drivewayPrice}</p>
              </div>
            )}
          </div>
          </div>

          {/* Measurements hint */}
          {(houseAreaSqft > 0 || drivewayAreaSqft > 0) && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2.5">
              <p className="text-sm font-bold text-emerald-800">📐 Measurements recorded — select services in Step 4</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {WINDOW_TYPES.map(wt => (
              <div key={wt.key} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                {/* SVG Illustration */}
                <div className="bg-gradient-to-b from-sky-50 to-blue-50 p-3 flex items-center justify-center border-b border-gray-100">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                    <WindowSVG type={wt.key} />
                  </div>
                </div>
                {/* Info */}
                <div className="p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{wt.label}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{wt.size}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">{wt.weight}×</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">
                    <span className="font-semibold text-gray-600">📍 </span>{wt.locations}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Window Counters — 2-col mobile, 4-col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            <span className="text-sm text-gray-700">{totalWindowCount} windows · {weightedWindows.toFixed(1)} weighted units</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              Ext: ${extWindowPrice} · Int: ${intWindowPrice}
            </span>
          </div>
        )}
      </StepSection>

      {/* ═══════ STEP 4: SERVICES ═══════ */}
      <StepSection step={3} title="Services"
        badge={selectedCount > 0 ? `${selectedCount} selected · $${finalPrice.toLocaleString()}` : 'None selected yet'}>
        <p className="text-xs text-gray-500">Select any combination — nothing is required. Prices update live.</p>
        <div className="space-y-2">

          {/* helper to render a service row */}
          {([
            {
              key: 'exteriorWindows' as const,
              label: 'Exterior Window Cleaning',
              sub: `${totalWindowCount > 0 ? `${totalWindowCount} windows · ${weightedWindows.toFixed(1)} weighted units` : 'Enter window count in Step 3'}`,
              rate: '$10/weighted unit',
              price: extWindowPrice,
              available: totalWindowCount > 0,
              detail: totalWindowCount > 0 ? `${weightedWindows.toFixed(1)} units × $10` : null,
              color: 'green' as const,
            },
            {
              key: 'interiorWindows' as const,
              label: 'Interior Window Cleaning',
              sub: services.exteriorWindows ? '20% bundle discount applied' : 'Same window count as exterior',
              rate: services.exteriorWindows ? '$8/weighted unit (bundled)' : '$10/weighted unit',
              price: intWindowPrice,
              available: totalWindowCount > 0,
              detail: totalWindowCount > 0 ? `${weightedWindows.toFixed(1)} units × $${services.exteriorWindows ? 8 : 10}` : null,
              color: 'sky' as const,
            },
            {
              key: 'houseSiding' as const,
              label: 'House Siding / Soft Wash',
              sub: houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft` : 'Enter house diagonal in Step 2',
              rate: '$0.35/sqft',
              price: sidingPrice,
              available: houseAreaSqft > 0,
              detail: houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft × $0.35` : null,
              color: 'green' as const,
            },
            {
              key: 'drivewayWash' as const,
              label: 'Driveway Pressure Wash',
              sub: drivewayAreaSqft > 0 ? `${drivewayAreaSqft.toLocaleString()} sqft` : 'Enter driveway diagonal in Step 2',
              rate: '$0.25/sqft',
              price: drivewayPrice,
              available: drivewayAreaSqft > 0,
              detail: drivewayAreaSqft > 0 ? `${drivewayAreaSqft.toLocaleString()} sqft × $0.25` : null,
              color: 'blue' as const,
            },
            {
              key: 'gutterCleaning' as const,
              label: 'Gutter Cleaning',
              sub: houseAreaSqft > 0 ? `${stories}-storey · ~${Math.round(housePerimeterM)}m perimeter` : 'Enter house diagonal in Step 2',
              rate: '$5/linear metre × story factor',
              price: gutterPrice,
              available: houseAreaSqft > 0,
              detail: houseAreaSqft > 0 ? `~${Math.round(housePerimeterM)}m × $5 × ${storyMultiplier}×` : null,
              color: 'amber' as const,
            },
            {
              key: 'deckPatio' as const,
              label: 'Deck / Patio Cleaning',
              sub: deckAreaSqft > 0 ? `${deckAreaSqft.toLocaleString()} sqft` : 'Enter diagonal below when selected',
              rate: '$0.40/sqft',
              price: deckPrice,
              available: true,
              detail: deckAreaSqft > 0 ? `${deckAreaSqft.toLocaleString()} sqft × $0.40` : null,
              color: 'orange' as const,
            },
            {
              key: 'roofMoss' as const,
              label: 'Roof Moss Treatment',
              sub: houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft · min $${ROOF_MIN}` : 'Enter house diagonal in Step 2',
              rate: '$0.60/sqft · min $400 · PREMIUM',
              price: roofPrice,
              available: houseAreaSqft > 0,
              detail: houseAreaSqft > 0 ? `${houseAreaSqft.toLocaleString()} sqft × $0.60` : null,
              color: 'purple' as const,
            },
          ] as const).map(svc => {
            const isOn = services[svc.key]
            const borderColor =
              !isOn ? 'border-gray-200 bg-white' :
              svc.color === 'purple' ? 'border-purple-400 bg-purple-50' :
              svc.color === 'amber'  ? 'border-amber-400 bg-amber-50' :
              svc.color === 'sky'    ? 'border-sky-400 bg-sky-50' :
              svc.color === 'blue'   ? 'border-blue-400 bg-blue-50' :
              svc.color === 'orange' ? 'border-orange-400 bg-orange-50' :
              'border-green-400 bg-green-50'
            const priceColor =
              svc.color === 'purple' ? 'text-purple-700' :
              svc.color === 'amber'  ? 'text-amber-700' :
              svc.color === 'sky'    ? 'text-sky-700' :
              svc.color === 'blue'   ? 'text-blue-700' :
              svc.color === 'orange' ? 'text-orange-700' :
              'text-green-700'
            return (
              <div key={svc.key} className={cn('rounded-2xl border-2 transition-all', borderColor)}>
                <label className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={isOn} onChange={() => toggleService(svc.key)}
                      className="w-5 h-5 rounded border-gray-300 focus:ring-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        {svc.label}
                        {svc.key === 'roofMoss' && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">PREMIUM</span>}
                        {svc.key === 'interiorWindows' && services.exteriorWindows && <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">BUNDLE</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{svc.sub}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    {svc.available
                      ? <span className={cn('text-sm font-bold', isOn ? priceColor : 'text-gray-500')}>${svc.price}</span>
                      : <span className="text-xs text-gray-400">—</span>
                    }
                  </div>
                </label>
                {isOn && svc.detail && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-500 font-medium">{svc.detail} = <strong>${svc.price}</strong></p>
                  </div>
                )}
                {/* Deck diagonal input */}
                {isOn && svc.key === 'deckPatio' && (
                  <div className="px-4 pb-4 space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-orange-600" /> Deck / Patio Diagonal (m)
                    </label>
                    <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="e.g. 8.5"
                      value={deckDiag} onChange={e => setDeckDiag(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base font-semibold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white" />
                    {deckAreaSqft > 0 && (
                      <p className="text-xs text-orange-700 font-medium">≈ {deckAreaSqft.toLocaleString()} sqft → ${deckPrice}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </StepSection>

      {/* ═══════ STEP 5: SUMMARY ═══════ */}
      <StepSection step={4} title="Quote Summary"
        badge={finalPrice > 0 ? `$${finalPrice.toLocaleString()}` : 'No services selected'}>

        {selectedCount === 0 && (
          <p className="text-sm text-amber-600 font-medium text-center py-2">⚠ No services selected — go back to Step 4 to choose services.</p>
        )}

        {/* Best Price Toggle */}
        {selectedCount > 0 && (
          <div className="space-y-1.5">
            <button type="button" onClick={() => setBestPriceMode(p => !p)}
              className={cn('w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] border-2',
                bestPriceMode
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : 'bg-white border-orange-400 text-orange-600 hover:bg-orange-50')}>
              {bestPriceMode ? '🔥 Best Price Applied — Tap to Revert' : '🤝 Offer Best Price'}
            </button>
            {bestPriceMode && savings > 0 && (
              <p className="text-center text-xs text-orange-600 font-semibold">
                Client saves ${savings.toLocaleString()} ({Math.round(savings / finalPrice * 100)}% off standard rate)
              </p>
            )}
          </div>
        )}

        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Line items */}
          <div className="space-y-2 text-sm">
            {services.exteriorWindows && (
              <div className="flex justify-between text-gray-700">
                <span>Exterior windows ({totalWindowCount})</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {bestPriceMode && extWindowFloor !== extWindowPrice && <s className="text-gray-400 text-xs">${extWindowPrice}</s>}
                  ${activeExtWindow}
                </span>
              </div>
            )}
            {services.interiorWindows && (
              <div className="flex justify-between text-gray-700">
                <span>Interior windows{services.exteriorWindows ? ' (bundle)' : ''}</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {bestPriceMode && intWindowFloor !== intWindowPrice && <s className="text-gray-400 text-xs">${intWindowPrice}</s>}
                  ${activeIntWindow}
                </span>
              </div>
            )}
            {services.houseSiding && (
              <div className="flex justify-between text-gray-700">
                <span>House siding ({houseAreaSqft.toLocaleString()} sqft)</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {bestPriceMode && sidingFloor !== sidingPrice && <s className="text-gray-400 text-xs">${sidingPrice}</s>}
                  ${activeSiding}
                </span>
              </div>
            )}
            {services.drivewayWash && (
              <div className="flex justify-between text-gray-700">
                <span>Driveway wash ({drivewayAreaSqft.toLocaleString()} sqft)</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {bestPriceMode && drivewayFloor !== drivewayPrice && <s className="text-gray-400 text-xs">${drivewayPrice}</s>}
                  ${activeDriveway}
                </span>
              </div>
            )}
            {services.gutterCleaning && (
              <div className="flex justify-between text-gray-700">
                <span>Gutter cleaning ({stories}F)</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {bestPriceMode && gutterFloor !== gutterPrice && <s className="text-gray-400 text-xs">${gutterPrice}</s>}
                  ${activeGutter}
                </span>
              </div>
            )}
            {services.deckPatio && (
              <div className="flex justify-between text-gray-700">
                <span>Deck / patio ({deckAreaSqft.toLocaleString()} sqft)</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {bestPriceMode && deckFloor !== deckPrice && <s className="text-gray-400 text-xs">${deckPrice}</s>}
                  ${activeDeck}
                </span>
              </div>
            )}
            {services.roofMoss && (
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>Roof moss treatment ✦</span>
                <span className="flex items-center gap-1.5">
                  {bestPriceMode && roofFloor !== roofPrice && <s className="text-purple-300 text-xs font-normal">${roofPrice}</s>}
                  ${activeRoof}
                </span>
              </div>
            )}
            {selectedCount > 0 && (
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="flex items-center gap-2">
                  {bestPriceMode && savings > 0 && <s className="text-gray-400 text-sm font-normal">${finalPrice.toLocaleString()}</s>}
                  ${activePrice.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Total card + copy */}
          <div className="space-y-4 mt-4 lg:mt-0">
            <div className={cn('rounded-2xl p-4 lg:p-6 text-white transition-all', bestPriceMode ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-green-600 to-emerald-600')}>
              <div className="flex items-end justify-between">
                <div>
                  <p className={cn('text-xs font-medium', bestPriceMode ? 'text-orange-100' : 'text-green-100')}>
                    {bestPriceMode ? 'Best Price Offer' : 'Client Quote'}
                  </p>
                  <div className="flex items-end gap-2">
                    {bestPriceMode && savings > 0 && <s className="text-white/50 text-lg font-semibold">${finalPrice.toLocaleString()}</s>}
                    <p className="text-3xl font-extrabold tracking-tight">${activePrice.toLocaleString()}</p>
                  </div>
                  {bestPriceMode && savings > 0 && (
                    <p className="text-orange-100 text-xs font-semibold mt-0.5">You save ${savings.toLocaleString()}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={cn('text-xs', bestPriceMode ? 'text-orange-200' : 'text-green-200')}>Sub: ${contractorPay.toLocaleString()}</p>
                  <p className={cn('text-xs', bestPriceMode ? 'text-orange-200' : 'text-green-200')}>Your {Math.round(commissionRate * 100)}%: ${repCommission.toLocaleString()}</p>
                </div>
              </div>
            </div>
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
          </div>
        </div>
      </StepSection>

      {/* Hidden form fields */}
      <input type="hidden" name="total" value={activePrice} />
      <input type="hidden" name="items" value={getItemsJSON()} />
      <input type="hidden" name="tier" value="custom" />
      <input type="hidden" name="contractorPay" value={contractorPay} />
      <input type="hidden" name="repCommission" value={repCommission} />
      <input type="hidden" name="leadSource" value={leadSource} />
      <input type="hidden" name="houseAreaSqft" value={houseAreaSqft} />
      <input type="hidden" name="storyMultiplier" value={storyMultiplier.toFixed(2)} />

      {/* ─── Save Quote Button (inline) ─── */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">${activePrice.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">Sub ${contractorPay.toLocaleString()} · Your {Math.round(commissionRate * 100)}%: ${repCommission.toLocaleString()}</p>
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
