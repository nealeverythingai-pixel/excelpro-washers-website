
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
  status: 'new' | 'New' | 'Viewed' | 'Contacted' | 'Converted' | 'Lost' | 'Archived';
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
  agentType: 'quote-optimizer' | 'lead-qualifier' | 'contractor-analytics' | 'business-insights' | 'customer-assistant';
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
  timestamp: string;
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
}
