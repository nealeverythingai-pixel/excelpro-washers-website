'use client';

import { useState } from 'react';

export default function CronTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCronJob = async (endpoint: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret-123'}`
        }
      });

      const data = await response.json();
      setResult({
        success: response.ok,
        status: response.status,
        data
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cron Job Testing</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Follow-ups Cron</h2>
          <p className="text-gray-600 mb-4">
            Runs daily at 9 AM. Checks for pending follow-ups and sends scheduled emails.
          </p>
          <button
            onClick={() => testCronJob('/api/cron/follow-ups')}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Follow-ups Cron'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Stale Leads Check</h2>
          <p className="text-gray-600 mb-4">
            Runs daily at 6 PM. Finds leads that haven't been contacted in 30+ days.
          </p>
          <button
            onClick={() => testCronJob('/api/cron/check-stale-leads')}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Stale Leads Check'}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg shadow p-6 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className="text-lg font-semibold mb-2">
              {result.success ? '✅ Success' : '❌ Error'}
            </h3>
            <p className="text-sm text-gray-600 mb-2">Status: {result.status}</p>
            <pre className="bg-white p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result.data || result.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
