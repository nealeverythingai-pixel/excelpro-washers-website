'use client';

import { useState, useEffect } from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function TestNotificationsPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const checkConfig = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
      const response = await fetch(`${baseUrl}/api/test-notification`);
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to check config:', error);
    }
  };

  const testNotifications = async () => {
    setTesting(true);
    setResult(null);

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || '';
      const response = await fetch(`${baseUrl}/api/test-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'all' })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">🧪 Test Notification System</h1>
        <p className="text-zinc-400 mt-2">
          Verify your SMS, Discord, and Email notifications are working
        </p>
      </div>

      {/* Configuration Status */}
      {config && (
        <SpotlightCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          
          <div className="space-y-4">
            {/* Twilio Status */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">📱 Twilio SMS</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  config.channels.twilio.configured
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {config.channels.twilio.configured ? '✅ Configured' : '❌ Not Configured'}
                </span>
              </div>
              <div className="text-sm text-zinc-400 space-y-1">
                <p>Account SID: {config.channels.twilio.accountSid}</p>
                <p>Auth Token: {config.channels.twilio.authToken}</p>
                <p>Twilio Phone: {config.channels.twilio.twilioPhone}</p>
                <p>Your Phone: {config.channels.twilio.ownerPhone}</p>
              </div>
            </div>

            {/* Discord Status */}
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">💬 Discord Webhook</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  config.channels.discord.configured
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {config.channels.discord.configured ? '✅ Configured' : 'Optional'}
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                <p>Webhook URL: {config.channels.discord.webhookUrl}</p>
              </div>
            </div>

            {/* Email Status */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">📧 Email</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  config.channels.email.configured
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {config.channels.email.configured ? '✅ Configured' : 'Optional'}
                </span>
              </div>
              <div className="text-sm text-zinc-400">
                <p>Owner Email: {config.channels.email.ownerEmail}</p>
              </div>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Test Button */}
      <SpotlightCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Send Test Notification</h2>
        <p className="text-zinc-400 mb-6">
          Click below to send a test "Hot Lead" notification. This will:
        </p>
        <ul className="list-disc list-inside text-zinc-400 mb-6 space-y-1">
          <li>Send SMS to your phone (if Twilio configured)</li>
          <li>Post message to Discord (if webhook configured)</li>
          <li>Log email notification (email service pending)</li>
        </ul>

        <button
          onClick={testNotifications}
          disabled={testing || !config?.channels.twilio.configured}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
            testing || !config?.channels.twilio.configured
              ? 'bg-zinc-700 cursor-not-allowed text-zinc-400'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {testing ? '🔄 Sending Test...' : '📲 Send Test Notification'}
        </button>

        {!config?.channels.twilio.configured && (
          <p className="mt-4 text-center text-sm text-red-400">
            ⚠️ Twilio must be configured to send test notifications
          </p>
        )}
      </SpotlightCard>

      {/* Test Result */}
      {result && (
        <SpotlightCard className={`p-6 ${
          result.success
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <h2 className="text-xl font-semibold mb-4">
            {result.success ? '✅ Test Successful!' : '❌ Test Failed'}
          </h2>

          {result.success ? (
            <div className="space-y-3">
              <p className="text-zinc-200">
                <strong>Test notification sent successfully!</strong>
              </p>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-zinc-400 mb-2">Test Lead Details:</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Name:</strong> {result.testData?.leadName}</li>
                  <li><strong>Score:</strong> {result.testData?.score}/100 (HOT)</li>
                  <li><strong>Value:</strong> ${result.testData?.estimatedValue}</li>
                  <li><strong>Channels:</strong> {result.testData?.channels?.join(', ')}</li>
                </ul>
              </div>
              <p className="text-sm text-green-400 font-semibold mt-4">
                📱 Check your phone for the SMS!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-red-400">
                <strong>Error:</strong> {result.error}
              </p>
              {result.details && (
                <p className="text-sm text-red-400">
                  Details: {result.details}
                </p>
              )}
              {result.help && (
                <p className="text-sm text-zinc-400">
                  💡 {result.help}
                </p>
              )}
            </div>
          )}
        </SpotlightCard>
      )}

      {/* Setup Instructions */}
      <SpotlightCard className="p-6 bg-blue-500/10">
        <h2 className="text-lg font-semibold mb-3">📋 Setup Instructions</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Twilio SMS (Recommended):</h3>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400">
              <li>Go to <a href="https://console.twilio.com/" target="_blank" className="text-blue-400 underline">console.twilio.com</a></li>
              <li>Copy your Account SID and Auth Token</li>
              <li>Get your Twilio phone number from Phone Numbers section</li>
              <li>Add to .env.local file:
                <pre className="bg-zinc-900 text-green-400 p-2 rounded mt-1 text-xs overflow-x-auto">
{`TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+16135551234
OWNER_PHONE_NUMBER=+16135559999`}
                </pre>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Discord Webhook (Optional):</h3>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400">
              <li>Open Discord → Server Settings → Integrations</li>
              <li>Create Webhook → Copy URL</li>
              <li>Add to .env.local:
                <pre className="bg-zinc-900 text-green-400 p-2 rounded mt-1 text-xs overflow-x-auto">
{`DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`}
                </pre>
              </li>
            </ol>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
