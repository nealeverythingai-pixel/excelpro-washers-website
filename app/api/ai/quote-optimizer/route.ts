import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { serviceType, details, clientAddress, urgency } = await request.json()

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type is required' },
        { status: 400 }
      )
    }

    // Get historical quotes for reference
    const allQuotes = await db.quotes.getAll()
    const relevantQuotes = allQuotes.filter(q => 
      q.title.toLowerCase().includes(serviceType.toLowerCase())
    ).slice(0, 5) // Last 5 similar quotes

    const historicalContext = relevantQuotes.length > 0
      ? `Historical quotes for similar services:\n${relevantQuotes.map(q => 
          `- ${q.title}: $${q.total}`
        ).join('\n')}`
      : 'No historical data available for this service type.'

    const prompt = `You are a professional quote optimizer for ExcelPro Washers, a pressure washing and exterior cleaning company in Ottawa, Canada.

TASK: Generate an optimized quote with professional line items and pricing.

SERVICE DETAILS:
- Service Type: ${serviceType}
- Details: ${details || 'Standard service'}
- Location: ${clientAddress || 'Ottawa area'}
- Urgency: ${urgency || 'Standard timing'}

${historicalContext}

PRICING GUIDELINES:
- Window Cleaning: $5-10 per window (interior + exterior)
- Driveway Pressure Washing: $150-300 (based on size)
- Gutter Cleaning: $150-250 (based on height/length)
- Roof Cleaning: $300-600 (based on size/pitch)
- Deck/Patio Cleaning: $200-400 (based on square footage)
- Siding Washing: $250-500 (based on house size)

Consider:
- Ottawa market rates (CAD)
- Seasonal demand (winter vs summer)
- Urgency (add 15-25% for rush jobs)
- Property size estimates from details
- Professional quality standards

Generate a JSON response with:
{
  "recommendedTotal": <number>,
  "lineItems": [
    {
      "description": "<professional description>",
      "quantity": <number>,
      "unitPrice": <number>
    }
  ],
  "reasoning": "<why this pricing is optimal>",
  "suggestions": "<any additional recommendations>"
}

BE SPECIFIC with line items. Example:
- "Pressure wash driveway - 400 sq ft"
- "Clean and flush 60 ft of gutters"
- "Wash exterior windows - 15 windows (interior + exterior)"

Return ONLY valid JSON, no markdown formatting.`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse Claude's JSON response
    let quoteData
    try {
      // Remove markdown code blocks if present
      const cleanedText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      quoteData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse AI response as JSON')
    }

    // Calculate total from line items
    const calculatedTotal = quoteData.lineItems.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
      0
    )

    return NextResponse.json({
      success: true,
      quote: {
        recommendedTotal: Math.round(calculatedTotal),
        lineItems: quoteData.lineItems,
        reasoning: quoteData.reasoning,
        suggestions: quoteData.suggestions,
      },
      message: 'Quote optimized successfully',
    })
  } catch (error) {
    console.error('Error optimizing quote:', error)
    return NextResponse.json(
      {
        error: 'Failed to optimize quote',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
