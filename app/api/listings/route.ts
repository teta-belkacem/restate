import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET handler for fetching all listings with search and filter functionality
 * Public route - doesn't require authentication
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    
    // Extract pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    
    // Extract filter parameters
    const propertyType = url.searchParams.get('property_type');
    const operationType = url.searchParams.get('operation_type');
    const stateId = url.searchParams.get('state_id');
    const municipalityId = url.searchParams.get('municipality_id');
    const minPrice = url.searchParams.get('min_price');
    const maxPrice = url.searchParams.get('max_price');
    const minRooms = url.searchParams.get('min_rooms');
    const minStories = url.searchParams.get('min_stories');
    const minArea = url.searchParams.get('min_area');
    const maxArea = url.searchParams.get('max_area');
    const query = url.searchParams.get('query')?.trim();
    
    // Sort parameters
    const sortBy = url.searchParams.get('sort_by') || 'created_at';
    const sortOrder = url.searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Build the query
    let listingQuery = supabase
      .from('listings')
      .select('*, states(*), municipalities(*)', { count: 'exact' })
      .eq('status', 2) // Only show approved listings (status = 2)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    // Apply filters if provided
    if (propertyType) {
      listingQuery = listingQuery.eq('property_type', parseInt(propertyType));
    }
    
    if (operationType) {
      listingQuery = listingQuery.eq('operation_type', parseInt(operationType));
    }
    
    if (stateId) {
      listingQuery = listingQuery.eq('state_id', parseInt(stateId));
    }
    
    if (municipalityId) {
      listingQuery = listingQuery.eq('municipality_id', parseInt(municipalityId));
    }
    
    if (minPrice) {
      listingQuery = listingQuery.gte('seller_price', parseInt(minPrice));
    }
    
    if (maxPrice) {
      listingQuery = listingQuery.lte('seller_price', parseInt(maxPrice));
    }
    
    if (minRooms) {
      listingQuery = listingQuery.gte('rooms', parseInt(minRooms));
    }
    
    if (minStories) {
      listingQuery = listingQuery.gte('stories', parseInt(minStories));
    }
    
    if (minArea) {
      listingQuery = listingQuery.gte('total_area', parseInt(minArea));
    }
    
    if (maxArea) {
      listingQuery = listingQuery.lte('total_area', parseInt(maxArea));
    }
    
    // Search by title
    if (query) {
      listingQuery = listingQuery.ilike('title', `%${query}%`);
    }
    
    // Execute the query
    const { data, count, error } = await listingQuery;
    
    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings', details: error.message },
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
    console.error('Error in listings route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
