import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { toolDefinitions, executeTool } from '@/lib/ai/mcp-tools';
import { isRateLimited, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { verifyAdminSession } from '@/lib/session';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── System prompt ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert AI Business Advisor for ExcelPro Washers, a window cleaning and pressure washing company in Ottawa, ON.

You have FULL ACCESS to the company's CRM system through tools. You can:
- Look up clients, jobs, quotes, invoices, leads, requests, contractors
- Create new clients, jobs, quotes, and invoices
- Update statuses on jobs, quotes, invoices, and leads
- Get revenue analytics and pipeline overviews
- Convert leads to clients
- View call logs and voice bookings
- Check email subscriber stats
- **SEND EMAILS** via Resend: custom emails, quote emails, follow-ups, and special offers

IMPORTANT RULES:
1. USE TOOLS to answer data questions — don't guess. Call list_clients, list_jobs, get_revenue_summary, etc. to get real data.
2. ALWAYS CONFIRM before creating/modifying records. Show the user what you plan to do and ask "Should I go ahead?"
3. After making changes, summarize what was done with the record ID.
4. When a user asks about something vague, search for it (use search_clients, list_leads, etc.).
5. For complex operations (e.g., "convert this lead and schedule a job"), break into steps and confirm each.
6. **EMAIL SAFETY**: ALWAYS show the recipient, subject, and a summary of the email content BEFORE sending. Wait for explicit confirmation ("yes", "send it", "go ahead"). Never send emails without admin approval.
7. For emails, prefer the pre-built templates (send_quote_email, send_follow_up_email, send_special_offer_email) over raw send_email when they fit. Use send_email for custom campaigns or unique content.

BUSINESS CONTEXT:
- Ottawa-based window cleaning & pressure washing company
- Services: Window Cleaning, Pressure Washing, Soft Washing, Gutter Cleaning, Roof Cleaning
- Uses AI lead qualification (hot/warm/cold scoring)
- Has contractor portal for job assignment
- Stripe for payments, Resend for email, Twilio for voice

YOUR PERSONALITY:
- Conversational, friendly, and strategic
- Reference real numbers from the tools
- Use **bold** for key figures and actions
- Use bullet lists and numbered steps
- Occasional emojis for engagement
- Aim for 200-400 words unless more detail is needed
- End with a clear next step or question

CURRENT DATE: ${new Date().toISOString().split('T')[0]}`;

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────
    const adminSession = request.cookies.get('admin_session')?.value;
    if (!verifyAdminSession(adminSession)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Rate limit: 10 req/min ───────────────────────────────────
    const clientIp = getClientIp(request);
    if (isRateLimited(`advisor-${clientIp}`, 10, 60_000)) {
      return rateLimitResponse(60);
    }

    const { message, conversationHistory } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // ── Build multi-turn messages ────────────────────────────────
    const messages: Anthropic.Messages.MessageParam[] = [];

    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-8)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: 'user', content: message });

    // Ensure alternating roles (Anthropic requirement)
    const cleanMessages: Anthropic.Messages.MessageParam[] = [];
    for (const msg of messages) {
      if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].role !== msg.role) {
        cleanMessages.push(msg);
      } else {
        const last = cleanMessages[cleanMessages.length - 1];
        if (typeof last.content === 'string' && typeof msg.content === 'string') {
          last.content = last.content + '\n\n' + msg.content;
        }
      }
    }

    // ── Agentic tool-use loop ────────────────────────────────────
    // The AI may call tools multiple times before producing a final
    // text response. We loop until stop_reason is "end_turn".
    let currentMessages = [...cleanMessages];
    let finalText = '';
    const toolActions: { tool: string; input: any; result: string }[] = [];
    const MAX_ITERATIONS = 8;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: currentMessages,
        tools: toolDefinitions,
      });

      // Collect text and tool_use blocks
      const textParts: string[] = [];
      const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          textParts.push(block.text);
        } else if (block.type === 'tool_use') {
          toolUseBlocks.push(block);
        }
      }

      if (textParts.length > 0) {
        finalText += textParts.join('\n');
      }

      // If no tool calls or end_turn, we're done
      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        break;
      }

      // Execute tool calls
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolCall of toolUseBlocks) {
        console.log(`[MCP] Executing: ${toolCall.name}`, toolCall.input);
        const result = await executeTool(
          toolCall.name,
          toolCall.input as Record<string, any>
        );

        toolActions.push({
          tool: toolCall.name,
          input: toolCall.input,
          result: result.success ? '✅' : `❌ ${result.error}`,
        });

        // Truncate large results to avoid context overflow
        let resultContent = JSON.stringify(result);
        if (resultContent.length > 8000) {
          if (result.data && Array.isArray(result.data)) {
            const summary = {
              success: true,
              totalCount: result.data.length,
              first5: result.data.slice(0, 5),
              note: `Showing 5 of ${result.data.length} results. Ask to narrow down if needed.`,
            };
            resultContent = JSON.stringify(summary);
          }
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: resultContent,
        });
      }

      // Append assistant response + tool results for next iteration
      currentMessages.push({
        role: 'assistant',
        content: response.content,
      });
      currentMessages.push({
        role: 'user',
        content: toolResults,
      });
    }

    // ── Append write-action summary ──────────────────────────────
    let responseText = finalText;

    if (toolActions.length > 0) {
      const writeActions = toolActions.filter(a =>
        a.tool.startsWith('create_') ||
        a.tool.startsWith('update_') ||
        a.tool.startsWith('convert_')
      );
      if (writeActions.length > 0) {
        responseText += '\n\n---\n*Actions taken:*\n';
        for (const action of writeActions) {
          responseText += `- **${action.tool}** ${action.result}\n`;
        }
      }
    }

    // Return as readable stream (frontend expects streaming response)
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(responseText));
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Business Advisor Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get advisor response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
