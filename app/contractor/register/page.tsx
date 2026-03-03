'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { HardHat, Upload, CheckCircle2, ChevronRight, ChevronLeft, FileText, Shield, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TERMS_AND_CONDITIONS } from './terms';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  skills: string[];
  experience: string;
  hasOwnEquipment: boolean;
  vehicleType: string;
  insuranceFile: File | null;
  insuranceExpiry: string;
  insuranceProvider: string;
  policyNumber: string;
  agreedToTerms: boolean;
  hasScrolledTerms: boolean;
  signature: string;
}

const AVAILABLE_SKILLS = [
  'Window Cleaning',
  'Pressure Washing',
  'Soft Washing',
  'Gutter Cleaning',
  'Roof Cleaning',
  'Deck & Fence Cleaning',
  'Concrete Cleaning',
  'Fleet/Vehicle Washing',
  'Post-Construction Cleanup',
  'Solar Panel Cleaning',
];

export default function ContractorRegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const termsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    skills: [],
    experience: '',
    hasOwnEquipment: false,
    vehicleType: '',
    insuranceFile: null,
    insuranceExpiry: '',
    insuranceProvider: '',
    policyNumber: '',
    agreedToTerms: false,
    hasScrolledTerms: false,
    signature: '',
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleSkill = (skill: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // Track T&C scroll position
  const handleTermsScroll = useCallback(() => {
    const el = termsRef.current;
    if (!el) return;
    const scrolledToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    if (scrolledToBottom && !form.hasScrolledTerms) {
      updateField('hasScrolledTerms', true);
    }
  }, [form.hasScrolledTerms]);

  useEffect(() => {
    const el = termsRef.current;
    if (el && step === 3) {
      el.addEventListener('scroll', handleTermsScroll);
      return () => el.removeEventListener('scroll', handleTermsScroll);
    }
  }, [step, handleTermsScroll]);

  // Validation per step
  const validateStep = (s: Step): string | null => {
    if (s === 1) {
      if (!form.firstName.trim()) return 'First name is required';
      if (!form.lastName.trim()) return 'Last name is required';
      if (!form.email.trim() || !form.email.includes('@')) return 'Valid email is required';
      if (!form.phone.trim()) return 'Phone number is required';
      if (!form.address.trim()) return 'Address is required';
      if (!form.city.trim()) return 'City is required';
      if (!form.postalCode.trim()) return 'Postal code is required';
      if (!form.emergencyContact.trim()) return 'Emergency contact name is required';
      if (!form.emergencyPhone.trim()) return 'Emergency contact phone is required';
      if (form.skills.length === 0) return 'Select at least one service skill';
    }
    if (s === 2) {
      if (!form.insuranceFile) return 'Insurance proof document is required';
      if (!form.insuranceProvider.trim()) return 'Insurance provider is required';
      if (!form.policyNumber.trim()) return 'Policy number is required';
      if (!form.insuranceExpiry) return 'Insurance expiry date is required';
      const expiry = new Date(form.insuranceExpiry);
      if (expiry < new Date()) return 'Insurance must not be expired';
    }
    if (s === 3) {
      if (!form.hasScrolledTerms) return 'You must read the entire Terms & Conditions (scroll to the bottom)';
      if (!form.agreedToTerms) return 'You must accept the Terms & Conditions';
    }
    if (s === 4) {
      if (!form.signature.trim()) return 'Digital signature (full legal name) is required';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(prev => Math.min(prev + 1, 4) as Step);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async () => {
    const err = validateStep(4);
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);

    try {
      const formPayload = new window.FormData();
      formPayload.append('firstName', form.firstName);
      formPayload.append('lastName', form.lastName);
      formPayload.append('email', form.email);
      formPayload.append('phone', form.phone);
      formPayload.append('address', form.address);
      formPayload.append('city', form.city);
      formPayload.append('postalCode', form.postalCode);
      formPayload.append('emergencyContact', form.emergencyContact);
      formPayload.append('emergencyPhone', form.emergencyPhone);
      formPayload.append('skills', JSON.stringify(form.skills));
      formPayload.append('experience', form.experience);
      formPayload.append('hasOwnEquipment', String(form.hasOwnEquipment));
      formPayload.append('vehicleType', form.vehicleType);
      formPayload.append('insuranceProvider', form.insuranceProvider);
      formPayload.append('policyNumber', form.policyNumber);
      formPayload.append('insuranceExpiry', form.insuranceExpiry);
      formPayload.append('signature', form.signature);
      formPayload.append('agreedToTermsAt', new Date().toISOString());
      if (form.insuranceFile) {
        formPayload.append('insuranceFile', form.insuranceFile);
      }

      const res = await fetch('/api/contractor/register', { method: 'POST', body: formPayload });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Application Submitted!</h1>
          <p className="mt-4 text-gray-600">
            Thank you for applying to become an ExcelPro Washers service provider. Our team will review your application and insurance documents within <strong>1–2 business days</strong>.
          </p>
          <p className="mt-3 text-gray-600">
            You&apos;ll receive an email at <strong>{form.email}</strong> once your application has been reviewed.
          </p>
          <div className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            <strong>What happens next?</strong>
            <ol className="mt-2 list-decimal pl-5 space-y-1 text-left">
              <li>We verify your insurance documentation</li>
              <li>Your application is reviewed by management</li>
              <li>Once approved, you&apos;ll receive your login credentials via email</li>
              <li>You can start accepting jobs through the Contractor Portal</li>
            </ol>
          </div>
          <Link
            href="/contractor/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Step indicators ─────────────────────────────────────────────
  const steps = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Insurance', icon: Shield },
    { num: 3, label: 'Terms & Conditions', icon: FileText },
    { num: 4, label: 'Review & Sign', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <HardHat className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Become a Service Provider</h1>
          <p className="mt-1 text-sm text-gray-600">ExcelPro Washers Contractor Application</p>
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step >= s.num ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
              </div>
              <span className={`ml-2 hidden text-xs font-medium sm:inline ${step >= s.num ? 'text-orange-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`mx-3 h-0.5 w-8 sm:w-16 ${step > s.num ? 'bg-orange-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="rounded-lg bg-white shadow-md p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── STEP 1: Personal Info ───────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => updateField('firstName', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={e => updateField('lastName', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address *</label>
                <input type="text" value={form.address} onChange={e => updateField('address', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input type="text" value={form.city} onChange={e => updateField('city', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code *</label>
                  <input type="text" value={form.postalCode} onChange={e => updateField('postalCode', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>

              <hr className="my-2" />
              <h3 className="text-sm font-semibold text-gray-900">Emergency Contact</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name *</label>
                  <input type="text" value={form.emergencyContact} onChange={e => updateField('emergencyContact', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone *</label>
                  <input type="tel" value={form.emergencyPhone} onChange={e => updateField('emergencyPhone', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>

              <hr className="my-2" />
              <h3 className="text-sm font-semibold text-gray-900">Skills & Experience</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Service Skills *</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SKILLS.map(skill => (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                        form.skills.includes(skill)
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                      }`}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <select value={form.experience} onChange={e => updateField('experience', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  <option value="">Select...</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="equipment" checked={form.hasOwnEquipment}
                  onChange={e => updateField('hasOwnEquipment', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                <label htmlFor="equipment" className="text-sm text-gray-700">I have my own equipment and supplies</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                <input type="text" placeholder="e.g. Cargo Van, Pickup Truck" value={form.vehicleType}
                  onChange={e => updateField('vehicleType', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>
            </div>
          )}

          {/* ── STEP 2: Insurance ───────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Insurance Verification</h2>
              <p className="text-sm text-gray-600">
                All service providers must carry commercial general liability insurance with a minimum coverage of <strong>$2,000,000 CAD</strong>.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700">Insurance Provider *</label>
                <input type="text" value={form.insuranceProvider} onChange={e => updateField('insuranceProvider', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Policy Number *</label>
                  <input type="text" value={form.policyNumber} onChange={e => updateField('policyNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
                  <input type="date" value={form.insuranceExpiry} onChange={e => updateField('insuranceExpiry', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof of Insurance *</label>
                <p className="text-xs text-gray-500 mb-2">Accepted formats: PDF, JPG, PNG (max 10MB)</p>
                <div className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  form.insuranceFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-orange-400'
                }`}>
                  {form.insuranceFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{form.insuranceFile.name}</span>
                      <button type="button" onClick={() => updateField('insuranceFile', null)}
                        className="ml-2 text-xs text-red-600 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click or drag & drop your insurance document</p>
                    </>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return; }
                        updateField('insuranceFile', file);
                        setError('');
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Terms & Conditions ──────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions</h2>
              <p className="text-sm text-gray-600">
                Please read the entire agreement carefully. You must scroll to the bottom before you can accept.
              </p>

              <div
                ref={termsRef}
                className="h-96 overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed"
              >
                {TERMS_AND_CONDITIONS}
              </div>

              {!form.hasScrolledTerms && (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" /> Scroll to the bottom of the agreement to continue
                </p>
              )}

              <div className={`flex items-start gap-3 ${!form.hasScrolledTerms ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="checkbox" id="agree" checked={form.agreedToTerms}
                  onChange={e => updateField('agreedToTerms', e.target.checked)}
                  disabled={!form.hasScrolledTerms}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                <label htmlFor="agree" className="text-sm text-gray-700">
                  I have read, understand, and agree to the <strong>Independent Contractor Service Agreement</strong> including all requirements for before/after photo documentation, client walkthrough sign-off, and payment terms.
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & Sign ───────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Review & Sign</h2>

              <div className="rounded-lg border border-gray-200 divide-y">
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Personal Info</h3>
                  <p className="text-sm text-gray-900">{form.firstName} {form.lastName}</p>
                  <p className="text-sm text-gray-600">{form.email} · {form.phone}</p>
                  <p className="text-sm text-gray-600">{form.address}, {form.city} {form.postalCode}</p>
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map(s => (
                      <span key={s} className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">{s}</span>
                    ))}
                  </div>
                  {form.experience && <p className="mt-1 text-sm text-gray-600">Experience: {form.experience} years</p>}
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Insurance</h3>
                  <p className="text-sm text-gray-900">{form.insuranceProvider} — Policy #{form.policyNumber}</p>
                  <p className="text-sm text-gray-600">Expires: {form.insuranceExpiry}</p>
                  <p className="text-sm text-gray-600">Document: {form.insuranceFile?.name}</p>
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agreement</h3>
                  <p className="text-sm text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Terms & Conditions accepted
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Digital Signature — Type Your Full Legal Name *
                </label>
                <input type="text" value={form.signature} onChange={e => updateField('signature', e.target.value)}
                  placeholder="e.g. John Michael Smith"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 text-lg font-serif italic shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                <p className="mt-1 text-xs text-gray-500">
                  By typing your name above, you are electronically signing this agreement on {new Date().toLocaleDateString('en-CA')}.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation Buttons ──────────────────────────────── */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button type="button" onClick={prevStep}
                className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <Link href="/contractor/login" className="text-sm text-gray-500 hover:text-orange-600">
                Already registered? Log in
              </Link>
            )}

            {step < 4 ? (
              <button type="button" onClick={nextStep}
                className="flex items-center gap-1 rounded-md bg-orange-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-1 rounded-md bg-orange-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
