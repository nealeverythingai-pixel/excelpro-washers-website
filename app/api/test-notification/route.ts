import { NextRequest, NextResponse } from 'next/server';
import { notifyHotLead } from '@/lib/notifications';

/**
 * POST /api/test-notification
 * 
 * Test endpoint to verify SMS/Discord/Email notifications are working
 * Call this to test your Twilio setup before real leads come in
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'all' } = body;

    console.log('🧪 Testing notification system...');

    // Create a fake hot lead for testing
    const testNotification = {
      leadId: 'test_' + Date.now(),
      name: 'John Smith (TEST)',
      phone: '+1-613-555-0123',
      email: 'test@example.com',
      service: 'Window Cleaning',
      score: 95,
      reasoning: 'TEST: High urgency signals detected. Customer needs service ASAP. Shows strong buying authority.',
      estimatedValue: 299,
      address: '123 Test Street, Ottawa, ON'
    };

    // Send test notification
    await notifyHotLead(testNotification);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent! Check your phone/Discord/email.',
      testData: {
        leadName: testNotification.name,
        score: testNotification.score,
        estimatedValue: testNotification.estimatedValue,
        channels: ['SMS', 'Discord', 'Email'],
        note: 'This was a test lead - no real customer'
      }
    });

  } catch (error) {
    console.error('❌ Test notification failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Notification test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        help: 'Check your .env.local file for correct Twilio credentials'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test-notification
 * 
 * Check notification configuration status
 */
export async function GET() {
  const config = {
    twilio: {
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
      accountSid: process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing',
      authToken: process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing',
      twilioPhone: process.env.TWILIO_PHONE_NUMBER || '❌ Missing',
      ownerPhone: process.env.OWNER_PHONE_NUMBER || '❌ Missing'
    },
    discord: {
      configured: !!process.env.DISCORD_WEBHOOK_URL,
      webhookUrl: process.env.DISCORD_WEBHOOK_URL ? '✅ Set' : '❌ Missing'
    },
    email: {
      configured: !!process.env.OWNER_EMAIL,
      ownerEmail: process.env.OWNER_EMAIL || '❌ Missing'
    }
  };

  const allConfigured = config.twilio.configured || config.discord.configured || config.email.configured;

  return NextResponse.json({
    status: allConfigured ? 'ready' : 'needs-configuration',
    message: allConfigured 
      ? '✅ At least one notification channel is configured' 
      : '⚠️ No notification channels configured. Add credentials to .env.local',
    channels: config,
    testUrl: '/api/test-notification (POST)',
    instructions: {
      twilio: 'Get from: https://console.twilio.com/',
      discord: 'Get from: Server Settings → Integrations → Webhooks',
      email: 'Add your email address to OWNER_EMAIL'
    }
  });
}
