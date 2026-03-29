'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Send, Users, TrendingUp, Plus, Trash2, Eye } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  source: string;
  status: string;
  created_at: string;
}

interface Campaign {
  id: string;
  subject: string;
  status: string;
  sent_at?: string;
  sent_to_count?: number;
  created_at: string;
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  sources: Record<string, number>;
}

export default function EmailMarketingPage() {
  const [tab, setTab] = useState<'compose' | 'subscribers' | 'campaigns'>('compose');
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscriberList, setSubscriberList] = useState<Subscriber[]>([]);
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Campaign compose state
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/email-marketing');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setSubscriberList(data.subscribers || []);
        setCampaignList(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to fetch email marketing data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSendCampaign = async () => {
    if (!subject.trim() || !bodyHtml.trim()) {
      setSendResult({ success: false, message: 'Subject and body are required' });
      return;
    }

    const confirmed = window.confirm(
      `Send this campaign to ${stats?.active || 0} active subscribers?\n\nSubject: ${subject}`
    );
    if (!confirmed) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyHtml }),
      });
      const data = await res.json();

      if (res.ok) {
        setSendResult({ success: true, message: `Campaign sent to ${data.sent}/${data.total} subscribers!` });
        setSubject('');
        setBodyHtml('');
        fetchData();
      } else {
        setSendResult({ success: false, message: data.error || 'Send failed' });
      }
    } catch {
      setSendResult({ success: false, message: 'Network error' });
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-green-500" />
        <h1 className="text-2xl font-bold text-zinc-100">Email Marketing</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Subscribers" value={stats?.total ?? '—'} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Active" value={stats?.active ?? '—'} color="text-green-400" />
        <StatCard icon={<Trash2 className="h-5 w-5" />} label="Unsubscribed" value={stats?.unsubscribed ?? '—'} color="text-red-400" />
        <StatCard icon={<Send className="h-5 w-5" />} label="Campaigns Sent" value={campaignList.filter(c => c.status === 'sent').length} color="text-blue-400" />
      </div>

      {/* Source Breakdown */}
      {stats?.sources && Object.keys(stats.sources).length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="text-sm font-medium text-zinc-500 mb-2">Subscriber Sources</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.sources).map(([source, count]) => (
              <span key={source} className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full">
                {source}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
        {(['compose', 'subscribers', 'campaigns'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'
            }`}
          >
            {t === 'compose' && <><Plus className="inline h-4 w-4 mr-1" /> Compose</>}
            {t === 'subscribers' && <><Users className="inline h-4 w-4 mr-1" /> Subscribers</>}
            {t === 'campaigns' && <><Send className="inline h-4 w-4 mr-1" /> History</>}
          </button>
        ))}
      </div>

      {/* Compose Tab */}
      {tab === 'compose' && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Compose Campaign</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Spring Cleaning Special — 20% Off This Week!"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Email Body (HTML)
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="ml-2 text-green-400 hover:text-green-300 text-xs"
                >
                  <Eye className="inline h-3 w-3 mr-0.5" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
              </label>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={12}
                placeholder={'<h2>Spring Cleaning Special 🌸</h2>\n<p>Hi there!</p>\n<p>Book any service this week and get <strong>20% off</strong>.</p>\n<p>Reply to this email or call us at (343) 321-5300.</p>'}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
              />
            </div>

            {showPreview && bodyHtml && (
              <div className="border border-zinc-700 rounded-lg p-6 bg-zinc-800">
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                <hr className="my-4 border-zinc-700" />
                <p className="text-zinc-500 text-xs text-center">
                  ExcelPro Washers • Ottawa, ON, Canada<br />
                  <span className="underline">Unsubscribe</span>
                </p>
              </div>
            )}

            {sendResult && (
              <div className={`p-3 rounded-lg text-sm ${
                sendResult.success
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {sendResult.message}
              </div>
            )}

            <button
              onClick={handleSendCampaign}
              disabled={sending || !subject.trim() || !bodyHtml.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : `Send to ${stats?.active || 0} Active Subscribers`}
            </button>
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {tab === 'subscribers' && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">
              Subscribers ({subscriberList.length})
            </h2>
          </div>
          {loading ? (
            <p className="p-6 text-zinc-500 text-center">Loading...</p>
          ) : subscriberList.length === 0 ? (
            <p className="p-6 text-zinc-500 text-center">No subscribers yet. They&apos;ll appear here once people sign up.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800 text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Source</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {subscriberList.map((sub) => (
                    <tr key={sub.id} className="hover:bg-zinc-800">
                      <td className="px-4 py-3 text-zinc-100">{sub.email}</td>
                      <td className="px-4 py-3 text-zinc-400">{sub.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">{sub.source}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          sub.status === 'active' ? 'bg-green-500/15 text-green-400' :
                          sub.status === 'unsubscribed' ? 'bg-red-500/15 text-red-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {tab === 'campaigns' && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">Campaign History</h2>
          </div>
          {campaignList.length === 0 ? (
            <p className="p-6 text-zinc-500 text-center">No campaigns sent yet.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {campaignList.map((campaign) => (
                <div key={campaign.id} className="p-4 hover:bg-zinc-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-zinc-100 font-medium">{campaign.subject}</h3>
                      <p className="text-zinc-500 text-sm mt-1">
                        {campaign.status === 'sent'
                          ? `Sent to ${campaign.sent_to_count} subscribers on ${new Date(campaign.sent_at!).toLocaleDateString()}`
                          : 'Draft'}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      campaign.status === 'sent'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color = 'text-zinc-100' }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center gap-2 text-zinc-500 mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
