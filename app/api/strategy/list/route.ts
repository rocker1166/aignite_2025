import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Fetch all finalized strategies
    const { data: strategies, error } = await supabase
      .from('finalized_strategies')
      .select(`
        id,
        name,
        type,
        status,
        priority,
        progress,
        estimated_completion,
        cost,
        roi,
        risk_level,
        scenario_source,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching strategies:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch strategies' },
        { status: 500 }
      )
    }

    // Transform data to match frontend format
    const transformedStrategies = strategies?.map((strategy: any) => ({
      id: strategy.id,
      name: strategy.name,
      type: strategy.type,
      status: strategy.status,
      priority: strategy.priority,
      progress: strategy.progress,
      estimatedCompletion: strategy.estimated_completion,
      cost: strategy.cost,
      roi: strategy.roi,
      riskLevel: strategy.risk_level,
      scenarioSource: strategy.scenario_source,
      lastUpdated: strategy.created_at
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedStrategies
    })

  } catch (error) {
    console.error('❌ Error fetching strategies list:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch strategies list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
