/**
 * Cold Lead Sequence Manager
 * Handles long-term nurture for leads scoring <50
 */

import { db } from '../db';
import { EmailService } from '../email/EmailService';
import { LeadData } from './LeadRouter';

export interface ScheduledFollowUp {
  id: string;
  leadId: string;
  scheduledFor: Date;
  type: 'educational' | 'case-study' | 'seasonal' | 're-engagement';
  completed: boolean;
}

export class ColdLeadSequence {
  /**
   * Schedule a follow-up for a cold lead
   */
  static async scheduleFollowUp(lead: LeadData, daysFromNow: number): Promise<void> {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + daysFromNow);

    const followUpType = this.getFollowUpType(daysFromNow);

    const followUp: ScheduledFollowUp = {
      id: `cold_followup_${lead.id}_day${daysFromNow}_${Date.now()}`,
      leadId: lead.id,
      scheduledFor: scheduledDate,
      type: followUpType,
      completed: false,
    };

    console.log(`  📅 Scheduled ${followUpType} for ${lead.name} on ${scheduledDate.toLocaleDateString()}`);
    
    // TODO: Save to database
    // await db.followUps.create(followUp);
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
  static async executeFollowUp(followUp: ScheduledFollowUp): Promise<boolean> {
    try {
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
    // TODO: Integrate with newsletter service (Mailchimp, ConvertKit, etc.)
    console.log(`📰 Adding ${lead.name} to monthly newsletter`);
  }
}
