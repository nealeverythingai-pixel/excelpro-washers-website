/**
 * Warm Lead Sequence Manager
 * Handles automated follow-ups for leads scoring 50-79
 */

import { db } from '../db';
import { EmailService } from '../email/EmailService';
import { LeadData } from './LeadRouter';
import { ScheduledFollowUp } from '../types';

export class WarmLeadSequence {
  /**
   * Schedule a follow-up for a warm lead
   */
  static async scheduleFollowUp(lead: LeadData, daysFromNow: number): Promise<void> {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + daysFromNow);

    const followUpType = this.getFollowUpType(daysFromNow);

    // Store in database for cron job to process
    const followUp = {
      id: `followup_${lead.id}_day${daysFromNow}_${Date.now()}`,
      leadId: lead.id,
      category: 'warm' as const,
      type: followUpType,
      scheduledFor: scheduledDate.toISOString(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    // Save to database
    await db.scheduledFollowUps.create(followUp);
    
    console.log(`  📅 Scheduled ${followUpType} for ${lead.name} on ${scheduledDate.toLocaleDateString()}`);
  }

  /**
   * Get follow-up type based on days
   */
  private static getFollowUpType(days: number): 'follow-up' | 'special-offer' | 'final-check' {
    if (days <= 3) return 'follow-up';
    if (days <= 7) return 'special-offer';
    return 'final-check';
  }

  /**
   * Execute scheduled follow-up (called by cron job)
   */
  static async executeFollowUp(followUp: ScheduledFollowUp): Promise<boolean> {
    try {
      // Get lead data from database
      const lead = await db.requests.findById(followUp.leadId);
      if (!lead) {
        console.error(`Lead ${followUp.leadId} not found`);
        return false;
      }

      const leadData: LeadData = {
        id: lead.id,
        name: lead.name || `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone,
        service: lead.service || 'services',
        details: lead.details || lead.message,
        score: lead.aiScore || 0,
        category: lead.aiCategory as 'hot' | 'warm' | 'cold',
        estimatedValue: lead.estimatedValue || 0,
      };

      switch (followUp.type) {
        case 'follow-up':
          return await this.sendFollowUpEmail(leadData, 3);
        
        case 'special-offer':
          return await this.sendSpecialOfferEmail(leadData);
        
        case 'final-check':
          return await this.sendFinalCheckEmail(leadData, 14);
        
        default:
          console.error(`Unknown follow-up type: ${followUp.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Failed to execute follow-up ${followUp.id}:`, error);
      return false;
    }
  }

  /**
   * Day 3: Check-in email
   */
  private static async sendFollowUpEmail(lead: LeadData, daysSince: number): Promise<boolean> {
    console.log(`📧 Sending Day ${daysSince} follow-up to ${lead.name}`);
    
    return await EmailService.sendFollowUp({
      name: lead.name,
      email: lead.email,
      service: lead.service,
      daysSince,
    });
  }

  /**
   * Day 7: Special offer
   */
  private static async sendSpecialOfferEmail(lead: LeadData): Promise<boolean> {
    console.log(`🎁 Sending Day 7 special offer to ${lead.name}`);
    
    return await EmailService.sendSpecialOffer({
      name: lead.name,
      email: lead.email,
      service: lead.service,
      originalPrice: lead.estimatedValue,
    });
  }

  /**
   * Day 14: Final check-in
   */
  private static async sendFinalCheckEmail(lead: LeadData, daysSince: number): Promise<boolean> {
    console.log(`📧 Sending Day ${daysSince} final check-in to ${lead.name}`);
    
    return await EmailService.sendFollowUp({
      name: lead.name,
      email: lead.email,
      service: lead.service,
      daysSince,
    });
  }

  /**
   * Get pending follow-ups (for cron job)
   */
  static async getPendingFollowUps(): Promise<ScheduledFollowUp[]> {
    // TODO: Implement database query
    // return await db.followUps.find({ 
    //   completed: false,
    //   scheduledFor: { $lte: new Date() }
    // });
    
    return [];
  }

  /**
   * Mark follow-up as completed
   */
  static async markCompleted(followUpId: string): Promise<void> {
    // TODO: Implement database update
    // await db.followUps.update(followUpId, { completed: true });
    console.log(`✅ Follow-up ${followUpId} marked as completed`);
  }
}
