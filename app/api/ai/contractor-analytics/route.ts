import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { contractorId, analysisType } = await request.json()

    // Get all contractors and their job history
    const allUsers = await db.users.getAll()
    const contractors = allUsers.filter(u => u.role === 'CONTRACTOR')
    
    // If specific contractor requested
    if (contractorId) {
      const contractor = contractors.find(c => c.id === contractorId)
      if (!contractor) {
        return NextResponse.json(
          { error: 'Contractor not found' },
          { status: 404 }
        )
      }
    }

    // Get all jobs and filter by contractor assignments
    const allJobs = await db.jobs.getAll()
    
    // Build contractor performance data
    const contractorStats = contractors.map(contractor => {
      const assignedJobs = allJobs.filter(j => j.assignedContractorId === contractor.id)
      const completedJobs = assignedJobs.filter(j => j.status === 'Completed')
      const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.contractorEarnings || 0), 0)
      
      // Calculate average response time (if we had timestamps)
      // For now, use acceptance rate
      const acceptanceRate = assignedJobs.length > 0 ? 100 : 0 // They accepted jobs they have

      return {
        id: contractor.id,
        name: contractor.name,
        skills: contractor.skills || [],
        totalJobs: assignedJobs.length,
        completedJobs: completedJobs.length,
        completionRate: assignedJobs.length > 0 
          ? Math.round((completedJobs.length / assignedJobs.length) * 100) 
          : 0,
        totalEarnings,
        averageEarnings: assignedJobs.length > 0 
          ? Math.round(totalEarnings / assignedJobs.length)
          : 0,
        acceptanceRate,
      }
    })

    const prompt = `You are an AI analytics agent for ExcelPro Washers contractor management system.

CONTRACTOR PERFORMANCE DATA:
${JSON.stringify(contractorStats, null, 2)}

AVAILABLE JOBS DATA:
${allJobs.filter(j => j.availableToContractors && !j.assignedContractorId).length} jobs currently available
${allJobs.filter(j => j.assignedContractorId).length} jobs currently assigned

TASK: Analyze contractor performance and provide actionable insights.

Analysis Type: ${analysisType || 'general'}

Provide:
1. Top Performers: Which contractors are excelling and why
2. Areas for Improvement: Contractors who need support
3. Job Assignment Recommendations: Which contractor should get which types of jobs
4. Skill Gaps: What skills are missing from the contractor pool
5. Predictions: Which contractors are likely to accept upcoming jobs fastest

Return JSON:
{
  "summary": "<executive summary of contractor performance>",
  "topPerformers": [
    {
      "contractorId": "<id>",
      "contractorName": "<name>",
      "reason": "<why they're top performer>"
    }
  ],
  "recommendations": [
    {
      "type": "<assignment|training|hiring>",
      "description": "<recommendation>",
      "priority": "<high|medium|low>"
    }
  ],
  "insights": [
    "<key insight 1>",
    "<key insight 2>"
  ],
  "skillGaps": ["<missing skill 1>", "<missing skill 2>"]
}

Return ONLY valid JSON, no markdown.`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1536,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    let analyticsData
    try {
      const cleanedText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analyticsData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse AI response as JSON')
    }

    return NextResponse.json({
      success: true,
      analytics: analyticsData,
      rawData: contractorStats, // Include raw data for reference
    })
  } catch (error) {
    console.error('Error analyzing contractors:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze contractors',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
