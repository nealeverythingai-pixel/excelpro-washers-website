/**
 * Supabase-backed database layer
 * Replaces the JSON file DB with Supabase PostgreSQL
 */

import { supabase } from './supabase';
import {
  Client, Job, Quote, Invoice, Request, User,
  AIFeedback, ScheduledFollowUp, CallLog, CallConversation,
  ContractorApplication, ContractorAvailability, ContractorBlock
} from './types';

// ── Helper: camelCase ↔ snake_case mappers ──────────────────────────

function clientFromRow(row: any): Client {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name || undefined,
    email: row.email,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at,
  };
}

function clientToRow(client: Partial<Client>) {
  const row: any = {};
  if (client.firstName !== undefined) row.first_name = client.firstName;
  if (client.lastName !== undefined) row.last_name = client.lastName;
  if (client.companyName !== undefined) row.company_name = client.companyName;
  if (client.email !== undefined) row.email = client.email;
  if (client.phone !== undefined) row.phone = client.phone;
  if (client.address !== undefined) row.address = client.address;
  return row;
}

function jobFromRow(row: any): Job {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    description: row.description || undefined,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date || undefined,
    total: Number(row.total),
    createdAt: row.created_at,
    proofOfWork: row.proof_of_work || undefined,
    contractorNotes: row.contractor_notes || undefined,
    contractorId: row.contractor_id || undefined,
    assignedContractorId: row.assigned_contractor_id || undefined,
    assignedContractorName: row.assigned_contractor_name || undefined,
    assignedAt: row.assigned_at || undefined,
    contractorEarnings: row.contractor_earnings != null ? Number(row.contractor_earnings) : undefined,
    availableToContractors: row.available_to_contractors || undefined,
    beforePhotos: row.before_photos || undefined,
    beforePhotosUploadedAt: row.before_photos_uploaded_at || undefined,
    afterPhotos: row.after_photos || undefined,
    afterPhotosUploadedAt: row.after_photos_uploaded_at || undefined,
    clientSignoff: row.client_signoff || undefined,
    clientSignoffName: row.client_signoff_name || undefined,
    clientSignoffAt: row.client_signoff_at || undefined,
    clientSignoffNotes: row.client_signoff_notes || undefined,
  };
}

function jobToRow(job: Partial<Job>) {
  const row: any = {};
  if (job.clientId !== undefined) row.client_id = job.clientId;
  if (job.title !== undefined) row.title = job.title;
  if (job.description !== undefined) row.description = job.description;
  if (job.status !== undefined) row.status = job.status;
  if (job.startDate !== undefined) row.start_date = job.startDate;
  if (job.endDate !== undefined) row.end_date = job.endDate;
  if (job.total !== undefined) row.total = job.total;
  if (job.proofOfWork !== undefined) row.proof_of_work = job.proofOfWork;
  if (job.contractorNotes !== undefined) row.contractor_notes = job.contractorNotes;
  if (job.contractorId !== undefined) row.contractor_id = job.contractorId;
  if (job.assignedContractorId !== undefined) row.assigned_contractor_id = job.assignedContractorId;
  if (job.assignedContractorName !== undefined) row.assigned_contractor_name = job.assignedContractorName;
  if (job.assignedAt !== undefined) row.assigned_at = job.assignedAt;
  if (job.contractorEarnings !== undefined) row.contractor_earnings = job.contractorEarnings;
  if (job.availableToContractors !== undefined) row.available_to_contractors = job.availableToContractors;
  if (job.beforePhotos !== undefined) row.before_photos = job.beforePhotos;
  if (job.beforePhotosUploadedAt !== undefined) row.before_photos_uploaded_at = job.beforePhotosUploadedAt;
  if (job.afterPhotos !== undefined) row.after_photos = job.afterPhotos;
  if (job.afterPhotosUploadedAt !== undefined) row.after_photos_uploaded_at = job.afterPhotosUploadedAt;
  if (job.clientSignoff !== undefined) row.client_signoff = job.clientSignoff;
  if (job.clientSignoffName !== undefined) row.client_signoff_name = job.clientSignoffName;
  if (job.clientSignoffAt !== undefined) row.client_signoff_at = job.clientSignoffAt;
  if (job.clientSignoffNotes !== undefined) row.client_signoff_notes = job.clientSignoffNotes;
  return row;
}

function quoteFromRow(row: any): Quote {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    items: row.items || [],
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    salesRepId: row.sales_rep_id || undefined,
    notes: row.notes || undefined,
  };
}

function quoteToRow(quote: Partial<Quote>) {
  const row: any = {};
  if (quote.clientId !== undefined) row.client_id = quote.clientId;
  if (quote.title !== undefined) row.title = quote.title;
  if (quote.items !== undefined) row.items = quote.items;
  if (quote.total !== undefined) row.total = quote.total;
  if (quote.status !== undefined) row.status = quote.status;
  if (quote.salesRepId !== undefined) row.sales_rep_id = quote.salesRepId;
  if (quote.notes !== undefined) row.notes = quote.notes;
  return row;
}

function invoiceFromRow(row: any): Invoice {
  return {
    id: row.id,
    clientId: row.client_id,
    jobId: row.job_id || undefined,
    total: Number(row.total),
    status: row.status,
    dueDate: row.due_date,
    createdAt: row.created_at,
  };
}

function invoiceToRow(invoice: Partial<Invoice>) {
  const row: any = {};
  if (invoice.clientId !== undefined) row.client_id = invoice.clientId;
  if (invoice.jobId !== undefined) row.job_id = invoice.jobId;
  if (invoice.total !== undefined) row.total = invoice.total;
  if (invoice.status !== undefined) row.status = invoice.status;
  if (invoice.dueDate !== undefined) row.due_date = invoice.dueDate;
  return row;
}

function userFromRow(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    pin: row.pin,
    role: row.role,
    active: row.active,
    phone: row.phone || undefined,
    skills: row.skills || undefined,
    completedJobs: row.completed_jobs || undefined,
    totalEarnings: row.total_earnings != null ? Number(row.total_earnings) : undefined,
  };
}

function userToRow(user: Partial<User>) {
  const row: any = {};
  if (user.name !== undefined) row.name = user.name;
  if (user.email !== undefined) row.email = user.email;
  if (user.pin !== undefined) row.pin = user.pin;
  if (user.role !== undefined) row.role = user.role;
  if (user.active !== undefined) row.active = user.active;
  if (user.phone !== undefined) row.phone = user.phone;
  if (user.skills !== undefined) row.skills = user.skills;
  if (user.completedJobs !== undefined) row.completed_jobs = user.completedJobs;
  if (user.totalEarnings !== undefined) row.total_earnings = user.totalEarnings;
  return row;
}

function requestFromRow(row: any): Request {
  return {
    id: row.id,
    name: row.name || undefined,
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    email: row.email,
    phone: row.phone,
    address: row.address || undefined,
    service: row.service || undefined,
    message: row.message || undefined,
    details: row.details || undefined,
    status: row.status,
    createdAt: row.created_at,
    aiScore: row.ai_score || undefined,
    aiCategory: row.ai_category || undefined,
    aiReasoning: row.ai_reasoning || undefined,
    estimatedValue: row.estimated_value != null ? Number(row.estimated_value) : undefined,
    nextFollowUp: row.next_follow_up || undefined,
  };
}

function requestToRow(request: Partial<Request>) {
  const row: any = {};
  if (request.name !== undefined) row.name = request.name;
  if (request.firstName !== undefined) row.first_name = request.firstName;
  if (request.lastName !== undefined) row.last_name = request.lastName;
  if (request.email !== undefined) row.email = request.email;
  if (request.phone !== undefined) row.phone = request.phone;
  if (request.address !== undefined) row.address = request.address;
  if (request.service !== undefined) row.service = request.service;
  if (request.message !== undefined) row.message = request.message;
  if (request.details !== undefined) row.details = request.details;
  if (request.status !== undefined) row.status = request.status;
  if (request.aiScore !== undefined) row.ai_score = request.aiScore;
  if (request.aiCategory !== undefined) row.ai_category = request.aiCategory;
  if (request.aiReasoning !== undefined) row.ai_reasoning = request.aiReasoning;
  if (request.estimatedValue !== undefined) row.estimated_value = request.estimatedValue;
  if (request.nextFollowUp !== undefined) row.next_follow_up = request.nextFollowUp;
  return row;
}

function contractorAppFromRow(row: any): ContractorApplication {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
    skills: row.skills || [],
    experience: row.experience,
    hasOwnEquipment: row.has_own_equipment,
    vehicleType: row.vehicle_type,
    insuranceProvider: row.insurance_provider,
    policyNumber: row.policy_number,
    insuranceExpiry: row.insurance_expiry,
    insuranceFileName: row.insurance_file_name,
    insuranceFileData: row.insurance_file_data,
    agreedToTermsAt: row.agreed_to_terms_at,
    signature: row.signature,
    status: row.status,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
    submittedAt: row.submitted_at,
  };
}

function contractorAppToRow(app: Partial<ContractorApplication>) {
  const row: any = {};
  if (app.firstName !== undefined) row.first_name = app.firstName;
  if (app.lastName !== undefined) row.last_name = app.lastName;
  if (app.email !== undefined) row.email = app.email;
  if (app.phone !== undefined) row.phone = app.phone;
  if (app.address !== undefined) row.address = app.address;
  if (app.city !== undefined) row.city = app.city;
  if (app.postalCode !== undefined) row.postal_code = app.postalCode;
  if (app.emergencyContact !== undefined) row.emergency_contact = app.emergencyContact;
  if (app.emergencyPhone !== undefined) row.emergency_phone = app.emergencyPhone;
  if (app.skills !== undefined) row.skills = app.skills;
  if (app.experience !== undefined) row.experience = app.experience;
  if (app.hasOwnEquipment !== undefined) row.has_own_equipment = app.hasOwnEquipment;
  if (app.vehicleType !== undefined) row.vehicle_type = app.vehicleType;
  if (app.insuranceProvider !== undefined) row.insurance_provider = app.insuranceProvider;
  if (app.policyNumber !== undefined) row.policy_number = app.policyNumber;
  if (app.insuranceExpiry !== undefined) row.insurance_expiry = app.insuranceExpiry;
  if (app.insuranceFileName !== undefined) row.insurance_file_name = app.insuranceFileName;
  if (app.insuranceFileData !== undefined) row.insurance_file_data = app.insuranceFileData;
  if (app.agreedToTermsAt !== undefined) row.agreed_to_terms_at = app.agreedToTermsAt;
  if (app.signature !== undefined) row.signature = app.signature;
  if (app.status !== undefined) row.status = app.status;
  if (app.reviewedBy !== undefined) row.reviewed_by = app.reviewedBy;
  if (app.reviewedAt !== undefined) row.reviewed_at = app.reviewedAt;
  if (app.rejectionReason !== undefined) row.rejection_reason = app.rejectionReason;
  return row;
}

// ── Database export ─────────────────────────────────────────────────

export const db = {
  // ── CLIENTS ─────────────────────────────────────────────────────
  clients: {
    getAll: async (): Promise<Client[]> => {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (error) { console.error('db.clients.getAll:', error.message); return []; }
      return (data || []).map(clientFromRow);
    },
    getById: async (id: string): Promise<Client | undefined> => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return clientFromRow(data);
    },
    findById: async (id: string): Promise<Client | undefined> => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return clientFromRow(data);
    },
    create: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
      const row = clientToRow(client);
      const { data, error } = await supabase.from('clients').insert(row).select().single();
      if (error) { console.error('db.clients.create:', error.message); throw error; }
      return clientFromRow(data);
    },
    update: async (id: string, updates: Partial<Client>): Promise<Client | null> => {
      const row = clientToRow(updates);
      const { data, error } = await supabase.from('clients').update(row).eq('id', id).select().single();
      if (error || !data) { console.error('db.clients.update:', error?.message); return null; }
      return clientFromRow(data);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) console.error('db.clients.delete:', error.message);
    },
  },

  // ── JOBS ────────────────────────────────────────────────────────
  jobs: {
    getAll: async (): Promise<Job[]> => {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (error) { console.error('db.jobs.getAll:', error.message); return []; }
      return (data || []).map(jobFromRow);
    },
    findById: async (id: string): Promise<Job | undefined> => {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return jobFromRow(data);
    },
    getByClientId: async (clientId: string): Promise<Job[]> => {
      const { data, error } = await supabase.from('jobs').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
      if (error) { console.error('db.jobs.getByClientId:', error.message); return []; }
      return (data || []).map(jobFromRow);
    },
    create: async (job: Omit<Job, 'id' | 'createdAt'>): Promise<Job> => {
      const row = jobToRow(job);
      const { data, error } = await supabase.from('jobs').insert(row).select().single();
      if (error) { console.error('db.jobs.create:', error.message); throw error; }
      return jobFromRow(data);
    },
    update: async (id: string, updates: Partial<Job>): Promise<Job | null> => {
      const row = jobToRow(updates);
      const { data, error } = await supabase.from('jobs').update(row).eq('id', id).select().single();
      if (error || !data) { console.error('db.jobs.update:', error?.message); return null; }
      return jobFromRow(data);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) console.error('db.jobs.delete:', error.message);
    },
  },

  // ── QUOTES ──────────────────────────────────────────────────────
  quotes: {
    getAll: async (): Promise<Quote[]> => {
      const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
      if (error) { console.error('db.quotes.getAll:', error.message); return []; }
      return (data || []).map(quoteFromRow);
    },
    findById: async (id: string): Promise<Quote | undefined> => {
      const { data, error } = await supabase.from('quotes').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return quoteFromRow(data);
    },
    getByClientId: async (clientId: string): Promise<Quote[]> => {
      const { data, error } = await supabase.from('quotes').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
      if (error) { console.error('db.quotes.getByClientId:', error.message); return []; }
      return (data || []).map(quoteFromRow);
    },
    create: async (quote: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> => {
      const row = quoteToRow(quote);
      const { data, error } = await supabase.from('quotes').insert(row).select().single();
      if (error) { console.error('db.quotes.create:', error.message); throw error; }
      return quoteFromRow(data);
    },
    update: async (id: string, updates: Partial<Quote>): Promise<Quote | null> => {
      const row = quoteToRow(updates);
      const { data, error } = await supabase.from('quotes').update(row).eq('id', id).select().single();
      if (error || !data) { console.error('db.quotes.update:', error?.message); return null; }
      return quoteFromRow(data);
    },
    updateStatus: async (id: string, status: Quote['status']): Promise<Quote | null> => {
      const { data, error } = await supabase.from('quotes').update({ status }).eq('id', id).select().single();
      if (error || !data) return null;
      return quoteFromRow(data);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) console.error('db.quotes.delete:', error.message);
    },
  },

  // ── INVOICES ────────────────────────────────────────────────────
  invoices: {
    getAll: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (error) { console.error('db.invoices.getAll:', error.message); return []; }
      return (data || []).map(invoiceFromRow);
    },
    findById: async (id: string): Promise<Invoice | undefined> => {
      const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return invoiceFromRow(data);
    },
    getByClientId: async (clientId: string): Promise<Invoice[]> => {
      const { data, error } = await supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
      if (error) { console.error('db.invoices.getByClientId:', error.message); return []; }
      return (data || []).map(invoiceFromRow);
    },
    create: async (invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> => {
      const row = invoiceToRow(invoice);
      const { data, error } = await supabase.from('invoices').insert(row).select().single();
      if (error) { console.error('db.invoices.create:', error.message); throw error; }
      return invoiceFromRow(data);
    },
    update: async (id: string, updates: Partial<Invoice>): Promise<Invoice | null> => {
      const row = invoiceToRow(updates);
      const { data, error } = await supabase.from('invoices').update(row).eq('id', id).select().single();
      if (error || !data) { console.error('db.invoices.update:', error?.message); return null; }
      return invoiceFromRow(data);
    },
    updateStatus: async (id: string, status: Invoice['status']): Promise<Invoice | null> => {
      const { data, error } = await supabase.from('invoices').update({ status }).eq('id', id).select().single();
      if (error || !data) return null;
      return invoiceFromRow(data);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) console.error('db.invoices.delete:', error.message);
    },
  },

  // ── REQUESTS ────────────────────────────────────────────────────
  requests: {
    getAll: async (): Promise<Request[]> => {
      const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
      if (error) { console.error('db.requests.getAll:', error.message); return []; }
      return (data || []).map(requestFromRow);
    },
    findById: async (id: string): Promise<Request | undefined> => {
      const { data, error } = await supabase.from('requests').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return requestFromRow(data);
    },
    create: async (request: Partial<Request> & { id: string }): Promise<Request> => {
      const row: any = { id: request.id, ...requestToRow(request) };
      if (request.createdAt) row.created_at = request.createdAt;
      const { data, error } = await supabase.from('requests').insert(row).select().single();
      if (error) { console.error('db.requests.create:', error.message); throw error; }
      return requestFromRow(data);
    },
    updateStatus: async (id: string, status: Request['status']): Promise<Request | null> => {
      const { data, error } = await supabase.from('requests').update({ status }).eq('id', id).select().single();
      if (error || !data) return null;
      return requestFromRow(data);
    },
  },

  // ── USERS ───────────────────────────────────────────────────────
  users: {
    getAll: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) { console.error('db.users.getAll:', error.message); return []; }
      return (data || []).map(userFromRow);
    },
    findMany: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) { console.error('db.users.findMany:', error.message); return []; }
      return (data || []).map(userFromRow);
    },
    findById: async (id: string): Promise<User | undefined> => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return userFromRow(data);
    },
    create: async (user: User): Promise<User> => {
      const row = { id: user.id, ...userToRow(user) };
      const { data, error } = await supabase.from('users').insert(row).select().single();
      if (error) { console.error('db.users.create:', error.message); throw error; }
      return userFromRow(data);
    },
    update: async (id: string, updates: Partial<User>): Promise<User | null> => {
      const row = userToRow(updates);
      const { data, error } = await supabase.from('users').update(row).eq('id', id).select().single();
      if (error || !data) { console.error('db.users.update:', error?.message); return null; }
      return userFromRow(data);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) console.error('db.users.delete:', error.message);
    },
  },

  // ── AI FEEDBACK ─────────────────────────────────────────────────
  // AI feedback is managed via Supabase in lib/db/leads.ts (leadAIFeedback)
  aiFeedback: {
    getAll: async (): Promise<AIFeedback[]> => [],
    getRecent: async (_agentType: string, _limit: number = 10): Promise<AIFeedback[]> => [],
    create: async (feedback: Omit<AIFeedback, 'id' | 'timestamp'>): Promise<AIFeedback> => {
      return { ...feedback, id: crypto.randomUUID(), timestamp: new Date().toISOString() } as AIFeedback;
    },
    update: async (_id: string, _updates: Partial<AIFeedback>): Promise<AIFeedback | null> => null,
  },

  // ── SCHEDULED FOLLOW-UPS ────────────────────────────────────────
  // Follow-ups are managed via Supabase in lib/db/leads.ts (leadFollowUps)
  scheduledFollowUps: {
    getAll: async (): Promise<ScheduledFollowUp[]> => [],
    findById: async (_id: string): Promise<ScheduledFollowUp | undefined> => undefined,
    create: async (followUp: ScheduledFollowUp): Promise<ScheduledFollowUp> => followUp,
    update: async (_id: string, _updates: Partial<ScheduledFollowUp>): Promise<ScheduledFollowUp | null> => null,
    getPending: async (): Promise<ScheduledFollowUp[]> => [],
  },

  // ── CALL LOGS ───────────────────────────────────────────────────
  // Call logs are managed via Supabase in lib/db/voice.ts (voiceCallLogs)
  callLogs: {
    getAll: async (): Promise<CallLog[]> => [],
    create: async (log: Omit<CallLog, 'id'>): Promise<CallLog> => {
      return { ...log, id: crypto.randomUUID() } as CallLog;
    },
    findByCallSid: async (_callSid: string): Promise<CallLog | undefined> => undefined,
    update: async (_callSid: string, _updates: Partial<CallLog>): Promise<CallLog | null> => null,
  },

  // ── CALL CONVERSATIONS ─────────────────────────────────────────
  // Conversations are managed via Supabase in lib/db/voice.ts (callConversations)
  callConversations: {
    get: async (_callSid: string): Promise<CallConversation | undefined> => undefined,
    upsert: async (conversation: CallConversation): Promise<CallConversation> => conversation,
    remove: async (_callSid: string): Promise<void> => {},
    cleanup: async (): Promise<void> => {},
  },

  // ── CONTRACTOR AVAILABILITY ─────────────────────────────────────
  contractorAvailability: {
    getAll: async (): Promise<ContractorAvailability[]> => {
      const { data, error } = await supabase.from('contractor_availability').select('*');
      if (error) { console.error('db.contractorAvailability.getAll:', error.message); return []; }
      return (data || []).map((r: any) => ({ id: r.id, contractorId: r.contractor_id, dayOfWeek: r.day_of_week, startTime: r.start_time, endTime: r.end_time }));
    },
    getByContractorId: async (contractorId: string): Promise<ContractorAvailability[]> => {
      const { data, error } = await supabase.from('contractor_availability').select('*').eq('contractor_id', contractorId);
      if (error) { console.error('db.contractorAvailability.getByContractorId:', error.message); return []; }
      return (data || []).map((r: any) => ({ id: r.id, contractorId: r.contractor_id, dayOfWeek: r.day_of_week, startTime: r.start_time, endTime: r.end_time }));
    },
    setDay: async (contractorId: string, dayOfWeek: number, startTime: string, endTime: string): Promise<void> => {
      const { error } = await supabase.from('contractor_availability').upsert({ contractor_id: contractorId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime }, { onConflict: 'contractor_id,day_of_week' });
      if (error) console.error('db.contractorAvailability.setDay:', error.message);
    },
    removeDay: async (contractorId: string, dayOfWeek: number): Promise<void> => {
      const { error } = await supabase.from('contractor_availability').delete().eq('contractor_id', contractorId).eq('day_of_week', dayOfWeek);
      if (error) console.error('db.contractorAvailability.removeDay:', error.message);
    },
  },

  // ── CONTRACTOR BLOCKS ───────────────────────────────────────────
  contractorBlocks: {
    _map: (r: any): ContractorBlock => ({
      id: r.id,
      contractorId: r.contractor_id,
      blockDate: r.block_date,
      blockType: r.block_type || 'full',
      availableFrom: r.available_from || undefined,
      availableTo: r.available_to || undefined,
      reason: r.reason || undefined,
      createdAt: r.created_at,
    }),
    getByContractorId: async (contractorId: string): Promise<ContractorBlock[]> => {
      const { data, error } = await supabase.from('contractor_blocks').select('*').eq('contractor_id', contractorId).order('block_date', { ascending: true });
      if (error) { console.error('db.contractorBlocks.getByContractorId:', error.message); return []; }
      return (data || []).map((r: any) => db.contractorBlocks._map(r));
    },
    getByDate: async (date: string): Promise<ContractorBlock[]> => {
      const { data, error } = await supabase.from('contractor_blocks').select('*').eq('block_date', date);
      if (error) { console.error('db.contractorBlocks.getByDate:', error.message); return []; }
      return (data || []).map((r: any) => db.contractorBlocks._map(r));
    },
    create: async (contractorId: string, blockDate: string, blockType: 'full' | 'partial' = 'full', availableFrom?: string, availableTo?: string, reason?: string): Promise<ContractorBlock> => {
      const { data, error } = await supabase.from('contractor_blocks').insert({ contractor_id: contractorId, block_date: blockDate, block_type: blockType, available_from: availableFrom || null, available_to: availableTo || null, reason: reason || null }).select().single();
      if (error) { console.error('db.contractorBlocks.create:', error.message); throw error; }
      return db.contractorBlocks._map(data);
    },
    upsert: async (contractorId: string, blockDate: string, blockType: 'full' | 'partial', availableFrom?: string, availableTo?: string, reason?: string): Promise<ContractorBlock> => {
      // Delete existing block for this date first, then insert fresh
      await supabase.from('contractor_blocks').delete().eq('contractor_id', contractorId).eq('block_date', blockDate);
      return db.contractorBlocks.create(contractorId, blockDate, blockType, availableFrom, availableTo, reason);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('contractor_blocks').delete().eq('id', id);
      if (error) console.error('db.contractorBlocks.delete:', error.message);
    },
    deleteByDate: async (contractorId: string, blockDate: string): Promise<void> => {
      const { error } = await supabase.from('contractor_blocks').delete().eq('contractor_id', contractorId).eq('block_date', blockDate);
      if (error) console.error('db.contractorBlocks.deleteByDate:', error.message);
    },
  },

  // ── CONTRACTOR APPLICATIONS ─────────────────────────────────────
  contractorApplications: {
    getAll: async (): Promise<ContractorApplication[]> => {
      const { data, error } = await supabase.from('contractor_applications').select('*').order('submitted_at', { ascending: false });
      if (error) { console.error('db.contractorApplications.getAll:', error.message); return []; }
      return (data || []).map(contractorAppFromRow);
    },
    findById: async (id: string): Promise<ContractorApplication | undefined> => {
      const { data, error } = await supabase.from('contractor_applications').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return contractorAppFromRow(data);
    },
    create: async (app: ContractorApplication): Promise<ContractorApplication> => {
      const row = { id: app.id, ...contractorAppToRow(app), submitted_at: app.submittedAt };
      const { data, error } = await supabase.from('contractor_applications').insert(row).select().single();
      if (error) { console.error('db.contractorApplications.create:', error.message); throw error; }
      return contractorAppFromRow(data);
    },
    update: async (id: string, updates: Partial<ContractorApplication>): Promise<ContractorApplication | null> => {
      const row = contractorAppToRow(updates);
      const { data, error } = await supabase.from('contractor_applications').update(row).eq('id', id).select().single();
      if (error || !data) { console.error('db.contractorApplications.update:', error?.message); return null; }
      return contractorAppFromRow(data);
    },
    findByEmail: async (email: string): Promise<ContractorApplication | undefined> => {
      const { data, error } = await supabase.from('contractor_applications').select('*').eq('email', email).single();
      if (error || !data) return undefined;
      return contractorAppFromRow(data);
    },
  },
};
