'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Target,
  Database,
  Zap,
  HelpCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

const CACHE_KEY = 'excelpro_insights';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface BusinessInsight {
  businessStage: 'startup' | 'growth' | 'scale-up' | 'enterprise';
  stageProgress: string;
  currentState: {
    summary: string;
    strengths: string[];
    bottlenecks: string[];
  };
  topPriorities: Array<{
    priority: string;
    timeline: string;
    impact: 'critical' | 'high' | 'medium';
    actionItems: string[];
  }>;
  infrastructureRecommendations: Array<{
    tool: string;
    trigger: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string;
    estimatedCost?: string;
  }>;
  predictions: {
    next30Days: {
      revenue: number;
      jobs: number;
      newClients: number;
    };
    next60Days?: {
      revenue: number;
      jobs: number;
      newClients: number;
    };
    milestones: Array<{
      milestone: string;
      estimatedDate: string;
    }>;
  };
  questionsForOwner: Array<{
    question: string;
    why: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  aiAgentPerformance?: Array<{
    agent: string;
    status: string;
    recommendation: string;
  }>;
}

function getCachedInsights(): BusinessInsight | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data as BusinessInsight;
  } catch {
    return null;
  }
}

function setCachedInsights(data: BusinessInsight) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<BusinessInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = useCallback(async (skipCache = false) => {
    try {
      // Check sessionStorage cache first
      if (!skipCache) {
        const cached = getCachedInsights();
        if (cached) {
          setInsights(cached);
          setLoading(false);
          return;
        }
      }

      setRefreshing(true);
      const response = await fetch('/api/ai/business-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch business insights');
      }

      const data = await response.json();
      const insightsData = data.insights as BusinessInsight;
      setInsights(insightsData);
      setCachedInsights(insightsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'startup': return 'bg-blue-500';
      case 'growth': return 'bg-green-500';
      case 'scale-up': return 'bg-purple-500';
      case 'enterprise': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing business metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchInsights(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Business Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights and recommendations
          </p>
        </div>
        <Button 
          onClick={() => fetchInsights(true)} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Business Stage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Business Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge className={getStageColor(insights.businessStage)}>
              {insights.businessStage.toUpperCase()}
            </Badge>
            <span className="text-2xl font-bold">{insights.stageProgress}</span>
          </div>
          <p className="text-muted-foreground mb-4">
            {insights.currentState.summary}
          </p>
          
          {insights.currentState.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {insights.currentState.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.currentState.bottlenecks.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Bottlenecks
              </h4>
              <ul className="space-y-1">
                {insights.currentState.bottlenecks.map((bottleneck, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    • {bottleneck}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Top Priorities
          </CardTitle>
          <CardDescription>
            Focus on these to accelerate growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.topPriorities.map((priority, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{priority.priority}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(priority.impact)}>
                    {priority.impact}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {priority.timeline}
                  </Badge>
                </div>
              </div>
              <ul className="space-y-1">
                {priority.actionItems.map((item, j) => (
                  <li key={j} className="text-sm text-muted-foreground">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Infrastructure Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Infrastructure Roadmap
          </CardTitle>
          <CardDescription>
            When to upgrade your tech stack
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.infrastructureRecommendations.map((rec, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{rec.tool}</h4>
                <Badge variant={getPriorityColor(rec.priority)}>
                  {rec.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Trigger:</strong> {rec.trigger}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {rec.reasoning}
              </p>
              {rec.estimatedCost && (
                <p className="text-sm text-muted-foreground">
                  <strong>Est. Cost:</strong> {rec.estimatedCost}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Predictions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              30-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revenue</span>
              <span className="text-2xl font-bold">
                ${insights.predictions.next30Days.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Jobs</span>
              <span className="text-2xl font-bold">
                {insights.predictions.next30Days.jobs}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">New Clients</span>
              <span className="text-2xl font-bold">
                {insights.predictions.next30Days.newClients}
              </span>
            </div>
          </CardContent>
        </Card>

        {insights.predictions.next60Days && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                60-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Revenue</span>
                <span className="text-2xl font-bold">
                  ${insights.predictions.next60Days.revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Jobs</span>
                <span className="text-2xl font-bold">
                  {insights.predictions.next60Days.jobs}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New Clients</span>
                <span className="text-2xl font-bold">
                  {insights.predictions.next60Days.newClients}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Upcoming Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {insights.predictions.milestones.map((milestone, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">{milestone.milestone}</p>
                  <p className="text-sm text-muted-foreground">
                    Est. {milestone.estimatedDate}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Questions for Owner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Strategic Questions
          </CardTitle>
          <CardDescription>
            Answer these to unlock better recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.questionsForOwner.map((q, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{q.question}</h4>
                <Badge variant={q.impact === 'high' ? 'default' : 'secondary'}>
                  {q.impact} impact
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Why this matters:</strong> {q.why}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Agent Performance */}
      {insights.aiAgentPerformance && insights.aiAgentPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.aiAgentPerformance.map((agent, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-semibold">{agent.agent}</p>
                  <p className="text-sm text-muted-foreground">{agent.recommendation}</p>
                </div>
                <Badge variant="outline">{agent.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
