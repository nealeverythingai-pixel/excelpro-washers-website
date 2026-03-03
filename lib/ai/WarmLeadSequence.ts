/**
 * Warm Lead Sequence Manager
 * Handles automated follow-ups for leads scoring 50-79
 */

import { leadFollowUps, leadRequests, type LeadFollowUp } from '../db/leads';
import { EmailService } from '../email/EmailService';
import { LeadData } from './LeadRouter';

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
      lead_id: lead.id,
      category: 'warm' as const,
      type: followUpType,
      scheduled_for: scheduledDate.toISOString(),
      completed: false,
    };

    // Save to Supabase
    await leadFollowUps.create(followUp);
    
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
  static async executeFollowUp(followUp: LeadFollowUp): Promise<boolean> {
    try {
      // Get lead data from Supabase
      const lead = await leadRequests.findById(followUp.lead_id);
      if (!lead) {
        console.error(`Lead ${followUp.lead_id} not found`);
        return false;
      }

      const leadData: LeadData = {
        id: lead.id,
        name: lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
        email: lead.email,
        phone: lead.phone,
        service: lead.service || 'services',
        details: lead.message || '',
        score: lead.ai_score || 0,
        category: (lead.ai_category as 'hot' | 'warm' | 'cold') || 'warm',
        estimatedValue: lead.estimated_value || 0,
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
  static async getPendingFollowUps(): Promise<LeadFollowUp[]> {
    return leadFollowUps.getPending();
  }

  /**
   * Mark follow-up as completed
   */
  static async markCompleted(followUpId: string): Promise<void> {
    await leadFollowUps.markCompleted(followUpId);
  }
}
