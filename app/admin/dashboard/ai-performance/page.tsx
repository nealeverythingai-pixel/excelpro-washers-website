'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Zap,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Bell
} from 'lucide-react';

interface AIPerformanceMetrics {
  totalLeads: number;
  accuracyRate: number;
  averageScore: number;
  categoryBreakdown: {
    hot: number;
    warm: number;
    cold: number;
  };
  conversionRates: {
    hot: number;
    warm: number;
    cold: number;
  };
  recentDecisions: Array<{
    id: string;
    timestamp: string;
    leadName: string;
    aiScore: number;
    aiCategory: string;
    aiReasoning: string;
    estimatedValue: number;
    actualOutcome?: 'converted' | 'lost' | 'pending';
    feedback?: 'accurate' | 'inaccurate';
  }>;
}

export default function AIPerformancePage() {
  const [metrics, setMetrics] = useState<AIPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchPerformanceMetrics();
    // Check if notifications are enabled
    const notifEnabled = localStorage.getItem('ai-notifications-enabled') === 'true';
    setNotificationsEnabled(notifEnabled);
  }, []);

  const fetchPerformanceMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai-performance');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch AI performance:', error);
    }
    setLoading(false);
  };

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('ai-notifications-enabled', newState.toString());
    
    // Update server-side notification preferences
    await fetch('/api/admin/notifications/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiLeadNotifications: newState })
    });
  };

  const provideFeedback = async (leadId: string, feedback: 'accurate' | 'inaccurate') => {
    try {
      await fetch('/api/admin/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, feedback })
      });
      fetchPerformanceMetrics();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const exportData = () => {
    if (!metrics) return;
    
    const csv = [
      ['Lead Name', 'AI Score', 'Category', 'Estimated Value', 'Actual Outcome', 'Timestamp'],
      ...metrics.recentDecisions.map(d => [
        d.leadName,
        d.aiScore,
        d.aiCategory,
        d.estimatedValue,
        d.actualOutcome || 'pending',
        new Date(d.timestamp).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-performance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load AI performance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary-600" />
            AI Performance Monitoring
          </h1>
          <p className="text-gray-600 mt-1">Track how AI qualifies and scores each lead</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            onClick={toggleNotifications}
          >
            <Bell className="h-4 w-4 mr-2" />
            {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          <Button onClick={fetchPerformanceMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads Analyzed</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              AI-powered qualification
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>AI Accuracy Rate</CardDescription>
            <CardTitle className="text-3xl">{metrics.accuracyRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="h-4 w-4 mr-1" />
              Based on feedback
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl">{metrics.averageScore}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">Out of 100</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hot Lead Conversion</CardDescription>
            <CardTitle className="text-3xl">{metrics.conversionRates.hot}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              High accuracy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Distribution</CardTitle>
          <CardDescription>How AI categorizes incoming leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">🔥 Hot Leads</span>
                <Badge variant="destructive">{metrics.categoryBreakdown.hot}</Badge>
              </div>
              <div className="text-2xl font-bold text-red-900">{metrics.conversionRates.hot}%</div>
              <div className="text-xs text-red-600">conversion rate</div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-700">🌡️ Warm Leads</span>
                <Badge className="bg-yellow-500">{metrics.categoryBreakdown.warm}</Badge>
              </div>
              <div className="text-2xl font-bold text-yellow-900">{metrics.conversionRates.warm}%</div>
              <div className="text-xs text-yellow-600">conversion rate</div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">❄️ Cold Leads</span>
                <Badge variant="secondary">{metrics.categoryBreakdown.cold}</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900">{metrics.conversionRates.cold}%</div>
              <div className="text-xs text-blue-600">conversion rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent AI Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Decisions</CardTitle>
          <CardDescription>Monitor and provide feedback on AI lead qualification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentDecisions.map((decision) => (
              <div key={decision.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{decision.leadName}</h4>
                      <Badge variant={
                        decision.aiCategory === 'hot' ? 'destructive' :
                        decision.aiCategory === 'warm' ? 'default' :
                        'secondary'
                      }>
                        {decision.aiCategory.toUpperCase()}
                      </Badge>
                      {decision.actualOutcome && (
                        <Badge variant={decision.actualOutcome === 'converted' ? 'default' : 'outline'}>
                          {decision.actualOutcome}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(decision.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{decision.aiScore}</div>
                    <div className="text-xs text-gray-500">AI Score</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                  <strong>AI Reasoning:</strong> {decision.aiReasoning}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-600">Estimated Value:</span>
                    <span className="font-semibold text-gray-900 ml-2">${decision.estimatedValue}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={decision.feedback === 'accurate' ? 'default' : 'outline'}
                      onClick={() => provideFeedback(decision.id, 'accurate')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Accurate
                    </Button>
                    <Button
                      size="sm"
                      variant={decision.feedback === 'inaccurate' ? 'destructive' : 'outline'}
                      onClick={() => provideFeedback(decision.id, 'inaccurate')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Inaccurate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
