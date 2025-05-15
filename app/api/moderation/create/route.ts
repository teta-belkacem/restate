import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { reviewStatus } from '@/utils/constants';

/**
 * POST handler for creating a new listing review
 * Restricted route - should only be accessible to moderators
 */
export async function POST(req: NextRequest) {
  try {
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
    
    // Parse request body
    const { listing_id, status, reason } = await req.json();
    
    // Validate required fields
    if (!listing_id) {
      return NextResponse.json(
        { error: 'listing_id is required' },
        { status: 400 }
      );
    }
    
    if (status === undefined || !reviewStatus.some(s => s.id === status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Check if listing exists and is pending review
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('status')
      .eq('id', listing_id)
      .single();
    
    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    if (listing.status !== 1) {
      return NextResponse.json(
        { error: 'Listing is not in pending review status' },
        { status: 400 }
      );
    }
    
    // Create a new listing review
    const { data: reviewData, error: reviewError } = await supabase
      .from('listing_reviews')
      .insert({
        listing_id,
        moderator_id: user.id,
        status,
        reason: reason || null,
        reviewed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (reviewError) {
      console.error('Error creating listing review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to create listing review', details: reviewError.message },
        { status: 500 }
      );
    }
    
    // The listing status will be automatically updated by the database trigger
    // and a notification will be created by another trigger
    
    return NextResponse.json({
      message: 'Review created successfully',
      data: reviewData
    });
  } catch (error) {
    console.error('Error in create review route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}