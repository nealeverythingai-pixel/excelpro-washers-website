/**
 * Lead Router - Automatically routes leads to appropriate sequences
 * based on AI qualification score
 */

import { EmailService } from '../email/EmailService';
import { notifyHotLead } from '../notifications';
import { WarmLeadSequence } from './WarmLeadSequence';
import { ColdLeadSequence } from './ColdLeadSequence';

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  details?: string;
  score: number;
  category: 'hot' | 'warm' | 'cold';
  estimatedValue: number;
  reasoning?: string;
  address?: string;
}

export class LeadRouter {
  /**
   * Route lead to appropriate automation based on score
   */
  static async routeLead(lead: LeadData): Promise<void> {
    console.log(`\n🎯 Routing lead: ${lead.name} (Score: ${lead.score}/100, Category: ${lead.category.toUpperCase()})`);

    if (lead.score >= 80) {
      // 🔥 HOT LEAD (80-100)
      await this.handleHotLead(lead);
    } else if (lead.score >= 50) {
      // 🌡️ WARM LEAD (50-79)
      await this.handleWarmLead(lead);
    } else {
      // ❄️ COLD LEAD (<50)
      await this.handleColdLead(lead);
    }
  }

  /**
   * HOT LEAD (80-100): Instant action required
   */
  private static async handleHotLead(lead: LeadData): Promise<void> {
    console.log('🔥 HOT LEAD DETECTED - Taking immediate action:');
    
    try {
      // 1. Send SMS to owner (already implemented)
      console.log('  ├─ 📱 Sending SMS to owner...');
      await notifyHotLead({
        leadId: lead.id || `lead-${Date.now()}`,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        score: lead.score,
        reasoning: lead.reasoning || '',
        estimatedValue: lead.estimatedValue,
        address: lead.address,
      });

      // 2. Send instant quote to customer
      console.log('  ├─ 📧 Sending instant quote to customer...');
      await EmailService.sendInstantQuote({
        name: lead.name,
        email: lead.email,
        service: lead.service,
        estimatedValue: lead.estimatedValue,
        details: lead.details,
        leadCategory: 'hot',
        requestId: lead.id,
      });

      // 3. Schedule 24-hour follow-up (if owner hasn't called yet)
      console.log('  └─ ⏰ Scheduling 24h follow-up reminder...');
      await WarmLeadSequence.scheduleFollowUp(lead, 1); // 1 day

      console.log('✅ Hot lead automation complete - Owner should call ASAP!');
    } catch (error) {
      console.error('❌ Hot lead automation failed:', error);
    }
  }

  /**
   * WARM LEAD (50-79): Automated nurture sequence
   */
  private static async handleWarmLead(lead: LeadData): Promise<void> {
    console.log('🌡️ WARM LEAD - Starting nurture sequence:');
    
    try {
      // Day 0: Instant quote
      console.log('  ├─ 📧 Day 0: Sending instant quote...');
      await EmailService.sendInstantQuote({
        name: lead.name,
        email: lead.email,
        service: lead.service,
        estimatedValue: lead.estimatedValue,
        details: lead.details,
        leadCategory: 'warm',
        requestId: lead.id,
      });

      // Schedule follow-ups
      console.log('  ├─ ⏰ Scheduling Day 3 follow-up...');
      await WarmLeadSequence.scheduleFollowUp(lead, 3);
      
      console.log('  ├─ ⏰ Scheduling Day 7 special offer...');
      await WarmLeadSequence.scheduleFollowUp(lead, 7);
      
      console.log('  └─ ⏰ Scheduling Day 14 final check-in...');
      await WarmLeadSequence.scheduleFollowUp(lead, 14);

      console.log('✅ Warm lead sequence initiated - Customer will receive 4 touchpoints');
    } catch (error) {
      console.error('❌ Warm lead automation failed:', error);
    }
  }

  /**
   * COLD LEAD (<50): Long-term nurture sequence
   */
  private static async handleColdLead(lead: LeadData): Promise<void> {
    console.log('❄️ COLD LEAD - Starting long-term nurture:');
    
    try {
      // Day 0: Educational content
      console.log('  ├─ 📧 Day 0: Sending educational email...');
      await EmailService.sendEducationalEmail({
        name: lead.name,
        email: lead.email,
        service: lead.service,
      });

      // Schedule follow-ups
      console.log('  ├─ ⏰ Scheduling Day 7 follow-up...');
      await ColdLeadSequence.scheduleFollowUp(lead, 7);
      
      console.log('  ├─ ⏰ Scheduling Day 30 seasonal reminder...');
      await ColdLeadSequence.scheduleFollowUp(lead, 30);
      
      console.log('  └─ ⏰ Scheduling Day 90 re-engagement...');
      await ColdLeadSequence.scheduleFollowUp(lead, 90);

      console.log('✅ Cold lead sequence initiated - Customer will stay engaged long-term');
    } catch (error) {
      console.error('❌ Cold lead automation failed:', error);
    }
  }

  /**
   * Get human-readable summary of what will happen to this lead
   */
  static getRoutingSummary(score: number): string {
    if (score >= 80) {
      return `🔥 HOT LEAD: Instant SMS to owner + Auto-quote to customer + 24h follow-up`;
    } else if (score >= 50) {
      return `🌡️ WARM LEAD: Auto-quote (Day 0) + Follow-up (Day 3) + Special offer (Day 7) + Final check (Day 14)`;
    } else {
      return `❄️ COLD LEAD: Educational content (Day 0) + Photos (Day 7) + Seasonal (Day 30) + Re-engage (Day 90)`;
    }
  }
}
