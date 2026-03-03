'use server';

import { readDb, writeDb } from '@/lib/db';
import { ContractorApplication, User } from '@/lib/types';

export async function getContractorApplications(): Promise<ContractorApplication[]> {
  const data = await readDb();
  return (data.contractorApplications || []).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function getContractors(): Promise<User[]> {
  const data = await readDb();
  return data.users.filter(u => u.role === 'CONTRACTOR');
}

export async function approveApplication(applicationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await readDb();
    if (!data.contractorApplications) return { success: false, error: 'No applications found' };

    const appIndex = data.contractorApplications.findIndex(a => a.id === applicationId);
    if (appIndex === -1) return { success: false, error: 'Application not found' };

    const application = data.contractorApplications[appIndex];
    if (application.status !== 'pending') return { success: false, error: 'Application is not pending' };

    // Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user account
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      pin,
      role: 'CONTRACTOR',
      active: true,
      phone: application.phone,
      skills: application.skills,
      completedJobs: 0,
      totalEarnings: 0,
    };

    data.users.push(newUser);

    // Update application status
    data.contractorApplications[appIndex] = {
      ...application,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
    };

    await writeDb(data);

    console.log(`✅ Contractor approved: ${newUser.name} (${newUser.email}) — PIN: ${pin}`);

    return { success: true };
  } catch (error) {
    console.error('Error approving application:', error);
    return { success: false, error: 'Failed to approve application' };
  }
}

export async function rejectApplication(applicationId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await readDb();
    if (!data.contractorApplications) return { success: false, error: 'No applications found' };

    const appIndex = data.contractorApplications.findIndex(a => a.id === applicationId);
    if (appIndex === -1) return { success: false, error: 'Application not found' };

    const application = data.contractorApplications[appIndex];
    if (application.status !== 'pending') return { success: false, error: 'Application is not pending' };

    data.contractorApplications[appIndex] = {
      ...application,
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
    };

    await writeDb(data);

    console.log(`❌ Contractor rejected: ${application.firstName} ${application.lastName} — Reason: ${reason}`);

    return { success: true };
  } catch (error) {
    console.error('Error rejecting application:', error);
    return { success: false, error: 'Failed to reject application' };
  }
}

export async function toggleContractorActive(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await readDb();
    const index = data.users.findIndex(u => u.id === userId && u.role === 'CONTRACTOR');
    if (index === -1) return { success: false, error: 'Contractor not found' };

    data.users[index].active = !data.users[index].active;
    await writeDb(data);

    return { success: true };
  } catch (error) {
    console.error('Error toggling contractor:', error);
    return { success: false, error: 'Failed to update contractor' };
  }
}
