import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET handler for fetching listings by user ID
 * Public route - doesn't require authentication
 */
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    
    // Get query parameters for filtering
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Build the query
    let query = supabase
      .from('listings')
      .select('*, states(*), municipalities(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply status filter if provided
    if (status !== null) {
      query = query.eq('status', parseInt(status));
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching user listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings', details: error.message },
        { status: 500 }
      );
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('listings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter to count query if provided
    if (status !== null) {
      countQuery = countQuery.eq('status', parseInt(status));
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error counting user listings:', countError);
      // Continue with the data we have
    }
    
    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in get user listings route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
