/**
 * Lead Router — Single orchestrator for all post-qualification automation.
 * Owns: owner notifications, customer emails, follow-up scheduling.
 * Callers (e.g. /api/contact) should NOT duplicate these actions.
 */

import { EmailService } from '../email/EmailService';
import { NotificationService } from '../notifications/NotificationService';
import { leadRequests, leadFollowUps } from '../db/leads';
import { WarmLeadSequence } from './WarmLeadSequence';
import { ColdLeadSequence } from './ColdLeadSequence';

// ─── Shared score thresholds (used by LeadQualifier too) ────────────
export const SCORE_THRESHOLDS = {
  HOT: 80,   // 80-100
  WARM: 50,  // 50-79
  // below 50 = cold
} as const;

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
  quoteTotal?: number;
  message?: string;
}

export class LeadRouter {
  /**
   * Route lead to appropriate automation based on score.
   * This is the SINGLE place that triggers notifications, emails, and follow-ups.
   */
  static async routeLead(lead: LeadData): Promise<void> {
    console.log(`\n🎯 Routing lead: ${lead.name} (Score: ${lead.score}/100, Category: ${lead.category.toUpperCase()})`);

    // Guard: skip if lead already converted/lost/archived
    const existing = await leadRequests.findById(lead.id);
    if (existing && ['converted', 'lost', 'archived'].includes(existing.status)) {
      console.log(`⏭️  Skipping routing — lead ${lead.id} is already ${existing.status}`);
      return;
    }

    // Guard: skip if follow-ups already exist for this lead (double-submit protection)
    const existingFollowUps = await leadFollowUps.findByLeadId(lead.id);
    if (existingFollowUps.length > 0) {
      console.log(`⏭️  Skipping routing — lead ${lead.id} already has ${existingFollowUps.length} follow-ups scheduled`);
      return;
    }

    // 1. Notify owner (all categories — NotificationService decides SMS vs email)
    try {
      await NotificationService.notifyNewLead({
        leadName: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        service: lead.service,
        message: lead.message || lead.details || '',
        aiScore: lead.score,
        aiCategory: lead.category,
        aiReasoning: lead.reasoning || '',
        estimatedValue: lead.estimatedValue,
        quoteTotal: lead.quoteTotal || lead.estimatedValue,
      });
    } catch (err) {
      console.error('Owner notification failed (non-critical):', err);
    }

    // 2. Category-specific customer email + follow-up scheduling
    if (lead.score >= SCORE_THRESHOLDS.HOT) {
      await this.handleHotLead(lead);
    } else if (lead.score >= SCORE_THRESHOLDS.WARM) {
      await this.handleWarmLead(lead);
    } else {
      await this.handleColdLead(lead);
    }
  }

  /**
   * HOT LEAD (80-100): Instant quote + 24h follow-up
   */
  private static async handleHotLead(lead: LeadData): Promise<void> {
    console.log('🔥 HOT LEAD DETECTED - Taking immediate action:');

    try {
      // Send instant quote to customer
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

      // Schedule 24-hour follow-up (if owner hasn't called yet)
      console.log('  └─ ⏰ Scheduling 24h follow-up reminder...');
      await WarmLeadSequence.scheduleFollowUp(lead, 1);

      console.log('✅ Hot lead automation complete - Owner should call ASAP!');
    } catch (error) {
      console.error('❌ Hot lead automation failed:', error);
    }
  }

  /**
   * WARM LEAD (50-79): Instant quote + Day 3/7/14 nurture
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
   * COLD LEAD (<50): Educational content + long-term nurture + newsletter
   */
  private static async handleColdLead(lead: LeadData): Promise<void> {
    console.log('❄️ COLD LEAD - Starting long-term nurture:');

    try {
      // Day 0: Educational content (not a quote — they're not ready)
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

      console.log('  ├─ ⏰ Scheduling Day 90 re-engagement...');
      await ColdLeadSequence.scheduleFollowUp(lead, 90);

      // Auto-subscribe to newsletter for continued engagement
      console.log('  └─ 📰 Auto-subscribing to newsletter...');
      await ColdLeadSequence.addToNewsletter(lead);

      console.log('✅ Cold lead sequence initiated - Customer will stay engaged long-term');
    } catch (error) {
      console.error('❌ Cold lead automation failed:', error);
    }
  }

  /**
   * Get human-readable summary of what will happen to this lead
   */
  static getRoutingSummary(score: number): string {
    if (score >= SCORE_THRESHOLDS.HOT) {
      return `🔥 HOT LEAD: Owner notified (SMS+email) + Auto-quote to customer + 24h follow-up`;
    } else if (score >= SCORE_THRESHOLDS.WARM) {
      return `🌡️ WARM LEAD: Owner notified + Auto-quote (Day 0) + Follow-up (Day 3) + Special offer (Day 7) + Final check (Day 14)`;
    } else {
      return `❄️ COLD LEAD: Owner notified + Educational content (Day 0) + Case study (Day 7) + Seasonal (Day 30) + Re-engage (Day 90) + Newsletter`;
    }
  }
}
