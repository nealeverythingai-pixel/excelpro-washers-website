/**
 * Cold Lead Sequence Manager
 * Handles long-term nurture for leads scoring <50
 */

import { leadFollowUps, leadRequests, type LeadFollowUp } from '../db/leads';
import { EmailService } from '../email/EmailService';
import { LeadData } from './LeadRouter';

export class ColdLeadSequence {
  /**
   * Schedule a follow-up for a cold lead
   */
  static async scheduleFollowUp(lead: LeadData, daysFromNow: number): Promise<void> {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + daysFromNow);

    const followUpType = this.getFollowUpType(daysFromNow);

    const followUp = {
      id: `cold_followup_${lead.id}_day${daysFromNow}_${Date.now()}`,
      lead_id: lead.id,
      category: 'cold' as const,
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
  private static getFollowUpType(days: number): 'educational' | 'case-study' | 'seasonal' | 're-engagement' {
    if (days <= 7) return 'case-study';
    if (days <= 30) return 'seasonal';
    return 're-engagement';
  }

  /**
   * Execute scheduled follow-up (called by cron job)
   */
  static async executeFollowUp(followUp: LeadFollowUp): Promise<boolean> {
    try {
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
        category: (lead.ai_category as 'hot' | 'warm' | 'cold') || 'cold',
        estimatedValue: lead.estimated_value || 0,
      };

      switch (followUp.type) {
        case 'case-study':
          return await this.sendCaseStudyEmail(leadData);
        
        case 'seasonal':
          return await this.sendSeasonalEmail(leadData);
        
        case 're-engagement':
          return await this.sendReEngagementEmail(leadData);
        
        default:
          console.error(`Unknown follow-up type: ${followUp.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Failed to execute cold lead follow-up ${followUp.id}:`, error);
      return false;
    }
  }

  /**
   * Day 7: Before/After case study
   */
  private static async sendCaseStudyEmail(lead: LeadData): Promise<boolean> {
    console.log(`📸 Sending Day 7 case study to ${lead.name}`);
    
    // For now, use educational email (we can create a dedicated case study template later)
    return await EmailService.sendEducationalEmail({
      name: lead.name,
      email: lead.email,
      service: lead.service,
    });
  }

  /**
   * Day 30: Seasonal reminder
   */
  private static async sendSeasonalEmail(lead: LeadData): Promise<boolean> {
    console.log(`🌸 Sending Day 30 seasonal reminder to ${lead.name}`);
    
    return await EmailService.sendFollowUp({
      name: lead.name,
      email: lead.email,
      service: lead.service,
      daysSince: 30,
    });
  }

  /**
   * Day 90: Re-engagement with special offer
   */
  private static async sendReEngagementEmail(lead: LeadData): Promise<boolean> {
    console.log(`🎁 Sending Day 90 re-engagement to ${lead.name}`);
    
    return await EmailService.sendSpecialOffer({
      name: lead.name,
      email: lead.email,
      service: lead.service,
      originalPrice: lead.estimatedValue || 250, // Default estimate
    });
  }

  /**
   * Add to newsletter for continued engagement
   */
  static async addToNewsletter(lead: LeadData): Promise<void> {
    const { subscribers } = await import('@/lib/db/subscribers');
    const result = await subscribers.subscribe({
      email: lead.email,
      name: lead.name,
      source: 'cold-lead',
    });
    if (result.success) {
      console.log(`📰 Added ${lead.name} to newsletter`);
    } else {
      console.error(`📰 Failed to add ${lead.name} to newsletter:`, result.error);
    }
  }
}
