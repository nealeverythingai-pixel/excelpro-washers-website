/**
 * AI Lead Qualifier
 * Analyzes incoming leads and scores them 0-100 based on:
 * - Urgency signals (ASAP, this week, emergency)
 * - Budget indicators (mentions price, asking for discount)
 * - Decision authority (I need vs my wife wants)
 * - Property details (commercial = higher value)
 */

interface LeadData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  address?: string;
  propertyType?: 'residential' | 'commercial';
}

interface LeadScore {
  overall: number; // 0-100
  urgency: number; // 0-100
  budget: number; // 0-100
  authority: number; // 0-100
  value: number; // 0-100
  category: 'hot' | 'warm' | 'cold';
  reasoning: string;
  nextAction: string;
  estimatedValue: number;
}

interface QualificationResult {
  score: LeadScore;
  quote: {
    personalizedIntro: string;
    services: Array<{
      name: string;
      description: string;
      price: number;
    }>;
    total: number;
    discount?: {
      reason: string;
      amount: number;
    };
  };
  followUpSchedule: {
    day3: string;
    day7: string;
    day14: string;
  };
}

export class AILeadQualifier {
  /**
   * Analyze and score a lead
   */
  async qualifyLead(lead: LeadData): Promise<QualificationResult> {
    try {
      // Call AI to analyze the lead
      const analysis = await this.analyzeWithAI(lead);
      
      // Calculate composite score
      const score = this.calculateScore(analysis, lead);
      
      // Generate personalized quote
      const quote = await this.generateQuote(lead, score);
      
      // Create follow-up schedule
      const followUpSchedule = this.createFollowUpSchedule(score);
      
      return {
        score,
        quote,
        followUpSchedule
      };
    } catch (error) {
      console.error('Lead qualification error:', error);
      
      // Fallback to rule-based scoring if AI fails
      return this.fallbackQualification(lead);
    }
  }

  /**
   * Use AI to analyze lead message for signals
   */
  private async analyzeWithAI(lead: LeadData): Promise<any> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️  No Anthropic API key - using rule-based scoring');
      throw new Error('AI not configured');
    }

    const prompt = `Analyze this lead for a home services business:

Name: ${lead.name}
Service Requested: ${lead.service}
Message: "${lead.message}"
Property: ${lead.propertyType || 'unknown'}

Score each category 0-100:

1. URGENCY - Looking for keywords like:
   - High (90-100): "ASAP", "emergency", "today", "tomorrow", "urgent"
   - Medium (50-89): "this week", "soon", "quickly", "as soon as possible"
   - Low (0-49): "sometime", "eventually", "when you can", "no rush"

2. BUDGET - Analyze financial signals:
   - High (90-100): No price mention, asks about premium options, "best quality"
   - Medium (50-89): Neutral, asks for quote without objections
   - Low (0-49): "cheapest", "budget", "tight on money", mentions competitors' lower prices

3. DECISION AUTHORITY - Who's deciding:
   - High (90-100): "I need", "I want", "I'm looking to hire"
   - Medium (50-89): "We need", "looking into", "considering"
   - Low (0-49): "My wife/husband wants", "getting quotes for someone", "just browsing"

4. PROPERTY VALUE - Estimate job size:
   - High (90-100): Commercial property, large home (3+ stories), multiple services
   - Medium (50-89): Standard 2-story residential, single service
   - Low (0-49): Small property, basic service, price-sensitive indicators

Return ONLY a JSON object with this structure:
{
  "urgency": <score>,
  "budget": <score>,
  "authority": <score>,
  "value": <score>,
  "reasoning": "<2-3 sentence explanation>",
  "keySignals": ["signal1", "signal2"],
  "recommendedAction": "<what to do next>",
  "estimatedJobValue": <dollar amount>
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON in AI response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('✅ AI analysis complete:', analysis);
      return analysis;
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Calculate composite lead score
   */
  private calculateScore(analysis: any, lead: LeadData): LeadScore {
    // Weighted scoring
    const weights = {
      urgency: 0.35,    // Urgent buyers close fast
      budget: 0.25,     // Budget signals buying power
      authority: 0.25,  // Decision makers can say yes
      value: 0.15       // Larger jobs = more revenue
    };

    const overall = Math.round(
      (analysis.urgency * weights.urgency) +
      (analysis.budget * weights.budget) +
      (analysis.authority * weights.authority) +
      (analysis.value * weights.value)
    );

    // Categorize lead
    let category: 'hot' | 'warm' | 'cold';
    if (overall >= 80) category = 'hot';
    else if (overall >= 50) category = 'warm';
    else category = 'cold';

    return {
      overall,
      urgency: analysis.urgency,
      budget: analysis.budget,
      authority: analysis.authority,
      value: analysis.value,
      category,
      reasoning: analysis.reasoning,
      nextAction: analysis.recommendedAction,
      estimatedValue: analysis.estimatedJobValue
    };
  }

  /**
   * Generate personalized quote based on service and lead score
   */
  private async generateQuote(lead: LeadData, score: LeadScore) {
    // Base pricing
    const servicePricing: Record<string, number> = {
      'window-cleaning': 199,
      'soft-wash': 299,
      'pressure-washing': 199,
      'gutter-cleaning': 149,
      'roof-cleaning': 399
    };

    const basePrice = servicePricing[lead.service] || 199;
    
    // Generate personalized intro (AI integration pending)
    const personalizedIntro = this.generatePersonalizedIntro(lead, score);

    // Build service array
    const services = [{
      name: this.formatServiceName(lead.service),
      description: this.getServiceDescription(lead.service),
      price: basePrice
    }];

    // Add discount for hot leads (incentive to book fast)
    let discount;
    if (score.category === 'hot' && score.urgency > 85) {
      discount = {
        reason: 'Book within 48 hours',
        amount: Math.round(basePrice * 0.10) // 10% off
      };
    }

    const total = discount 
      ? basePrice - discount.amount 
      : basePrice;

    return {
      personalizedIntro,
      services,
      total,
      discount
    };
  }

  /**
   * Create follow-up schedule based on lead temperature
   */
  private createFollowUpSchedule(score: LeadScore) {
    const serviceName = this.formatServiceName(score.nextAction ? '' : '');
    if (score.category === 'hot') {
      return {
        day3: `Quick check-in: I wanted to follow up on your quote. Any questions I can answer?`,
        day7: `Special offer: Book this week and save 10% on your service. Limited availability!`,
        day14: `Last call: We have one opening left for next week. Would you like to secure it?`
      };
    } else if (score.category === 'warm') {
      return {
        day3: `Thanks for your interest in ExcelPro. Have you had a chance to review the quote?`,
        day7: `Friendly reminder: Your quote is ready. We'd love to help with your service needs.`,
        day14: `Still interested? I can adjust the quote or answer any questions you have.`
      };
    } else {
      return {
        day3: `Hi there, just checking if you received our quote?`,
        day7: `We're here when you're ready. Your quote is valid for 30 days.`,
        day14: `No pressure! We're here if you have questions about our services.`
      };
    }
  }

  /**
   * Fallback qualification if AI fails
   */
  private fallbackQualification(lead: LeadData): QualificationResult {
    const message = lead.message.toLowerCase();
    
    // Enhanced rule-based scoring
    let urgency = 30;
    // High urgency signals (90-100)
    if (message.includes('emergency') || message.includes('today')) urgency = 95;
    else if (message.includes('tomorrow') || message.includes('asap')) urgency = 85;
    else if (message.includes('urgent') || message.includes('immediately')) urgency = 80;
    // Medium urgency (50-75)
    else if (message.includes('this week') || message.includes('soon') || message.includes('quickly')) urgency = 60;
    // Low urgency patterns
    else if (message.includes('sometime') || message.includes('eventually')) urgency = 20;
    
    let budget = 50;
    // High budget signals (80-100)
    if (message.includes('budget not') || message.includes('budget is not') || message.includes('price not') || message.includes('cost not')) budget = 95;
    else if (message.includes('best quality') || message.includes('premium') || message.includes('top quality')) budget = 85;
    else if (message.includes('not an issue') || message.includes('money is no')) budget = 90;
    // Low budget signals (20-40)
    else if (message.includes('cheap') || message.includes('cheapest') || message.includes('lowest price')) budget = 25;
    else if (message.includes('tight budget') || message.includes('limited funds')) budget = 30;
    
    let authority = 50;
    // High authority (80-100)
    if (message.includes('i need') || message.includes('i want') || message.includes('i require')) authority = 85;
    else if (message.includes('i am looking') || message.includes("i'm looking")) authority = 75;
    // Medium authority (50-70)
    else if (message.includes('we need') || message.includes('we want')) authority = 65;
    // Low authority (20-40)
    else if (message.includes('my wife') || message.includes('my husband') || message.includes('for someone')) authority = 30;
    else if (message.includes('just browsing') || message.includes('just looking')) authority = 20;
    
    // Value scoring based on property details
    let value = 50;
    // High value signals (80-100)
    if (message.includes('commercial') || message.includes('business') || message.includes('office building')) value = 95;
    else if (message.includes('3-story') || message.includes('three story') || message.includes('3 story')) value = 85;
    else if (message.includes('30+ windows') || message.includes('30 windows') || parseInt(message.match(/(\d+)\+?\s*windows?/)?.[1] || '0') >= 20) value = 80;
    else if (message.includes('2-story') || message.includes('two story') || message.includes('2 story')) value = 65;
    else if (message.includes('large') || message.includes('big property')) value = 70;
    // Low value
    else if (message.includes('small') || message.includes('tiny') || message.includes('1-story')) value = 40;
    
    // Check for property type in lead data
    if (lead.propertyType === 'commercial') value = Math.max(value, 90);
    
    const overall = Math.round((urgency + budget + authority + value) / 4);
    
    let category: 'hot' | 'warm' | 'cold';
    if (overall >= 80) category = 'hot';
    else if (overall >= 50) category = 'warm';
    else category = 'cold';

    const servicePricing: Record<string, number> = {
      'window-cleaning': 199,
      'soft-wash': 299,
      'soft-washing': 299,
      'pressure-washing': 199,
      'gutter-cleaning': 149,
      'roof-cleaning': 399
    };

    const basePrice = servicePricing[lead.service] || 199;

    return {
      score: {
        overall,
        urgency,
        budget,
        authority,
        value,
        category,
        reasoning: 'Fallback rule-based scoring (AI unavailable)',
        nextAction: category === 'hot' ? 'Call within 1 hour' : 'Send quote and schedule follow-up',
        estimatedValue: basePrice
      },
      quote: {
        personalizedIntro: `Hi ${lead.name},\n\nThank you for contacting ExcelPro Washers! We'd be happy to help with your ${this.formatServiceName(lead.service)} needs.`,
        services: [{
          name: this.formatServiceName(lead.service),
          description: this.getServiceDescription(lead.service),
          price: basePrice
        }],
        total: basePrice
      },
      followUpSchedule: {
        day3: "Just following up on your quote. Any questions?",
        day7: "Checking in - we'd love to help with your project!",
        day14: "Your quote is still valid. Let us know when you're ready!"
      }
    };
  }

  private formatServiceName(service: string): string {
    return service
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getServiceDescription(service: string): string {
    const descriptions: Record<string, string> = {
      'window-cleaning': 'Professional streak-free window cleaning for your home',
      'soft-wash': 'Gentle yet effective house washing that protects your siding',
      'soft-washing': 'Gentle yet effective house washing that protects your siding',
      'pressure-washing': 'High-powered cleaning for driveways, decks, and patios',
      'gutter-cleaning': 'Thorough gutter cleaning and debris removal',
      'roof-cleaning': 'Safe roof cleaning to remove moss, algae, and stains'
    };
    return descriptions[service] || 'Professional exterior cleaning service';
  }

  /**
   * Generate personalized introduction (template-based)
   * TODO: Replace with AI-generated intros in production
   */
  private generatePersonalizedIntro(lead: LeadData, score: LeadScore): string {
    const serviceName = this.formatServiceName(lead.service);
    
    // Hot leads - enthusiastic, urgent response
    if (score.category === 'hot') {
      return `Hi ${lead.name},\n\nThank you for reaching out! We'd be thrilled to help with your ${serviceName} needs. I can see you're looking to get this done soon, and we have availability this week. Let me put together a quote for you right away.`;
    }
    
    // Warm leads - friendly, helpful
    if (score.category === 'warm') {
      return `Hi ${lead.name},\n\nThank you for contacting ExcelPro Washers! We appreciate your interest in our ${serviceName} services. I've reviewed your request and I'm confident we can provide exactly what you're looking for.`;
    }
    
    // Cold leads - professional, informative
    return `Hi ${lead.name},\n\nThank you for your inquiry about our ${serviceName} services. We'd be happy to provide you with a detailed quote. ExcelPro Washers has been serving the Ottawa area with professional exterior cleaning for years.`;
  }
}
