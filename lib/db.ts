import fs from 'fs/promises';
import path from 'path';
import { DbSchema, Client, Job, Quote, Invoice, Request, User, AIFeedback, ScheduledFollowUp } from './types';

// Store data in a hidden file in the project root
const DB_PATH = path.join(process.cwd(), '.local-db.json');

const INITIAL_DB: DbSchema = {
  clients: [
      {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Springfield',
          createdAt: new Date().toISOString(),
      }
  ],
  jobs: [],
  quotes: [],
  invoices: [],
  requests: [],
  users: [],
  scheduledFollowUps: []
};

async function readDb(): Promise<DbSchema> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const existingData = JSON.parse(data);
    // Merge with INITIAL_DB to ensure new fields are present
    return { ...INITIAL_DB, ...existingData };
  } catch (error) {
    // If file doesn't exist, create it with initial data
    await writeDb(INITIAL_DB);
    return INITIAL_DB;
  }
}

async function writeDb(data: DbSchema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  clients: {
    getAll: async () => (await readDb()).clients,
    getById: async (id: string) => (await readDb()).clients.find(c => c.id === id),
    findById: async (id: string) => (await readDb()).clients.find(c => c.id === id),
    create: async (client: Omit<Client, 'id' | 'createdAt'>) => {
      const data = await readDb();
      const newClient: Client = {
        ...client,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      data.clients.push(newClient);
      await writeDb(data);
      return newClient;
    },
    update: async (id: string, updates: Partial<Client>) => {
        const data = await readDb();
        const index = data.clients.findIndex(c => c.id === id);
        if (index === -1) return null;
        data.clients[index] = { ...data.clients[index], ...updates };
        await writeDb(data);
        return data.clients[index];
    },
    delete: async(id: string) => {
        const data = await readDb();
        data.clients = data.clients.filter(c => c.id !== id);
        await writeDb(data);
    }
  },
  jobs: {
    getAll: async () => (await readDb()).jobs,
    findById: async (id: string) => (await readDb()).jobs.find(j => j.id === id),
    getByClientId: async(clientId: string) => (await readDb()).jobs.filter(j => j.clientId === clientId),
    create: async (job: Omit<Job, 'id' | 'createdAt'>) => {
      const data = await readDb();
      const newJob: Job = {
        ...job,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      data.jobs.push(newJob);
      await writeDb(data);
      return newJob;
    },
    update: async (id: string, updates: Partial<Job>) => {
      const data = await readDb();
      const index = data.jobs.findIndex(j => j.id === id);
      if (index !== -1) {
        data.jobs[index] = { ...data.jobs[index], ...updates };
        await writeDb(data);
        return data.jobs[index];
      }
      return null;
    }
  },
  aiFeedback: {
    getAll: async () => (await readDb()).aiFeedback || [],
    getRecent: async (agentType: string, limit: number = 10) => {
        const data = await readDb();
        const feedback = data.aiFeedback || [];
        return feedback
            .filter((f: AIFeedback) => f.agentType === agentType)
            .sort((a: AIFeedback, b: AIFeedback) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    },
    create: async (feedback: Omit<AIFeedback, 'id' | 'timestamp'>) => {
        const data = await readDb();
        if (!data.aiFeedback) data.aiFeedback = [];
        const newFeedback: AIFeedback = {
            ...feedback,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };
        data.aiFeedback.push(newFeedback);
        await writeDb(data);
        return newFeedback;
    },
    update: async (id: string, updates: Partial<AIFeedback>) => {
        const data = await readDb();
        if (!data.aiFeedback) return null;
        const index = data.aiFeedback.findIndex((f: AIFeedback) => f.id === id);
        if (index !== -1) {
            data.aiFeedback[index] = { ...data.aiFeedback[index], ...updates };
            await writeDb(data);
            return data.aiFeedback[index];
        }
        return null;
    }
  },
  quotes: {
    getAll: async () => (await readDb()).quotes,
    findById: async (id: string) => (await readDb()).quotes.find(q => q.id === id),
    getByClientId: async(clientId: string) => (await readDb()).quotes.filter(q => q.clientId === clientId),
    create: async (quote: Omit<Quote, 'id' | 'createdAt'>) => {
      const data = await readDb();
      const newQuote: Quote = {
        ...quote,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      data.quotes.push(newQuote);
      await writeDb(data);
      return newQuote;
    },
    update: async (id: string, updates: Partial<Quote>) => {
      const data = await readDb();
      const index = data.quotes.findIndex(q => q.id === id);
      if (index !== -1) {
        data.quotes[index] = { ...data.quotes[index], ...updates };
        await writeDb(data);
        return data.quotes[index];
      }
      return null;
    },
    updateStatus: async (id: string, status: Quote['status']) => {
      const data = await readDb();
      const index = data.quotes.findIndex(q => q.id === id);
      if (index === -1) return null;
      data.quotes[index].status = status;
      await writeDb(data);
      return data.quotes[index];
    }
  },
  invoices: {
    getAll: async () => (await readDb()).invoices,
    findById: async (id: string) => (await readDb()).invoices.find(i => i.id === id),
    getByClientId: async(clientId: string) => (await readDb()).invoices.filter(i => i.clientId === clientId),
    create: async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
      const data = await readDb();
      const newInvoice: Invoice = {
        ...invoice,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      data.invoices.push(newInvoice);
      await writeDb(data);
      return newInvoice;
    },
    update: async (id: string, updates: Partial<Invoice>) => {
      const data = await readDb();
      const index = data.invoices.findIndex(i => i.id === id);
      if (index !== -1) {
        data.invoices[index] = { ...data.invoices[index], ...updates };
        await writeDb(data);
        return data.invoices[index];
      }
      return null;
    },
    updateStatus: async (id: string, status: Invoice['status']) => {
      const data = await readDb();
      const index = data.invoices.findIndex(i => i.id === id);
      if (index === -1) return null;
      data.invoices[index].status = status;
      await writeDb(data);
      return data.invoices[index];
    }
  },
  requests: {
    getAll: async () => (await readDb()).requests,
    findById: async (id: string) => (await readDb()).requests.find(r => r.id === id),
    create: async (request: Partial<Request> & { id: string }) => {
      const data = await readDb();
      const newRequest: Request = {
        email: request.email || '',
        phone: request.phone || '',
        status: request.status || 'new',
        createdAt: request.createdAt || new Date().toISOString(),
        ...request
      } as Request;
      data.requests.push(newRequest);
      await writeDb(data);
      return newRequest;
    },
    updateStatus: async (id: string, status: Request['status']) => {
        const data = await readDb();
        const index = data.requests.findIndex(r => r.id === id);
        if (index === -1) return null;
        data.requests[index].status = status;
        await writeDb(data);
        return data.requests[index];
    }
  },
  users: {
    getAll: async () => (await readDb()).users,
    findMany: async () => (await readDb()).users,
    findById: async (id: string) => (await readDb()).users.find(u => u.id === id),
    create: async (user: User) => {
        const data = await readDb();
        data.users.push(user);
        await writeDb(data);
        return user;
    },
    update: async (id: string, updates: Partial<User>) => {
        const data = await readDb();
        const index = data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            data.users[index] = { ...data.users[index], ...updates };
            await writeDb(data);
            return data.users[index];
        }
        return null;
    },
    delete: async (id: string) => {
        const data = await readDb();
        data.users = data.users.filter(u => u.id !== id);
        await writeDb(data);
    }
  },
  scheduledFollowUps: {
    getAll: async () => (await readDb()).scheduledFollowUps || [],
    findById: async (id: string) => (await readDb()).scheduledFollowUps?.find(f => f.id === id),
    create: async (followUp: ScheduledFollowUp) => {
      const data = await readDb();
      if (!data.scheduledFollowUps) {
        data.scheduledFollowUps = [];
      }
      data.scheduledFollowUps.push(followUp);
      await writeDb(data);
      return followUp;
    },
    update: async (id: string, updates: Partial<ScheduledFollowUp>) => {
      const data = await readDb();
      if (!data.scheduledFollowUps) return null;
      
      const index = data.scheduledFollowUps.findIndex(f => f.id === id);
      if (index !== -1) {
        data.scheduledFollowUps[index] = { ...data.scheduledFollowUps[index], ...updates };
        await writeDb(data);
        return data.scheduledFollowUps[index];
      }
      return null;
    },
    getPending: async () => {
      const data = await readDb();
      if (!data.scheduledFollowUps) return [];
      
      const now = new Date();
      return data.scheduledFollowUps.filter(f => 
        !f.completed && new Date(f.scheduledFor) <= now
      );
    }
  }
};
