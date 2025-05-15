import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET handler for fetching all listings pending review (status = 1)
 * Restricted route - should only be accessible to moderators
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Extract pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Verify user is authenticated and has moderator permissions
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has moderator permission (permissions = 2)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData || userData.permissions !== 2) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Fetch listings with status = 1 (pending review)
    const { data, count, error } = await supabase
      .from('listings')
      .select('*, users!inner(first_name, last_name, phone), states(*), municipalities(*)', { count: 'exact' })
      .eq('status', 1) // Only fetch listings pending review
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching pending listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending listings', details: error.message },
        { status: 500 }
      );
    }
    
    // Format the response
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
    console.error('Error in pending listings route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}