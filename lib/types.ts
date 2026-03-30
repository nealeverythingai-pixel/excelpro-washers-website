
export type UserRole = 'ADMIN' | 'SALES' | 'CONTRACTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  pin: string;
  role: UserRole;
  active: boolean;
  phone?: string; // For contractor notifications
  skills?: string[]; // e.g., ["windows", "driveways", "gutters"]
  completedJobs?: number; // Track performance
  totalEarnings?: number; // Track contractor payments
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  status: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate?: string;
  total: number;
  createdAt: string;
  proofOfWork?: string; // URL or base64 placeholder
  contractorNotes?: string;
  
  // Contractor Assignment Fields
  contractorId?: string; // Legacy field
  assignedContractorId?: string; // Who accepted the job
  assignedContractorName?: string; // For display
  assignedAt?: string; // When job was accepted
  contractorEarnings?: number; // What contractor gets paid
  availableToContractors?: boolean; // If true, shows on contractor job board

  // Before/After Photo Documentation
  beforePhotos?: string[]; // base64 or URLs — min 3 required before starting
  beforePhotosUploadedAt?: string;
  afterPhotos?: string[]; // base64 or URLs — min 3 required before completion
  afterPhotosUploadedAt?: string;

  // Client Walkthrough Sign-off
  clientSignoff?: boolean;
  clientSignoffName?: string; // Client's typed name
  clientSignoffAt?: string; // Timestamp
  clientSignoffNotes?: string; // Any client feedback
  cancelReason?: string; // Reason provided when contractor cancels
}

export interface Quote {
  id: string;
  clientId: string;
  title: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Accepted' | 'Converted';
  createdAt: string;
  salesRepId?: string; // Sales rep who created the quote
  notes?: string; // JSON pricing metadata (tier, splits, multipliers)
}

export interface Invoice {
  id: string;
  clientId: string;
  jobId?: string;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Unpaid' | 'Overdue';
  dueDate: string;
  createdAt: string;
}

export interface Request {
  id: string;
  name?: string; // Full name (for new API)
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  address?: string;
  service?: string; // Service type requested
  message?: string; // Customer message
  details?: string; // Legacy field
  status: 'New' | 'Viewed' | 'Contacted' | 'Converted' | 'Lost' | 'Archived';
  createdAt: string;
  // AI Lead Qualification
  aiScore?: number; // 0-100
  aiCategory?: 'hot' | 'warm' | 'cold';
  aiReasoning?: string;
  estimatedValue?: number;
  nextFollowUp?: string;
}

export interface AIFeedback {
  id: string;
  agentType: 'lead-qualifier' | 'business-insights';
  inputData: any;
  outputData: any;
  actualOutcome?: 'success' | 'failure' | 'pending';
  userFeedback?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ScheduledFollowUp {
  id: string;
  leadId: string;
  category: 'warm' | 'cold';
  type: 'follow-up' | 'special-offer' | 'final-check' | 'educational' | 'seasonal' | 're-engagement' | 'case-study';
  scheduledFor: string; // ISO date string
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface CallLog {
  id: string;
  callSid: string;
  from: string;
  to: string;
  status: string;
  duration: number;
  recordingUrl?: string | null;
  transcript?: { role: 'user' | 'assistant'; content: string }[];
  bookingCreated?: boolean;
  timestamp: string;
}

export interface CallConversation {
  callSid: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  callerPhone: string;
  startedAt: string;
  lastActivity: string;
  bookingSaved?: boolean;
}

export interface ContractorApplication {
  id: string;
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
  insuranceProvider: string;
  policyNumber: string;
  insuranceExpiry: string;
  insuranceFileName: string;
  insuranceFileData: string; // base64
  agreedToTermsAt: string;
  signature: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
}

export interface ContractorAvailability {
  id: string
  contractorId: string
  dayOfWeek: number // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startTime: string // '08:00'
  endTime: string   // '17:00'
}

export interface ContractorBlock {
  id: string
  contractorId: string
  blockDate: string   // 'YYYY-MM-DD'
  blockType: 'full' | 'partial' // full = busy all day, partial = available during a window
  availableFrom?: string // '08:00' — only set when blockType='partial'
  availableTo?: string   // '17:00' — only set when blockType='partial'
  reason?: string
  createdAt: string
}

export interface DbSchema {
  clients: Client[]
  jobs: Job[]
  quotes: Quote[]
  invoices: Invoice[]
  requests: Request[]
  users: User[]
  aiFeedback?: AIFeedback[]
  scheduledFollowUps?: ScheduledFollowUp[]
  callLogs?: CallLog[]
  callConversations?: CallConversation[]
  contractorApplications?: ContractorApplication[]
}
