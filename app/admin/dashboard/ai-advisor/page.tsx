'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles, User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Show me today's pipeline overview",
  "Show me all my Yelp leads",
  "How's my revenue this month?",
  "Compare lead sources — which channel converts best?",
  "Email a spring cleaning promo to my top clients",
  "How many Yelp leads came in this week?",
  "Convert my top lead to a client",
  "Send a follow-up to leads who haven't booked",
];

// ── Simple markdown → HTML renderer ─────────────────────────────────
function renderMarkdown(text: string): string {
  // Escape HTML first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `<pre class="bg-gray-900 text-green-300 text-xs p-3 rounded-md my-2 overflow-x-auto"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>');

  // Headers (process before bold so ** in headers works)
  html = html.replace(/^#### (.+)$/gm, '<h5 class="font-semibold text-sm mt-3 mb-1">$1</h5>');
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-semibold text-base mt-3 mb-1">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-semibold text-lg mt-4 mb-1">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="font-bold text-xl mt-4 mb-2">$1</h2>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-3 border-gray-300 dark:border-gray-600" />');

  // Numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-5 list-decimal text-sm leading-relaxed">$2</li>');

  // Bullet lists (- or *)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-5 list-disc text-sm leading-relaxed">$1</li>');

  // Wrap consecutive <li> items — bullets
  html = html.replace(/((?:<li class="ml-5 list-disc[^>]*>.*?<\/li>\n?)+)/g, '<ul class="my-1">$1</ul>');
  // Wrap consecutive <li> items — numbered
  html = html.replace(/((?:<li class="ml-5 list-decimal[^>]*>.*?<\/li>\n?)+)/g, '<ol class="my-1">$1</ol>');

  // Paragraphs: double newline → paragraph break
  html = html.replace(/\n\n/g, '</p><p class="mb-2">');
  // Single newlines → <br> (but not inside pre/code)
  html = html.replace(/\n/g, '<br/>');

  // Wrap in paragraph
  html = `<p class="mb-2">${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p class="mb-2"><\/p>/g, '');

  return html;
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI Business Advisor — now with **full CRM access**. I can look up clients, jobs, quotes, invoices, and leads in real time. I can also **take actions** for you: create clients, schedule jobs, generate quotes, update statuses, and convert leads. Just tell me what you need!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/ai/business-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.slice(-8)
        })
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // ── Read streaming response ─────────────────────────────────
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // ── Finalize message ────────────────────────────────────────
      setStreamingContent('');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fullContent,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      setStreamingContent('');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: error instanceof Error
            ? `⚠️ ${error.message}`
            : 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Business Advisor</h1>
            <p className="text-sm text-muted-foreground">
              AI advisor with full CRM access — ask questions or give commands
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div
                      className="text-sm prose prose-sm dark:prose-invert max-w-none [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_p]:mb-2 [&_p:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {loading && streamingContent && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 max-w-[80%]">
                <div className="inline-block p-3 rounded-lg bg-muted">
                  <div
                    className="text-sm prose prose-sm dark:prose-invert max-w-none [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator (before stream starts) */}
          {loading && !streamingContent && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs text-muted-foreground">Querying CRM & thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Questions (show only at start) */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(question)}
                  disabled={loading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your business..."
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
              disabled={loading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
