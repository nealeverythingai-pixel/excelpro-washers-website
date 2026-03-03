import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PREFERENCES_FILE = join(process.cwd(), '.notification-preferences.json');

interface NotificationPreferences {
  aiLeadNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  slackNotifications: boolean;
  updatedAt: string;
}

/**
 * GET /api/admin/notifications/preferences
 * 
 * Get current notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    let preferences: NotificationPreferences = {
      aiLeadNotifications: true,
      emailNotifications: false,
      smsNotifications: false,
      slackNotifications: false,
      updatedAt: new Date().toISOString()
    };

    // Load preferences from file if it exists
    if (existsSync(PREFERENCES_FILE)) {
      const data = readFileSync(PREFERENCES_FILE, 'utf-8');
      preferences = JSON.parse(data);
    }

    return NextResponse.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error('Error loading notification preferences:', error);
    
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications/preferences
 * 
 * Update notification preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Load existing preferences
    let preferences: NotificationPreferences = {
      aiLeadNotifications: true,
      emailNotifications: false,
      smsNotifications: false,
      slackNotifications: false,
      updatedAt: new Date().toISOString()
    };

    if (existsSync(PREFERENCES_FILE)) {
      const data = readFileSync(PREFERENCES_FILE, 'utf-8');
      preferences = JSON.parse(data);
    }

    // Update with new values
    if (typeof body.aiLeadNotifications === 'boolean') {
      preferences.aiLeadNotifications = body.aiLeadNotifications;
    }
    if (typeof body.emailNotifications === 'boolean') {
      preferences.emailNotifications = body.emailNotifications;
    }
    if (typeof body.smsNotifications === 'boolean') {
      preferences.smsNotifications = body.smsNotifications;
    }
    if (typeof body.slackNotifications === 'boolean') {
      preferences.slackNotifications = body.slackNotifications;
    }

    preferences.updatedAt = new Date().toISOString();

    // Save to file
    writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2), 'utf-8');

    console.log('✅ Notification preferences updated:', preferences);

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
