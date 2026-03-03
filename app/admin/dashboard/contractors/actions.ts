'use server';

import { db } from '@/lib/db';
import { ContractorApplication, User } from '@/lib/types';

export async function getContractorApplications(): Promise<ContractorApplication[]> {
  return db.contractorApplications.getAll();
}

export async function getContractors(): Promise<User[]> {
  const users = await db.users.getAll();
  return users.filter(u => u.role === 'CONTRACTOR');
}

export async function approveApplication(applicationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const application = await db.contractorApplications.findById(applicationId);
    if (!application) return { success: false, error: 'Application not found' };
    if (application.status !== 'pending') return { success: false, error: 'Application is not pending' };

    // Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user account
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
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

    await db.users.create(newUser);

    // Update application status
    await db.contractorApplications.update(applicationId, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
    });

    console.log(`✅ Contractor approved: ${newUser.name} (${newUser.email}) — PIN: ${pin}`);

    return { success: true };
  } catch (error) {
    console.error('Error approving application:', error);
    return { success: false, error: 'Failed to approve application' };
  }
}

export async function rejectApplication(applicationId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const application = await db.contractorApplications.findById(applicationId);
    if (!application) return { success: false, error: 'Application not found' };
    if (application.status !== 'pending') return { success: false, error: 'Application is not pending' };

    await db.contractorApplications.update(applicationId, {
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
    });

    console.log(`❌ Contractor rejected: ${application.firstName} ${application.lastName} — Reason: ${reason}`);

    return { success: true };
  } catch (error) {
    console.error('Error rejecting application:', error);
    return { success: false, error: 'Failed to reject application' };
  }
}

export async function toggleContractorActive(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.users.findById(userId);
    if (!user || user.role !== 'CONTRACTOR') return { success: false, error: 'Contractor not found' };

    await db.users.update(userId, { active: !user.active });

    return { success: true };
  } catch (error) {
    console.error('Error toggling contractor:', error);
    return { success: false, error: 'Failed to update contractor' };
  }
}
